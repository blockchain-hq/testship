<div align="center">

# <img src="https://raw.githubusercontent.com/blockchain-hq/testship/refs/heads/main/public/ts.png" alt="testship logo" width="180"/>

# Testship

### Test Anchor Programs without Writing Tests

**Test Anchor programs in 40 seconds, not 40 minutes. No test files. Just results.**

[![npm version](https://img.shields.io/npm/v/@blockchain-hq/testship.svg)](https://www.npmjs.com/package/@blockchain-hq/testship)
[![npm downloads](https://img.shields.io/npm/dm/@blockchain-hq/testship.svg)](https://www.npmjs.com/package/@blockchain-hq/testship)
[![GitHub stars](https://img.shields.io/github/stars/blockchain-hq/testship.svg)](https://github.com/blockchain-hq/testship/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Website](https://testship.xyz) • [Documentation](https://docs.testship.xyz) • [Demo Video](https://youtu.be/upQIqKl43ss) • [Twitter](https://x.com/testshipxyz)

</div>

---

## See It In Action

<div align="center">

[![Testship Demo](https://img.youtube.com/vi/upQIqKl43ss/maxresdefault.jpg)](https://youtu.be/upQIqKl43ss)

**[Watch Demo (2 min)](https://youtu.be/upQIqKl43ss)**

</div>

---

## Quick Start

```bash
# Run in your Anchor project directory
npx @blockchain-hq/testship start

# Or install globally
npm install -g @blockchain-hq/testship
testship start
```

**That's it.** Opens at `http://localhost:3000` with your program ready to test.

---

## What is Testship?

**Think Postman for Solana programs.**

Testship generates an interactive testing UI from your Anchor IDL. Test instructions visually, derive PDAs automatically, and see results instantly—all in your browser.

### The Problem

Traditional Anchor testing means:

- Writing test files for every instruction
- Manually deriving PDAs in code
- Parsing transaction logs to verify results
- Re-running `anchor test` for every change
- 40 minutes to test what should take 40 seconds

### The Solution

```bash
testship start
```

- Auto-generated forms from IDL
- Automatic PDA derivation
- Visual transaction execution
- Instant feedback on results
- Test in 40 seconds

---

## Why Developers Love Testship

<table>
<tr>
<td width="50%">

### Before Testship

```bash
# 1. Write test file
# test/counter.ts
it("increments counter", async () => {
  // 30 lines of boilerplate...
});

# 2. Run tests
$ anchor test
# Wait 2-3 minutes...

# 3. Parse logs manually
# Error: constraint violation
# Which constraint?

# 4. Fix, repeat
# Another 2-3 minutes...

Time: 40 minutes per change
```

</td>
<td width="50%">

### With Testship

```bash
# 1. Start Testship
$ testship start

# 2. Visual interface opens
# See all instructions

# 3. Click "Increment"
# Fill parameters (auto-complete)
# PDAs derived automatically

# 4. Execute
# Instant result

# 5. See exactly what changed

Time: 40 seconds per test
```

</td>
</tr>
</table>

---

## Key Features

| Feature                   | Description                                                    |
| ------------------------- | -------------------------------------------------------------- |
| **Zero Configuration**    | Run `testship start` in any Anchor project—that's it           |
| **Auto-Generated UI**     | Forms created from your IDL automatically                      |
| **Smart PDA Derivation**  | Handles complex account-based PDAs without code                |
| **Wallet Integration**    | Works with Phantom, Solflare, Backpack, and all Solana wallets |
| **Instant Execution**     | See transaction results in real-time                           |
| **Account History**       | Reuse accounts across instructions automatically               |
| **Multi-Program Support** | Detects and loads all programs in your workspace               |
| **Transaction History**   | Full execution log for debugging                               |
| **Type Validation**       | Input validation based on IDL types                            |
| **Cluster Support**       | Test on localnet, devnet, or mainnet                           |

---

## Perfect For

| Use Case               | Why Testship                                        |
| ---------------------- | --------------------------------------------------- |
| **Rapid Development**  | Iterate 10x faster during development               |
| **Debugging**          | Test specific scenarios without writing tests       |
| **Learning Anchor**    | Understand how programs work interactively          |
| **Teaching**           | Demonstrate programs to students visually           |
| **Pre-Deploy Testing** | Verify program behavior before mainnet              |
| **Demos**              | Show your program to team, users, or investors      |
| **CI/CD Integration**  | Quick manual verification alongside automated tests |

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  1. You run: testship start                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Testship automatically:                                 │
│     • Finds your Anchor workspace                           │
│     • Loads program IDLs                                    │
│     • Generates testing UI                                  │
│     • Opens browser                                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  3. You interact:                                           │
│     • Select instruction                                    │
│     • Fill form (with auto-complete & validation)           │
│     • Connect wallet                                        │
│     • Execute transaction                                   │
│     • See results instantly                                 │
└─────────────────────────────────────────────────────────────┘
```

**No test files. No boilerplate. No context switching. Just testing.**

---

## Example: Testing a Counter Program

<details>
<summary><b>Click to see step-by-step example</b></summary>

### Your Program (counter.rs)

```rust
#[program]
pub mod counter {
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.counter.count = 0;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        ctx.accounts.counter.count += 1;
        Ok(())
    }
}
```

### Traditional Testing (test/counter.ts)

```typescript
// 30+ lines of setup code...
describe("counter", () => {
  it("initializes", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        counter: counterPda,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const counter = await program.account.counter.fetch(counterPda);
    assert.equal(counter.count, 0);
  });

  it("increments", async () => {
    // Another 15 lines...
  });
});

// Run: anchor test (2-3 minutes)
```

### With Testship

```bash
$ testship start

# Browser opens with:
# ┌─────────────────────────────┐
# │ Counter Program             │
# ├─────────────────────────────┤
# │ Instructions:               │
# │ • Initialize  ← [Click]     │
# │ • Increment                 │
# └─────────────────────────────┘
#
# Form auto-filled with PDAs
# Click "Execute"
# Counter initialized (0)
#
# Click "Increment"
# Counter incremented (1)
#
# Total time: 30 seconds
```

</details>

---

## Documentation

**Full documentation:** [docs.testship.xyz](https://docs.testship.xyz)

- [Getting Started](https://docs.testship.xyz/guides/quickstart/)
- [Features Guide](https://docs.testship.xyz/features/interactive-ui/)
- [PDA Derivation](https://docs.testship.xyz/features/pda-derivation/)
- [Troubleshooting](https://docs.testship.xyz/reference/troubleshooting/)
- [Session Sharing](https://docs.testship.xyz/features/session-sharing/)
- [Hot Reloading](https://docs.testship.xyz/features/hot-reloading/)

---

## Development Status

**Current Version:** `v0.1.8` — Early Release, Actively Developed

### Working Features

- Auto-detect Anchor projects
- Load IDL from multiple programs
- Generate interactive forms from IDL
- Auto-derive PDAs with seeds
- Execute transactions with wallet
- Real-time transaction feedback
- Account history and reuse
- Transaction history tracking
- Multi-cluster support (localnet/devnet/mainnet)
- Form validation and error handling

### Coming Soon

- Account state inspector (view account data)
- Batch transaction execution
- Export test as TypeScript code
- Custom RPC endpoint support
- Shareable test sessions
- Program state snapshots

### Found a Bug?

[Report it on GitHub Issues](https://github.com/blockchain-hq/testship/issues)

We're shipping updates daily based on your feedback!

---

## Contributing

Testship is **open source and MIT licensed**. We welcome contributions from the community!

**Ways to contribute:**

- Submit pull requests
- Report bugs
- Suggest features
- Fork and modify
- Create derivatives
- Share feedback
- Star the repo

See [LICENSE](LICENSE) for details.

---

## Links & Resources

- **Website:** [testship.xyz](https://testship.xyz)
- **Documentation:** [docs.testship.xyz](https://docs.testship.xyz)
- **npm Package:** [@blockchain-hq/testship](https://www.npmjs.com/package/@blockchain-hq/testship)
- **GitHub:** [blockchain-hq/testship](https://github.com/blockchain-hq/testship)
- **Twitter:** [@testshipxyz](https://x.com/testshipxyz)
- **Discussions:** [GitHub Discussions](https://github.com/blockchain-hq/testship/discussions)
- **Issues:** [GitHub Issues](https://github.com/blockchain-hq/testship/issues)

---

## Support the Project

If Testship helps you build faster, please:

- [Star this repo](https://github.com/blockchain-hq/testship)
- [Follow us on Twitter](https://x.com/testshipxyz)
- Share Testship with your dev friends
- [Give feedback](https://github.com/blockchain-hq/testship/discussions)

**Built by developers, for developers.**

---

<div align="center">

**Made with care for the Solana ecosystem**

[Website](https://testship.xyz) • [Docs](https://docs.testship.xyz) • [Twitter](https://x.com/testshipxyz) • [npm](https://www.npmjs.com/package/@blockchain-hq/testship)

</div>
