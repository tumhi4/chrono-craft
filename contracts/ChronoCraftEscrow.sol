// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ChronoCraftEscrow
 * @notice Production EVM Territory Staking & PvP Planetary Siege Escrow.
 * @dev Enforces full native-currency collateralization for territory infrastructure and sieges,
 * settled autonomously by GenLayer AI Climate Game Master consensus signals.
 */
contract ChronoCraftEscrow {
    address public owner;
    address public settlementRelay;
    uint256 public totalLockedCollateral;

    struct SiegeEscrow {
        bytes32 siegeId;
        address attacker;
        address defender;
        uint256 wagerAmount;
        bool attackerFunded;
        bool defenderFunded;
        bool isFunded;
        bool isSettled;
        address winner;
    }

    mapping(bytes32 => SiegeEscrow) public sieges;
    mapping(bytes32 => uint256) public territoryStakes;

    event TerritoryStaked(bytes32 indexed territoryId, address indexed commander, uint256 amount);
    event SiegeCreated(bytes32 indexed siegeId, address indexed attacker, address indexed defender, uint256 wagerAmount);
    event SiegeFunded(bytes32 indexed siegeId, address indexed duelist, uint256 amount);
    event SiegeSettled(bytes32 indexed siegeId, address indexed winner, uint256 payout);

    modifier onlyRelay() {
        require(msg.sender == settlementRelay || msg.sender == owner, "Unauthorized: Only settlement relay or owner");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Unauthorized: Only owner");
        _;
    }

    constructor(address _settlementRelay) {
        owner = msg.sender;
        settlementRelay = _settlementRelay;
    }

    function setSettlementRelay(address _newRelay) external onlyOwner {
        require(_newRelay != address(0), "Invalid relay address");
        settlementRelay = _newRelay;
    }

    /**
     * @notice Stakes native collateral to claim and upgrade a territory node.
     */
    function stakeTerritory(bytes32 territoryId) external payable {
        require(msg.value > 0, "Stake amount must be > 0");
        territoryStakes[territoryId] += msg.value;
        totalLockedCollateral += msg.value;
        emit TerritoryStaked(territoryId, msg.sender, msg.value);
    }

    /**
     * @notice Creates a new 2-Commander PvP Siege Escrow.
     */
    function createSiege(bytes32 siegeId, address attacker, address defender, uint256 wagerAmount) external {
        require(sieges[siegeId].wagerAmount == 0, "Siege already registered");
        require(attacker != address(0) && defender != address(0), "Invalid commander addresses");
        require(attacker != defender, "Self-raids prohibited");
        require(wagerAmount > 0, "Wager must be > 0");

        sieges[siegeId] = SiegeEscrow({
            siegeId: siegeId,
            attacker: attacker,
            defender: defender,
            wagerAmount: wagerAmount,
            attackerFunded: false,
            defenderFunded: false,
            isFunded: false,
            isSettled: false,
            winner: address(0)
        });

        emit SiegeCreated(siegeId, attacker, defender, wagerAmount);
    }

    /**
     * @notice Funds native collateral for an active siege.
     */
    function fundSiege(bytes32 siegeId) external payable {
        SiegeEscrow storage s = sieges[siegeId];
        require(s.wagerAmount > 0, "Siege does not exist");
        require(!s.isSettled, "Siege already settled");
        require(msg.value == s.wagerAmount, "Exact native wager required");

        if (msg.sender == s.attacker) {
            require(!s.attackerFunded, "Attacker already funded");
            s.attackerFunded = true;
        } else if (msg.sender == s.defender) {
            require(!s.defenderFunded, "Defender already funded");
            s.defenderFunded = true;
        } else {
            revert("Sender is not a registered siege participant");
        }

        emit SiegeFunded(siegeId, msg.sender, msg.value);

        if (s.attackerFunded && s.defenderFunded) {
            s.isFunded = true;
        }
    }

    /**
     * @notice Disburses the full siege bounty (2x wager) to the winning commander.
     */
    function disburseSiegeBounty(bytes32 siegeId, address winner) external onlyRelay {
        SiegeEscrow storage s = sieges[siegeId];
        require(s.isFunded, "Siege escrow not fully funded");
        require(!s.isSettled, "Siege already settled");
        require(winner == s.attacker || winner == s.defender, "Winner must be registered participant");

        s.isSettled = true;
        s.winner = winner;

        uint256 payout = s.wagerAmount * 2;
        (bool sent, ) = payable(winner).call{value: payout}("");
        require(sent, "Native transfer to winner failed");

        emit SiegeSettled(siegeId, winner, payout);
    }

    receive() external payable {}
}
