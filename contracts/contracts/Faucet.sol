// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Faucet is Ownable {
    IERC20 public token;
    uint256 public amount = 100 * 10**18; // 100 tokens
    uint256 public cooldown = 24 hours;
    mapping(address => uint256) public lastRequest;

    event TokensRequested(address indexed user, uint256 amount);

    constructor(address _token) {
        token = IERC20(_token);
        _transferOwnership(msg.sender);
    }

    function requestTokens() external {
        require(
            block.timestamp >= lastRequest[msg.sender] + cooldown,
            "Please wait before requesting more tokens"
        );
        require(
            token.balanceOf(address(this)) >= amount,
            "Faucet is empty"
        );

        lastRequest[msg.sender] = block.timestamp;
        require(
            token.transfer(msg.sender, amount),
            "Transfer failed"
        );

        emit TokensRequested(msg.sender, amount);
    }

    function setAmount(uint256 _amount) external onlyOwner {
        amount = _amount;
    }

    function setCooldown(uint256 _cooldown) external onlyOwner {
        cooldown = _cooldown;
    }

    function withdrawTokens(uint256 _amount) external onlyOwner {
        require(
            token.transfer(owner(), _amount),
            "Transfer failed"
        );
    }
} 