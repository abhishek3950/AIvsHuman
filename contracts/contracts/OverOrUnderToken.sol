// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract OverOrUnderToken is ERC20, Ownable {
    IERC20 public usdc;
    uint256 public constant TOKEN_PRICE = 0.01 ether; // 0.01 USDC per token
    uint256 public constant FAUCET_AMOUNT = 10 ether; // 10 tokens
    uint256 public constant FAUCET_COOLDOWN = 24 hours;
    mapping(address => uint256) public lastFaucetClaim;
    address public treasury;
    address public usdcWallet;

    event TokensPurchased(address indexed buyer, uint256 amount, uint256 usdcAmount);
    event FaucetClaimed(address indexed user, uint256 amount);
    event TreasuryUpdated(address indexed newTreasury);
    event UsdcWalletUpdated(address indexed newUsdcWallet);

    constructor(
        address _usdc,
        address _treasury,
        address _usdcWallet
    ) ERC20("OverOrUnder", "OU") Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        treasury = _treasury;
        usdcWallet = _usdcWallet;
        _mint(address(this), 100_000_000_000 ether); // 100B tokens
    }

    function buyTokens(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        uint256 usdcAmount = amount * TOKEN_PRICE;
        require(usdc.transferFrom(msg.sender, usdcWallet, usdcAmount), "USDC transfer failed");
        _transfer(address(this), msg.sender, amount);
        emit TokensPurchased(msg.sender, amount, usdcAmount);
    }

    function claimFaucet() external {
        require(block.timestamp >= lastFaucetClaim[msg.sender] + FAUCET_COOLDOWN, "Faucet cooldown not over");
        require(balanceOf(address(this)) >= FAUCET_AMOUNT, "Insufficient faucet balance");
        
        lastFaucetClaim[msg.sender] = block.timestamp;
        _transfer(address(this), msg.sender, FAUCET_AMOUNT);
        emit FaucetClaimed(msg.sender, FAUCET_AMOUNT);
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

    function getFaucetClaimTime(address user) external view returns (uint256) {
        return lastFaucetClaim[user] + FAUCET_COOLDOWN;
    }
} 