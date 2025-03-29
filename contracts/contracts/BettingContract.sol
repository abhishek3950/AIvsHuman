// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./OverOrUnderToken.sol";

contract BettingContract is Ownable, ReentrancyGuard {
    OverOrUnderToken public token;
    
    struct Market {
        uint256 id;
        uint256 startTime;
        uint256 endTime;
        uint256 aiPrediction;
        uint256 actualPrice;
        uint256 totalOverBets;
        uint256 totalUnderBets;
        bool settled;
        mapping(address => uint256) overBets;
        mapping(address => uint256) underBets;
        mapping(address => bool) hasClaimed;
    }

    uint256 public constant MARKET_DURATION = 5 minutes;
    uint256 public constant BETTING_WINDOW = 4 minutes;
    uint256 public constant MIN_BET = 10 ether;
    uint256 public constant MAX_BET = 100 ether;
    uint256 public constant MAX_TOTAL_BET = 10000 ether;
    uint256 public constant PLATFORM_FEE = 10; // 10%
    uint256 public constant INITIAL_LIQUIDITY = 100 ether;

    Market[] public markets;
    uint256 public currentMarketId;
    address public aiAgent;
    address public treasury;

    event MarketCreated(uint256 indexed marketId, uint256 startTime, uint256 aiPrediction);
    event BetPlaced(uint256 indexed marketId, address indexed user, bool isOver, uint256 amount);
    event MarketSettled(uint256 indexed marketId, uint256 actualPrice);
    event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 amount);
    event AiAgentUpdated(address indexed newAiAgent);
    event TreasuryUpdated(address indexed newTreasury);

    constructor(
        address _token,
        address _aiAgent,
        address _treasury
    ) Ownable(msg.sender) {
        token = OverOrUnderToken(_token);
        aiAgent = _aiAgent;
        treasury = _treasury;
    }

    function createMarket(uint256 aiPrediction) external {
        require(msg.sender == aiAgent, "Only AI agent can create markets");
        require(markets.length == 0 || markets[markets.length - 1].settled, "Previous market not settled");

        Market storage newMarket = markets.push();
        newMarket.id = markets.length - 1;
        newMarket.startTime = block.timestamp;
        newMarket.endTime = block.timestamp + MARKET_DURATION;
        newMarket.aiPrediction = aiPrediction;

        // Add initial liquidity
        newMarket.totalOverBets = INITIAL_LIQUIDITY;
        newMarket.totalUnderBets = INITIAL_LIQUIDITY;

        emit MarketCreated(newMarket.id, newMarket.startTime, aiPrediction);
    }

    function placeBet(uint256 marketId, bool isOver, uint256 amount) external nonReentrant {
        require(marketId < markets.length, "Invalid market");
        Market storage market = markets[marketId];
        require(!market.settled, "Market already settled");
        require(block.timestamp <= market.startTime + BETTING_WINDOW, "Betting window closed");
        require(amount >= MIN_BET, "Bet too small");
        require(amount <= MAX_BET, "Bet too large");
        require(
            (isOver ? market.totalOverBets : market.totalUnderBets) + amount <= MAX_TOTAL_BET,
            "Market bet limit reached"
        );

        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");

        if (isOver) {
            market.overBets[msg.sender] += amount;
            market.totalOverBets += amount;
        } else {
            market.underBets[msg.sender] += amount;
            market.totalUnderBets += amount;
        }

        emit BetPlaced(marketId, msg.sender, isOver, amount);
    }

    function settleMarket(uint256 marketId, uint256 actualPrice) external {
        require(marketId < markets.length, "Invalid market");
        Market storage market = markets[marketId];
        require(!market.settled, "Market already settled");
        require(block.timestamp >= market.endTime, "Market not ended");
        require(msg.sender == aiAgent, "Only AI agent can settle markets");

        market.actualPrice = actualPrice;
        market.settled = true;

        emit MarketSettled(marketId, actualPrice);
    }

    function claimWinnings(uint256 marketId) external nonReentrant {
        require(marketId < markets.length, "Invalid market");
        Market storage market = markets[marketId];
        require(market.settled, "Market not settled");
        require(!market.hasClaimed[msg.sender], "Already claimed");

        uint256 overBet = market.overBets[msg.sender];
        uint256 underBet = market.underBets[msg.sender];
        require(overBet > 0 || underBet > 0, "No bets placed");

        bool isOver = overBet > 0;
        uint256 betAmount = isOver ? overBet : underBet;
        uint256 totalWinningPool = isOver ? market.totalUnderBets : market.totalOverBets;
        uint256 totalLosingPool = isOver ? market.totalOverBets : market.totalUnderBets;

        uint256 winnings = 0;
        if ((isOver && market.actualPrice > market.aiPrediction) ||
            (!isOver && market.actualPrice < market.aiPrediction)) {
            uint256 platformFee = (totalWinningPool * PLATFORM_FEE) / 100;
            winnings = betAmount + (betAmount * (totalWinningPool - platformFee)) / totalLosingPool;
        }

        market.hasClaimed[msg.sender] = true;
        if (winnings > 0) {
            require(token.transfer(msg.sender, winnings), "Token transfer failed");
        }

        emit WinningsClaimed(marketId, msg.sender, winnings);
    }

    function setAiAgent(address _aiAgent) external onlyOwner {
        require(_aiAgent != address(0), "Invalid AI agent address");
        aiAgent = _aiAgent;
        emit AiAgentUpdated(_aiAgent);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function getCurrentMarket() external view returns (
        uint256 id,
        uint256 startTime,
        uint256 endTime,
        uint256 aiPrediction,
        uint256 totalOverBets,
        uint256 totalUnderBets,
        bool settled
    ) {
        if (markets.length == 0) {
            return (0, 0, 0, 0, 0, 0, true);
        }
        Market storage market = markets[markets.length - 1];
        return (
            market.id,
            market.startTime,
            market.endTime,
            market.aiPrediction,
            market.totalOverBets,
            market.totalUnderBets,
            market.settled
        );
    }

    function getUserBets(uint256 marketId, address user) external view returns (
        uint256 overBet,
        uint256 underBet,
        bool hasClaimed
    ) {
        require(marketId < markets.length, "Invalid market");
        Market storage market = markets[marketId];
        return (
            market.overBets[user],
            market.underBets[user],
            market.hasClaimed[user]
        );
    }
} 