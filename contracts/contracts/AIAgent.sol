// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./BettingContract.sol";

contract AIAgent is Ownable {
    BettingContract public bettingContract;
    string public constant COINGECKO_API = "https://api.coingecko.com/api/v3";
    uint256 public lastUpdateTime;
    uint256 public constant PRICE_IMPACT = 100; // 1% price impact for prediction

    event PredictionMade(uint256 timestamp, uint256 currentPrice, uint256 prediction);
    event MarketSettled(uint256 marketId, uint256 timestamp, uint256 actualPrice);
    event BettingContractUpdated(address indexed newBettingContract);

    constructor(address _bettingContract) {
        bettingContract = BettingContract(_bettingContract);
        lastUpdateTime = block.timestamp;
    }

    function updateBettingContract(address _newBettingContract) external onlyOwner {
        require(_newBettingContract != address(0), "Invalid betting contract address");
        bettingContract = BettingContract(_newBettingContract);
        emit BettingContractUpdated(_newBettingContract);
    }

    function makePrediction() external onlyOwner {
        // In a real implementation, this would fetch the actual BTC price from CoinGecko
        // For now, we'll simulate a price and prediction
        uint256 currentPrice = 50000 ether; // Simulated current price
        uint256 prediction = currentPrice + (currentPrice * PRICE_IMPACT / 10000); // 1% higher
        
        // Create a new market with the prediction
        bettingContract.createMarket(prediction);
        
        lastUpdateTime = block.timestamp;
        emit PredictionMade(block.timestamp, currentPrice, prediction);
    }

    // This function would be called by an off-chain service to update the price
    function updatePrice(uint256 currentPrice) external onlyOwner {
        uint256 prediction = currentPrice + (currentPrice * PRICE_IMPACT / 10000); // 1% higher
        bettingContract.createMarket(prediction);
        
        lastUpdateTime = block.timestamp;
        emit PredictionMade(block.timestamp, currentPrice, prediction);
    }

    // Function to settle the current market with the actual price
    function settleMarket(uint256 marketId, uint256 actualPrice) external onlyOwner {
        bettingContract.settleMarket(marketId, actualPrice);
        emit MarketSettled(marketId, block.timestamp, actualPrice);
    }
} 