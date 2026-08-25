# ChronoCraft — Autonomous Weather-Driven Geolocation Strategy MMO & Siege Engine

> **"The world's first on-chain 4X strategy game where planetary resource yields and PvP siege defense are driven by live real-world satellite weather telemetry via GenLayer AI consensus."**

---

## 🔗 Verified Deployments & Links
- **GenLayer Explorer Contract**: [`0x0CA60FA5A596fDB1811Eb3C511513C6421A8FD47`](https://explorer-studio.genlayer.com/address/0x0CA60FA5A596fDB1811Eb3C511513C6421A8FD47)
- **Live DApp Dashboard**: [`https://chrono-craft-nine.vercel.app/`](https://chrono-craft-nine.vercel.app/)
- **GitHub Repository**: [`https://github.com/tumhi4/chrono-craft`](https://github.com/tumhi4/chrono-craft)
- **Demo Satellite Weather Feed**: [`https://tumhi4.github.io/chrono-craft/demo/mock_weather_tokyo_typhoon.html`](https://tumhi4.github.io/chrono-craft/demo/mock_weather_tokyo_typhoon.html)

---

## 🛡️ Architectural Invariants & Reviewer Safeguards
1. **Multi-Layer Anti-Replay & Node Uniqueness**:
   - Unique harvest IDs (`[ERR_REPLAY_01]`) and one-commander-per-node binding (`[ERR_REPLAY_02]`). Reverts verified on-chain.
2. **Anti-Self-Raid PvP Invariant**:
   - In Planetary Sieges, the contract asserts `attacker != defender`, strictly blocking self-raiding exploits (`[ERR_SELF_RAID]`). Revert verified on-chain.
3. **Deterministic Yield & Combat Calibration**:
   - Hydro kinetic output, Solar photovoltaic indices, and Cryo-Shield ratings are mathematically computed from physical weather telemetry (temperature, wind velocity, solar irradiance).
4. **Single-Round Unified AI Consensus**:
   - Evaluates the 24/7 UTC Atomic Clock (`timeapi.io`) and NOAA/satellite weather telemetry in 1 parallel prompt pass (0 leader rotations).
5. **Production Signed Web3 EVM Escrow**:
   - `relay/ChronoCraftRelay.py` validates participant binding on `ChronoCraftEscrow.sol`, signs ECDSA transactions, and confirms on-chain receipts (`status == 1`).

---

## 🌍 Planetary Biomes & Multipliers
- **`HYDRO_COASTAL`** (Tokyo Neon): Typhoons and heavy storms surge hydro-turbine yields up to 3.5x (+350%).
- **`SOLAR_DESERT`** (Sahara Oasis): Extreme heatwaves and high radiation surge solar arrays up to 3.0x (+300%).
- **`GEOTHERMAL_CRYO`** (Reykjavik Core): Subzero blizzards activate cryo-shield defenses (+40% Shield) and 3.2x geothermal output.
- **`BIO_CANOPY`** (Amazon Vault): Monsoon humidity boosts bio-reactor energy by 2.5x.
