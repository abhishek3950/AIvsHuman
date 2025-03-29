// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BettingContract.sol";

contract BettingContractV2 is BettingContract {
    constructor(
        address _token,
        address _aiAgent,
        address _treasury
    ) BettingContract(_token, _aiAgent, _treasury) {}

    function updateAiAgent(address _newAiAgent) external override onlyOwner {
        require(_newAiAgent != address(0), "Invalid AI agent address");
        aiAgent = _newAiAgent;
        emit AiAgentUpdated(_newAiAgent);
    }

    function updateTreasury(address _newTreasury) external override onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury address");
        treasury = _newTreasury;
        emit TreasuryUpdated(_newTreasury);
    }
} 