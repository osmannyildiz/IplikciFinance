//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockWBTC
 * @dev Mock Wrapped Bitcoin token for testing
 * WBTC typically has 8 decimals like Bitcoin
 */
contract MockWBTC is ERC20, Ownable {
    constructor() ERC20("Wrapped Bitcoin", "WBTC") Ownable(msg.sender) {
        // Mint initial supply to deployer (1000 WBTC)
        _mint(msg.sender, 1000 * 10**decimals());
    }

    /**
     * @dev Returns 8 decimals to match real WBTC
     */
    function decimals() public pure override returns (uint8) {
        return 8;
    }

    /**
     * @dev Allows anyone to mint tokens for testing purposes
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (in smallest units)
     */
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    /**
     * @dev Owner can burn tokens if needed
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }
}

