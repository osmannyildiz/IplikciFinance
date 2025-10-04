//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract IplikciFinance is Ownable {
    // Rate parameters (in basis points, 10000 = 100%)
    uint256 public supplyMonEarnBps = 800; // 8% APY for suppliers
    uint256 public borrowMonCollateralBps = 12000; // 120% collateral required
    uint256 public borrowMonFeeBps = 1000; // 10% fee on borrowed amount

    // User positions
    struct SupplyPosition {
        uint256 amount;
        uint256 timestamp;
    }

    struct BorrowPosition {
        uint256 collateralAmount;
        uint256 borrowedAmount;
        uint256 timestamp;
    }

    mapping(address => SupplyPosition) public supplyPositions;
    mapping(address => BorrowPosition) public borrowPositions;
    mapping(address => uint256) public creditScores;

    uint256 public totalSupplied;
    uint256 public totalBorrowed;

    // Events
    event MonSupplied(address indexed user, uint256 amount, uint256 creditScore);
    event MonWithdrawn(address indexed user, uint256 amount, uint256 earned);
    event MonBorrowed(address indexed user, uint256 collateral, uint256 borrowed, uint256 fee);
    event MonRepaid(address indexed user, uint256 amount, uint256 creditScore);

    constructor() Ownable(msg.sender) {}

    // SUPPLY FUNCTIONS

    function supplyMon() public payable {
        require(msg.value > 0, "Amount must be greater than 0");

        SupplyPosition storage position = supplyPositions[msg.sender];

        // If user already has a position, add earned interest before updating
        if (position.amount > 0) {
            uint256 earned = calculateEarned(msg.sender);
            position.amount += earned;
        }

        position.amount += msg.value;
        position.timestamp = block.timestamp;
        totalSupplied += msg.value;

        // Increase credit score
        creditScores[msg.sender] += 1;

        emit MonSupplied(msg.sender, msg.value, creditScores[msg.sender]);
    }

    function withdrawMon(uint256 amount) public {
        SupplyPosition storage position = supplyPositions[msg.sender];
        require(position.amount > 0, "No supply position");

        uint256 earned = calculateEarned(msg.sender);
        uint256 totalAvailable = position.amount + earned;

        require(amount <= totalAvailable, "Insufficient balance");
        require(address(this).balance >= amount, "Insufficient contract balance");

        // Update position
        if (amount == totalAvailable) {
            delete supplyPositions[msg.sender];
        } else {
            position.amount = totalAvailable - amount;
            position.timestamp = block.timestamp;
        }

        totalSupplied -= (amount > position.amount ? position.amount : amount);

        payable(msg.sender).transfer(amount);

        emit MonWithdrawn(msg.sender, amount, earned);
    }

    function calculateEarned(address user) public view returns (uint256) {
        SupplyPosition memory position = supplyPositions[user];
        if (position.amount == 0) return 0;

        uint256 timeElapsed = block.timestamp - position.timestamp;
        // Simple interest calculation: (amount * rate * time) / (365 days * 10000)
        uint256 earned = (position.amount * supplyMonEarnBps * timeElapsed) / (365 days * 10000);
        return earned;
    }

    // BORROW FUNCTIONS

    function borrowMon(uint256 borrowAmount) public payable {
        require(borrowAmount > 0, "Borrow amount must be greater than 0");
        require(borrowPositions[msg.sender].borrowedAmount == 0, "Already have active loan");

        // Calculate required collateral (e.g., 120% of borrow amount)
        uint256 requiredCollateral = (borrowAmount * borrowMonCollateralBps) / 10000;
        require(msg.value >= requiredCollateral, "Insufficient collateral");

        // Calculate fee (e.g., 10% of borrowed amount)
        uint256 fee = (borrowAmount * borrowMonFeeBps) / 10000;
        uint256 amountToTransfer = borrowAmount - fee;

        require(address(this).balance >= borrowAmount, "Insufficient liquidity");

        // Save borrow position
        borrowPositions[msg.sender] = BorrowPosition({
            collateralAmount: msg.value,
            borrowedAmount: borrowAmount,
            timestamp: block.timestamp
        });

        totalBorrowed += borrowAmount;

        // Transfer borrowed amount minus fee
        payable(msg.sender).transfer(amountToTransfer);

        emit MonBorrowed(msg.sender, msg.value, borrowAmount, fee);
    }

    function repayMon() public payable {
        BorrowPosition storage position = borrowPositions[msg.sender];
        require(position.borrowedAmount > 0, "No active loan");
        require(msg.value >= position.borrowedAmount, "Insufficient repayment amount");

        uint256 collateralToReturn = position.collateralAmount;
        uint256 excessRepayment = msg.value - position.borrowedAmount;

        totalBorrowed -= position.borrowedAmount;

        // Delete position
        delete borrowPositions[msg.sender];

        // Increase credit score
        creditScores[msg.sender] += 2; // Repaying increases credit more

        // Return collateral and excess payment
        uint256 totalReturn = collateralToReturn + excessRepayment;
        if (totalReturn > 0) {
            payable(msg.sender).transfer(totalReturn);
        }

        emit MonRepaid(msg.sender, msg.value, creditScores[msg.sender]);
    }

    // VIEW FUNCTIONS

    function getSupplyPosition(address user) public view returns (uint256 amount, uint256 earned, uint256 timestamp) {
        SupplyPosition memory position = supplyPositions[user];
        return (position.amount, calculateEarned(user), position.timestamp);
    }

    function getBorrowPosition(address user) public view returns (uint256 collateral, uint256 borrowed, uint256 timestamp) {
        BorrowPosition memory position = borrowPositions[user];
        return (position.collateralAmount, position.borrowedAmount, position.timestamp);
    }

    // ADMIN FUNCTIONS

    function setSupplyMonEarnBps(uint256 newRate) public onlyOwner {
        supplyMonEarnBps = newRate;
    }

    function setBorrowMonCollateralBps(uint256 newRate) public onlyOwner {
        borrowMonCollateralBps = newRate;
    }

    function setBorrowMonFeeBps(uint256 newRate) public onlyOwner {
        borrowMonFeeBps = newRate;
    }

    // Emergency withdraw for owner
    function emergencyWithdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    receive() external payable {}
}