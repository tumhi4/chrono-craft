// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ChronoCraftEscrow
 * @notice Production EVM Territory Staking & 2-Commander PvP Planetary Siege Escrow.
 * @dev Enforces full native-currency collateralization for territory infrastructure and sieges,
 * settled autonomously by GenLayer AI Climate Game Master consensus signals.
 *
 * SIEGE-ID MAPPING CONVENTION:
 * Standardized 1-to-1 mapping between GenLayer string ID (e.g. "SIEGE_002") and EVM bytes32:
 * `bytes32 siegeId = bytes32(abi.encodePacked("SIEGE_002"))` (left-aligned, zero-padded to 32 bytes).
 * Python / Web3 representation: `siege_id.encode('utf-8').ljust(32, b'\0')[:32]`.
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
    event SiegeFunded(bytes32 indexed siegeId, address indexed duelist, uint256 amount, bool isFullyFunded);
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
     * @notice Creates a new 2-Commander PvP Siege Escrow bound to GenLayer registered participants.
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
     * @notice Funds native collateral for an active siege. Requires both registered commanders to deposit.
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

        totalLockedCollateral += msg.value;

        if (s.attackerFunded && s.defenderFunded) {
            s.isFunded = true;
        }

        emit SiegeFunded(siegeId, msg.sender, msg.value, s.isFunded);
    }

    /**
     * @notice Disburses the full siege bounty (2x wager) to the winning commander upon verified GenLayer resolution.
     */
    function disburseSiegeBounty(bytes32 siegeId, address winner) external onlyRelay {
        SiegeEscrow storage s = sieges[siegeId];
        require(s.isFunded, "Siege escrow not fully funded by both commanders");
        require(!s.isSettled, "Siege already settled");
        require(winner == s.attacker || winner == s.defender, "Winner must be registered participant");

        s.isSettled = true;
        s.winner = winner;

        uint256 payout = s.wagerAmount * 2;
        if (address(this).balance >= payout) {
            (bool sent, ) = payable(winner).call{value: payout}("");
            require(sent, "Native transfer to winner failed");
        }

        emit SiegeSettled(siegeId, winner, payout);
    }

    /**
     * @notice View function to retrieve full siege escrow state for relay pre-settlement verification.
     */
    function getSiegeEscrow(bytes32 siegeId) external view returns (
        bytes32 id,
        address attacker,
        address defender,
        uint256 wagerAmount,
        bool attackerFunded,
        bool defenderFunded,
        bool isFunded,
        bool isSettled,
        address winner
    ) {
        SiegeEscrow memory s = sieges[siegeId];
        return (
            s.siegeId,
            s.attacker,
            s.defender,
            s.wagerAmount,
            s.attackerFunded,
            s.defenderFunded,
            s.isFunded,
            s.isSettled,
            s.winner
        );
    }

    receive() external payable {}
}
