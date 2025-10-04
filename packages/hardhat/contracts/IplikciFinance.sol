//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract IplikciFinance is Ownable {
    // Asset types
    enum Asset { MON, WBTC, USDC }

    // Token contracts
    IERC20 public wbtcToken;
    IERC20 public usdcToken;

    // Rate parameters (in basis points, 10000 = 100%)
    uint256 public supplyEarnBps = 800; // 8% APY for suppliers
    uint256 public borrowCollateralBps = 12000; // 120% collateral required
    uint256 public borrowFeeBps = 1000; // 10% fee on borrowed amount

    // Fixed prices in USD (with 18 decimals for precision)
    // MON = $1, WBTC = $60,000, USDC = $1
    mapping(Asset => uint256) public assetPrices;

    // User positions per asset
    struct SupplyPosition {
        uint256 amount;
        uint256 timestamp;
    }

    struct BorrowPosition {
        Asset borrowAsset;
        Asset collateralAsset;
        uint256 collateralAmount;
        uint256 borrowedAmount;
        uint256 timestamp;
    }

    // User => Asset => SupplyPosition
    mapping(address => mapping(Asset => SupplyPosition)) public supplyPositions;
    mapping(address => BorrowPosition) public borrowPositions;
    mapping(address => uint256) public creditScores;

    // Total supplied per asset
    mapping(Asset => uint256) public totalSupplied;
    mapping(Asset => uint256) public totalBorrowed;

    // Events
    event AssetSupplied(address indexed user, Asset asset, uint256 amount, uint256 creditScore);
    event AssetWithdrawn(address indexed user, Asset asset, uint256 amount, uint256 earned);
    event AssetBorrowed(address indexed user, Asset borrowAsset, Asset collateralAsset, uint256 collateral, uint256 borrowed, uint256 fee);
    event LoanRepaid(address indexed user, uint256 amount, uint256 creditScore);

    constructor(address _wbtc, address _usdc) Ownable(msg.sender) {
        wbtcToken = IERC20(_wbtc);
        usdcToken = IERC20(_usdc);
        
        // Set fixed prices (in USD with 18 decimals)
        assetPrices[Asset.MON] = 1 ether; // $1
        assetPrices[Asset.WBTC] = 60000 ether; // $60,000
        assetPrices[Asset.USDC] = 1 ether; // $1
    }

    // HELPER FUNCTIONS

    function getToken(Asset asset) internal view returns (IERC20) {
        if (asset == Asset.WBTC) return wbtcToken;
        if (asset == Asset.USDC) return usdcToken;
        revert("Invalid asset");
    }

    function getAssetDecimals(Asset asset) public pure returns (uint8) {
        if (asset == Asset.MON) return 18;
        if (asset == Asset.WBTC) return 8;
        if (asset == Asset.USDC) return 6;
        return 18;
    }

    function convertAssetValue(uint256 amount, Asset fromAsset, Asset toAsset) public view returns (uint256) {
        // Convert amount from one asset to another based on prices
        uint256 fromPrice = assetPrices[fromAsset];
        uint256 toPrice = assetPrices[toAsset];
        uint256 fromDecimals = getAssetDecimals(fromAsset);
        uint256 toDecimals = getAssetDecimals(toAsset);
        
        // value in USD = amount * price / (10^decimals)
        // Convert to same decimals (18) for calculation
        uint256 valueInUSD = (amount * fromPrice * 1e18) / (10**fromDecimals * 1 ether);
        
        // Convert USD value to target asset
        uint256 targetAmount = (valueInUSD * 10**toDecimals * 1 ether) / (toPrice * 1e18);
        return targetAmount;
    }

    // SUPPLY FUNCTIONS

    function supply(Asset asset, uint256 amount) public payable {
        if (asset == Asset.MON) {
            require(msg.value == amount && amount > 0, "Invalid MON amount");
        } else {
            require(amount > 0, "Amount must be greater than 0");
            IERC20 token = getToken(asset);
            require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        }

        SupplyPosition storage position = supplyPositions[msg.sender][asset];

        // If user already has a position, add earned interest before updating
        if (position.amount > 0) {
            uint256 earned = calculateEarned(msg.sender, asset);
            position.amount += earned;
        }

        position.amount += amount;
        position.timestamp = block.timestamp;
        totalSupplied[asset] += amount;

        // Increase credit score
        creditScores[msg.sender] += 1;

        emit AssetSupplied(msg.sender, asset, amount, creditScores[msg.sender]);
    }

    function withdraw(Asset asset, uint256 amount) public {
        SupplyPosition storage position = supplyPositions[msg.sender][asset];
        require(position.amount > 0, "No supply position");

        uint256 earned = calculateEarned(msg.sender, asset);
        uint256 totalAvailable = position.amount + earned;

        require(amount <= totalAvailable, "Insufficient balance");

        // Update position
        if (amount == totalAvailable) {
            delete supplyPositions[msg.sender][asset];
        } else {
            position.amount = totalAvailable - amount;
            position.timestamp = block.timestamp;
        }

        uint256 principalWithdrawn = amount > position.amount ? position.amount : amount;
        totalSupplied[asset] -= principalWithdrawn;

        // Transfer assets
        if (asset == Asset.MON) {
            require(address(this).balance >= amount, "Insufficient contract balance");
            payable(msg.sender).transfer(amount);
        } else {
            IERC20 token = getToken(asset);
            require(token.balanceOf(address(this)) >= amount, "Insufficient contract balance");
            require(token.transfer(msg.sender, amount), "Transfer failed");
        }

        emit AssetWithdrawn(msg.sender, asset, amount, earned);
    }

    function calculateEarned(address user, Asset asset) public view returns (uint256) {
        SupplyPosition memory position = supplyPositions[user][asset];
        if (position.amount == 0) return 0;

        uint256 timeElapsed = block.timestamp - position.timestamp;
        // Simple interest calculation: (amount * rate * time) / (365 days * 10000)
        uint256 earned = (position.amount * supplyEarnBps * timeElapsed) / (365 days * 10000);
        return earned;
    }

    // BORROW FUNCTIONS

    function borrow(Asset borrowAsset, uint256 borrowAmount, Asset collateralAsset, uint256 collateralAmount) public payable {
        require(borrowAmount > 0, "Borrow amount must be greater than 0");
        require(borrowPositions[msg.sender].borrowedAmount == 0, "Already have active loan");
        require(borrowAsset != collateralAsset, "Borrow and collateral must be different assets");

        // Convert borrow amount to collateral asset value and check 120% collateral
        uint256 requiredCollateral = convertAssetValue(borrowAmount, borrowAsset, collateralAsset);
        requiredCollateral = (requiredCollateral * borrowCollateralBps) / 10000;
        require(collateralAmount >= requiredCollateral, "Insufficient collateral");

        // Handle collateral deposit
        if (collateralAsset == Asset.MON) {
            require(msg.value == collateralAmount, "Invalid MON collateral");
        } else {
            IERC20 token = getToken(collateralAsset);
            require(token.transferFrom(msg.sender, address(this), collateralAmount), "Collateral transfer failed");
        }

        // Calculate fee
        uint256 fee = (borrowAmount * borrowFeeBps) / 10000;
        uint256 amountToTransfer = borrowAmount - fee;

        // Check liquidity
        if (borrowAsset == Asset.MON) {
            require(address(this).balance >= borrowAmount, "Insufficient liquidity");
        } else {
            IERC20 token = getToken(borrowAsset);
            require(token.balanceOf(address(this)) >= borrowAmount, "Insufficient liquidity");
        }

        // Save borrow position
        borrowPositions[msg.sender] = BorrowPosition({
            borrowAsset: borrowAsset,
            collateralAsset: collateralAsset,
            collateralAmount: collateralAmount,
            borrowedAmount: borrowAmount,
            timestamp: block.timestamp
        });

        totalBorrowed[borrowAsset] += borrowAmount;

        // Transfer borrowed amount minus fee
        if (borrowAsset == Asset.MON) {
            payable(msg.sender).transfer(amountToTransfer);
        } else {
            IERC20 token = getToken(borrowAsset);
            require(token.transfer(msg.sender, amountToTransfer), "Borrow transfer failed");
        }

        emit AssetBorrowed(msg.sender, borrowAsset, collateralAsset, collateralAmount, borrowAmount, fee);
    }

    function repay() public payable {
        BorrowPosition storage position = borrowPositions[msg.sender];
        require(position.borrowedAmount > 0, "No active loan");

        Asset borrowAsset = position.borrowAsset;
        Asset collateralAsset = position.collateralAsset;
        uint256 repayAmount = position.borrowedAmount;

        // Handle repayment
        if (borrowAsset == Asset.MON) {
            require(msg.value >= repayAmount, "Insufficient repayment");
        } else {
            IERC20 token = getToken(borrowAsset);
            require(token.transferFrom(msg.sender, address(this), repayAmount), "Repay transfer failed");
        }

        uint256 collateralToReturn = position.collateralAmount;
        totalBorrowed[borrowAsset] -= repayAmount;

        // Delete position
        delete borrowPositions[msg.sender];

        // Increase credit score
        creditScores[msg.sender] += 2;

        // Return collateral
        if (collateralAsset == Asset.MON) {
            payable(msg.sender).transfer(collateralToReturn);
            // Return excess MON if overpaid
            if (borrowAsset == Asset.MON && msg.value > repayAmount) {
                payable(msg.sender).transfer(msg.value - repayAmount);
            }
        } else {
            IERC20 token = getToken(collateralAsset);
            require(token.transfer(msg.sender, collateralToReturn), "Collateral return failed");
        }

        emit LoanRepaid(msg.sender, repayAmount, creditScores[msg.sender]);
    }

    // VIEW FUNCTIONS

    function getSupplyPosition(address user, Asset asset) public view returns (uint256 amount, uint256 earned, uint256 timestamp) {
        SupplyPosition memory position = supplyPositions[user][asset];
        return (position.amount, calculateEarned(user, asset), position.timestamp);
    }

    function getBorrowPosition(address user) public view returns (Asset borrowAsset, Asset collateralAsset, uint256 collateral, uint256 borrowed, uint256 timestamp) {
        BorrowPosition memory position = borrowPositions[user];
        return (position.borrowAsset, position.collateralAsset, position.collateralAmount, position.borrowedAmount, position.timestamp);
    }

    function getAvailableLiquidity(Asset asset) public view returns (uint256) {
        if (asset == Asset.MON) {
            return address(this).balance;
        } else {
            IERC20 token = getToken(asset);
            return token.balanceOf(address(this));
        }
    }

    // ADMIN FUNCTIONS

    function setSupplyEarnBps(uint256 newRate) public onlyOwner {
        supplyEarnBps = newRate;
    }

    function setBorrowCollateralBps(uint256 newRate) public onlyOwner {
        borrowCollateralBps = newRate;
    }

    function setBorrowFeeBps(uint256 newRate) public onlyOwner {
        borrowFeeBps = newRate;
    }

    function setAssetPrice(Asset asset, uint256 priceInUSD) public onlyOwner {
        assetPrices[asset] = priceInUSD;
    }

    receive() external payable {}
}