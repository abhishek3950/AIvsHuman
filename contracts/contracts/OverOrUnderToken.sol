// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OverOrUnderToken is ERC20, Ownable {
    IERC20 public usdc;
    uint256 public constant TOKEN_PRICE = 0.01 ether; // 0.01 USDC per token
    address public treasury;
    address public usdcWallet;

    event TokensPurchased(address indexed buyer, uint256 amount, uint256 usdcAmount);
    event TreasuryUpdated(address indexed newTreasury);
    event UsdcWalletUpdated(address indexed newUsdcWallet);

    constructor(
        address _usdc,
        address _treasury,
        address _usdcWallet
    ) ERC20("OverOrUnder", "OU") {
        _transferOwnership(msg.sender);
        usdc = IERC20(_usdc);
        treasury = _treasury;
        usdcWallet = _usdcWallet;
        _mint(msg.sender, 100_000_000_000 ether); // 100B tokens minted to owner
    }

    function buyTokens(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        uint256 usdcAmount = amount * TOKEN_PRICE;
        require(usdc.transferFrom(msg.sender, usdcWallet, usdcAmount), "USDC transfer failed");
        _transfer(treasury, msg.sender, amount);
        emit TokensPurchased(msg.sender, amount, usdcAmount);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function setUsdcWallet(address _usdcWallet) external onlyOwner {
        require(_usdcWallet != address(0), "Invalid USDC wallet address");
        usdcWallet = _usdcWallet;
        emit UsdcWalletUpdated(_usdcWallet);
    }
} 