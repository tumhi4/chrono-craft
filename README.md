# ChronoCraft — Autonomous Weather-Driven Geolocation Strategy MMO & Siege Engine

> **"The world's first on-chain 4X strategy game where planetary resource yields and PvP siege defense are driven by live real-world satellite weather telemetry via GenLayer AI consensus."**

---

## 🔗 Verified Deployments & Links
- **GenLayer Explorer Contract**: [`0x1298e88f6224C3Fa215aCDa1Ebdbc17dE81246a9`](https://explorer-studio.genlayer.com/address/0x1298e88f6224C3Fa215aCDa1Ebdbc17dE81246a9)
- **Live DApp Dashboard**: [`https://chrono-craft-nine.vercel.app/`](https://chrono-craft-nine.vercel.app/)
- **GitHub Repository**: [`https://github.com/tumhi4/chrono-craft`](https://github.com/tumhi4/chrono-craft)
- **Demo Satellite Weather Feed**: [`https://tumhi4.github.io/chrono-craft/demo/mock_weather_tokyo_typhoon.html`](https://tumhi4.github.io/chrono-craft/demo/mock_weather_tokyo_typhoon.html)

---

## 🛡️ Architectural Invariants & Steward (ODbeke) Review Hardening

1. **Complete 2-Participant EVM Escrow Path**:
   - `ChronoCraftEscrow.sol` enforces that **both participants** fund matching wagers (`attackerFunded` + `defenderFunded` $\rightarrow$ `isFunded = true`).
   - Staking and bounties are reported only after verified on-chain transaction receipts (`receipt.status == 1`).
   - Strict underfunded revert guard: `require(address(this).balance >= payout, "[ERR_UNDERFUNDED]")`.
2. **Territory-Bound Telemetry with Enforced Bounds**:
   - Harvests are strictly bound to authorized territory telemetry feeds (`[ERR_TELEMETRY_MISMATCH]`).
   - Enforces physical meteorological bounds in Python contract code: Temperature (-60 to 65°C), Wind (0 to 350 km/h), Solar (0 to 1500 W/m²), and Multipliers (1.0x to 3.5x).
3. **Genuine Weather-Based AI Siege Consensus**:
   - `resolve_siege` ingests live planetary weather telemetry and the 24/7 UTC Atomic Clock (`timeapi.io`).
   - GenLayer AI Climate Game Master evaluates environmental hazard modifiers (Typhoon, Sandstorm, Blizzard) and arbitrates combat outcomes (`ATTACKER_BREACHED` vs `DEFENDER_REPELLED`).
4. **Multi-Layer Anti-Replay & Anti-Self-Raid**:
   - Unique harvest IDs (`[ERR_REPLAY_01]`), one-claimant-per-node binding (`[ERR_REPLAY_02]`), and strict prohibition of self-raiding (`[ERR_SELF_RAID]`).
5. **Comprehensive Test Suite**:
   - `test/test_collateral_lifecycle.py` validates 2-sided funding, telemetry binding, meteorological bounds, weather siege consensus, and confirmed receipts with 100% pass rate.
