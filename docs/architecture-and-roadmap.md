# Testship — Architecture Review & Roadmap

> Last updated: 2026-03-08
> Branch context: `feat/codama-support`
> Status: Open to full rewrite

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Competitive Landscape & Edge Strategy](#2-competitive-landscape--edge-strategy)
3. [Problems with Current Architecture](#3-problems-with-current-architecture)
4. [Target Architecture](#4-target-architecture)
5. [Codama Integration (IDL → AST → UI)](#5-codama-integration)
6. [Anchor IDL v2 (New Schema) Support](#6-anchor-idl-v2-new-schema-support)
7. [Solana Kit / Web3.js v2 Migration](#7-solana-kit--web3js-v2-migration)
8. [Native Rust & Pinocchio Program Support](#8-native-rust--pinocchio-program-support)
9. [Runtime Backends (Validator & In-Process SVM)](#9-runtime-backends-validator--in-process-svm)
10. [Proposed Module Structure (Rewrite)](#10-proposed-module-structure-rewrite)
11. [Implementation Plan](#11-implementation-plan)

---

## 1. Current State Analysis

### What Testship Does

Testship is an interactive testing/exploration tool for Solana programs. Run `testship start` inside an Anchor project and it spins up a browser UI that auto-generates forms from the program's IDL, lets you connect a wallet, and execute transactions — no test files required.

### Current Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| CLI | Commander, Ora, Chalk, Inquirer | Detects Anchor projects, finds IDL |
| Server | Hono + @hono/node-server | Serves IDL via REST, watches file changes via SSE |
| UI | React 19, Vite 7, Tailwind 4, shadcn/ui | Skeleton — header + wallet connection only |
| State | Zustand | Stores Codama RootNode, program metadata |
| Data Fetching | TanStack React Query | Added but not yet used |
| Wallet | @solana/connector | Multi-wallet support (Phantom, Solflare, etc.) |
| IDL Processing | @codama/nodes-from-anchor | Converts Anchor IDL → Codama AST (in progress) |

### Current Data Flow

```
testship start
  → CLI detects Anchor.toml, finds target/idl/*.json
  → Hono server starts on :5051
    → GET /api/idl — returns raw IDL JSON
    → GET /api/events — SSE stream, emits on IDL file change
  → Browser opens
    → Fetches IDL → converts to Codama RootNode via rootNodeFromAnchor()
    → Stores in Zustand (rootNode, programName, programAddress)
    → (NOT YET BUILT) renders instruction forms, executes txns
```

### What's Actually Working

- CLI: project detection, IDL discovery, multi-program selection prompt
- Server: IDL serving, file watching with hot reload via SSE
- UI: wallet connection/disconnection, dark mode, basic layout
- State: Codama AST generation from Anchor IDL

### What's Not Built Yet

- Instruction form generation from Codama AST
- Account state inspection
- Transaction building and execution
- PDA derivation UI
- Transaction history
- Type validation on inputs
- Multi-program support in a single session
- Any support for non-Anchor programs

---

## 2. Competitive Landscape & Edge Strategy

### What Solana Explorer's "Interact" Tab Does

Solana Explorer recently added a "Program IDL → Interact" feature for deployed Anchor programs. From the screenshot (devnet):

- Reads on-chain Anchor IDL (0.30.1 format)
- Shows tabs: Instructions, Accounts, Types, PDAs, Errors, Constants, Events, **Interact**
- Lists instruction names (closeChannel, openChannel, timeoutClose) with expandable forms
- Cluster selector (Devnet)
- Wallet connection
- Program logs viewer
- Basic "fill form → execute" flow

**This is essentially a browser-based Anchor program caller built into the explorer.** It's convenient for quick one-off interactions with deployed programs.

### What Solana Explorer's Interact Tab Does NOT Do

| Capability | Explorer Interact | Testship (Target) |
|-----------|:-:|:-:|
| **Local development workflow** | Partial — can connect to localhost RPC, but no file watching, no hot reload, no project awareness | Yes — watches local IDL, hot reloads on `anchor build`, project-aware |
| **Zero-setup testing (no validator)** | No — always needs a running validator with deployed program | Yes — LiteSVM runs in-process, loads .so directly, no deploy step |
| **Local validator management** | No — can point to localhost but doesn't manage the validator | Yes — starts/stops solana-test-validator / Surfpool, airdrop, program deploy |
| **Non-Anchor programs** | No — requires on-chain Anchor IDL | Yes — Shank, Codama JSON, manual definition, Pinocchio |
| **PDA auto-derivation** | Unknown / likely basic | Full — reads PDA seeds from Codama AST, auto-fills |
| **Account state inspection** | No — separate explorer page | Yes — decoded account viewer inline |
| **Transaction history** | No — just fires and forgets | Yes — full history with replay, decoded logs |
| **Multi-instruction transactions** | No — one instruction at a time | Yes — batch builder, compose complex txs |
| **Account book / address reuse** | No | Yes — save, label, and reuse accounts across sessions |
| **Transaction simulation** | Unknown | Yes — simulate first, show CU cost, then send |
| **Export as code** | No | Yes — export to Solana Kit TypeScript |
| **Airdrop / faucet** | No (separate tool) | Yes — built-in for local/devnet |
| **Program deployment** | No | Yes — drag & drop .so to local validator |
| **Mainnet program cloning** | No | Yes — via Surfpool fork |
| **CPI trace visualization** | No | Planned — inner instruction tree |
| **Event subscriptions** | No | Planned — live event listener |
| **Custom RPC endpoints** | Mainnet/Devnet/Testnet/Localhost — can point to custom URL | Any endpoint — custom localnet, private RPC |
| **Offline / air-gapped** | Partial — can connect to localhost, but UI itself is hosted online | Yes — fully local, UI served from your machine |
| **Session sharing** | No | Yes — compressed URL state sharing |
| **CI/CD integration** | No | Potential — headless mode for automated testing |

### Testship's Moat: Developer Workflow Tool, Not Just a Caller

Explorer Interact can technically be used for local development — point it at localhost, deploy your program, and interact. But the workflow is:

```
Write code → anchor build → deploy to local validator → open explorer →
find your program → navigate to IDL tab → click Interact → fill form →
change code → rebuild → redeploy → refresh page → repeat
```

With Testship:

```
Write code → anchor build → Testship auto-reloads → test → iterate
```

**Explorer is a general-purpose block explorer that added a "call this function" feature.** It has no concept of your project, your files, or your development workflow. It doesn't know when your IDL changed. It can't manage your validator. It doesn't remember your test accounts.

**Testship is purpose-built for the developer inner loop.** Every feature exists to shorten the time between "I changed code" and "I see the result."

This is the fundamental difference and where the long-term edge lives:

### Strategic Edges to Maintain & Deepen

#### Edge 1: Local-First Development Loop
- Explorer requires a deployed program. Testship works the moment you `anchor build`.
- Hot reload on IDL change means zero-friction iteration.
- Integrated validator management (start, stop, airdrop, clone programs) — no terminal juggling.
- **Deepen:** Add `anchor build` trigger from UI. Detect Rust file changes → prompt rebuild → auto-reload.

#### Edge 2: Framework Agnostic
- Explorer is Anchor-only (requires on-chain Anchor IDL at a specific PDA).
- Testship with Codama supports any Solana program: Anchor, Shank, Pinocchio, native Rust, or manual definition.
- **Deepen:** Become the de facto testing UI for all Solana frameworks. Partner with Pinocchio, Steel, Typhon, etc.

#### Edge 3: Composability & Power User Features
- Multi-instruction transaction builder (simulate complex DeFi flows).
- Account book with labels (don't re-derive PDAs every time).
- Transaction replay and diffing.
- Export to code — turn your interactive test into a reproducible script.
- **Deepen:** Transaction templates ("Create token mint + ATA + mint to" as a single template). Community-shared templates.

#### Edge 4: Deep Inspection
- Decoded account state inline (not on a separate page).
- CPI trace tree (see what inner programs were called).
- Compute unit profiling (optimize before mainnet).
- Error decoder with human-readable messages.
- **Deepen:** Time-travel debugging — step through transaction execution. Account state diffing (before/after).

#### Edge 5: Validator Control
- Explorer has zero control over the runtime environment.
- Testship can manage the validator, clone mainnet state, deploy programs, airdrop SOL.
- Surfpool integration gives hot-reload for .so files — even faster than `anchor test`.
- **Deepen:** Snapshot/restore validator state. "Save this state, try something risky, rollback."

#### Edge 6: Offline & Privacy
- Works completely offline with local validator. No data sent anywhere.
- Useful for teams working on proprietary programs pre-launch.
- Explorer sends all transactions through public infrastructure.

### What to Watch Out For

1. **Explorer already connects to localhost.** You can point Explorer at `http://localhost:8899` and interact with locally deployed programs. This means for a developer who already has `solana-test-validator` running and their program deployed, Explorer Interact is a viable (if clunky) option. However, they still need to: manually start the validator, manually deploy, manually refresh the page when IDL changes, and have no file watching or project context. If Explorer ever ships a local CLI (`solana-explorer serve`) with file watching, that's direct competition.

2. **Anchor Playground (beta.solpg.io)** already has an IDE + test UI. It's browser-based and opinionated. Testship's edge is being local-first and framework-agnostic.

3. **Codama ecosystem growth.** If Codama becomes the standard IDL format (which Metaplex is pushing), Testship is well-positioned as the first testing tool built on it.

4. **Don't compete on "pretty forms."** Explorer will always look polished (it's their full-time product). Compete on **workflow speed** and **developer power features** — things that matter when you're iterating 50 times a day, not when you're calling a function once.

---

## 3. Problems with Current Architecture

### 3.1 Old Anchor IDL Schema Assumption

The CLI and server assume the legacy Anchor IDL format (pre-0.30). The new Anchor IDL spec (v0.30+) changed significantly:

| Aspect | Old IDL | New IDL (v0.30+) |
|--------|---------|-------------------|
| Top-level key | `instructions` with `args` and `accounts` | `instructions` with `args`, `accounts` now have `address` field |
| Account types | `type` field on accounts | `accounts` is a separate top-level array with discriminators |
| Types | `types` array with `kind` | `types` array with richer schema (`option`, `vec`, `defined`, etc.) |
| Events | `events` array | `events` with discriminator |
| Errors | `errors` array | `errors` array (similar but with code ranges) |
| Constants | Not present | `constants` array |
| Metadata | `metadata.address` | `address` at top level |
| Discriminators | Implicit (8-byte sha256) | Explicit `discriminator` field on instructions/accounts |

The current code does `rootNodeFromAnchor(idl)` which handles both via Codama, but the CLI's project detection and IDL path resolution don't account for the new `target/idl` output format changes.

### 3.2 No Web3.js v2 / Solana Kit Usage

The project currently has `@solana/connector` for wallet integration but does **zero on-chain interaction**. Transaction building, sending, account fetching — none of it exists. When we build it, we should use Solana Kit (the v2 rewrite of `@solana/web3.js`) from the start:

- `@solana/kit` — unified package (replaces `@solana/web3.js`)
- Functional, tree-shakeable API
- Native `TransactionMessage` + `compileTransaction` pattern
- `@solana/codecs` for borsh serialization (aligns with Codama)
- `@solana/signers` for wallet adapter integration

### 3.3 Tightly Coupled to Anchor

Every layer assumes Anchor:
- CLI checks for `Anchor.toml`
- Constants hardcode `target/idl`
- Server reads only Anchor IDL JSON files
- No concept of a generic program interface

### 3.4 Single-Program Limitation

The server serves one IDL. Real-world testing often involves multiple programs (e.g., a main program + a rewards program + SPL Token).

### 3.5 No Transaction Execution Layer

The hardest and most valuable part — actually building and sending transactions — is completely absent. This includes:
- Instruction data serialization
- Account resolution (PDAs, ATAs, system programs)
- Transaction simulation before sending
- Result parsing and error decoding

---

## 4. Target Architecture

### Design Principles

1. **IDL-agnostic core** — Codama AST is the universal intermediate representation. Any program format (Anchor, Shank, Kinobi, raw) gets converted to Codama AST first.
2. **Solana Kit native** — All on-chain interactions use `@solana/kit` (Web3.js v2).
3. **Multi-program** — Support loading multiple programs in a single workspace.
4. **Pluggable validator** — Support `solana-test-validator` today, Surfpool tomorrow.
5. **Framework-agnostic detection** — Detect Anchor, but also accept raw IDL/SO files and Codama JSON.

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         CLI Layer                            │
│  Project detection (Anchor / Native / Pinocchio / Manual)    │
│  Validator management (test-validator / Surfpool)            │
│  Config resolution                                           │
└──────────────────────┬───────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────┐
│                       Server Layer                           │
│  Hono HTTP server                                            │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ IDL Loader  │  │ SSE Events   │  │ Validator Proxy     │  │
│  │ (multi-src) │  │ (hot reload) │  │ (RPC passthrough)   │  │
│  └─────────────┘  └──────────────┘  └────────────────────┘  │
└──────────────────────┬───────────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────────┐
│                        UI Layer                              │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐   │
│  │              IDL Processing Pipeline                  │   │
│  │  Raw IDL → Codama AST → Instruction/Account Models    │   │
│  └───────────────────────┬───────────────────────────────┘   │
│                          │                                    │
│  ┌───────────────────────▼───────────────────────────────┐   │
│  │              UI Generation Engine                     │   │
│  │  Codama AST → Form fields, type selectors, PDA UIs   │   │
│  └───────────────────────┬───────────────────────────────┘   │
│                          │                                    │
│  ┌───────────────────────▼───────────────────────────────┐   │
│  │           Transaction Engine (Solana Kit)             │   │
│  │  Build → Simulate → Sign → Send → Confirm → Decode   │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                              │
│  State: Zustand stores for workspace, accounts, tx history   │
│  Wallet: @solana/connector                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Codama Integration

Codama is the key to making Testship framework-agnostic. It provides a universal AST for Solana program interfaces.

### What Codama Gives Us

```
Anchor IDL ─────┐
Shank IDL ──────┤
Kinobi JSON ────┼──→ Codama RootNode (AST) ──→ Universal program model
Raw types ──────┤
Manual def ─────┘
```

### Codama AST Structure (relevant nodes)

```typescript
RootNode
├── program: ProgramNode
│   ├── name: string
│   ├── publicKey: string
│   ├── instructions: InstructionNode[]
│   │   ├── name: string
│   │   ├── accounts: InstructionAccountNode[]
│   │   │   ├── name: string
│   │   │   ├── isSigner: boolean | 'either'
│   │   │   ├── isWritable: boolean
│   │   │   ├── isOptional: boolean
│   │   │   └── defaultValue?: PdaValueNode | PublicKeyValueNode | ...
│   │   ├── arguments: InstructionArgumentNode[]
│   │   │   ├── name: string
│   │   │   └── type: TypeNode (NumberTypeNode | StringTypeNode | StructTypeNode | ...)
│   │   └── discriminators: DiscriminatorNode[]
│   ├── accounts: AccountNode[]
│   │   ├── name: string
│   │   ├── discriminators: DiscriminatorNode[]
│   │   └── data: StructTypeNode
│   ├── definedTypes: DefinedTypeNode[]
│   ├── pdas: PdaNode[]
│   │   ├── name: string
│   │   └── seeds: PdaSeedNode[] (ConstantPdaSeedNode | VariablePdaSeedNode | ...)
│   └── errors: ErrorNode[]
└── additionalPrograms: ProgramNode[] (for CPI references)
```

### Key Codama Packages to Use

```
@codama/nodes               — Core AST types
@codama/nodes-from-anchor   — Anchor IDL → Codama AST (supports v0.30+ and legacy)
@codama/visitors            — Walk/transform the AST
@codama/renderers-js        — (reference) how to generate JS from AST
@codama/errors              — Error handling
```

### How to Use Codama for Form Generation

```typescript
import { rootNodeFromAnchor } from "@codama/nodes-from-anchor";
import {
  isStructTypeNode,
  isNumberTypeNode,
  isBooleanTypeNode,
  isPublicKeyTypeNode,
  isStringTypeNode,
  isOptionTypeNode,
  isDefinedTypeLinkNode,
  isEnumTypeNode,
} from "@codama/nodes";

// 1. Parse IDL to AST
const rootNode = rootNodeFromAnchor(anchorIdlJson);
const program = rootNode.program;

// 2. Extract instructions
for (const ix of program.instructions) {
  // ix.name → form title
  // ix.accounts → account inputs (pubkey fields, with signer/writable badges)
  // ix.arguments → data inputs (typed form fields)
}

// 3. Map TypeNode → form field
function typeToField(type: TypeNode): FieldConfig {
  if (isNumberTypeNode(type)) return { kind: "number", format: type.format }; // u8, u16, u32, u64, i8, etc.
  if (isBooleanTypeNode(type)) return { kind: "checkbox" };
  if (isPublicKeyTypeNode(type)) return { kind: "pubkey-input" };
  if (isStringTypeNode(type)) return { kind: "text", encoding: type.encoding };
  if (isOptionTypeNode(type)) return { kind: "optional", inner: typeToField(type.item) };
  if (isEnumTypeNode(type)) return { kind: "select", variants: type.variants };
  if (isStructTypeNode(type)) return { kind: "nested-form", fields: type.fields.map(...) };
  if (isDefinedTypeLinkNode(type)) return resolveDefinedType(type.name);
  // ... handle Vec, Array, Tuple, Map, Set, Bytes
}

// 4. PDA derivation
for (const pda of program.pdas) {
  // pda.seeds → determine what inputs are needed
  // ConstantPdaSeedNode → hardcoded bytes (e.g., b"vault")
  // VariablePdaSeedNode → user must provide (e.g., user pubkey)
  // Auto-derive PDA when all seeds are available
}
```

### Codama Type → HTML Input Mapping

| Codama TypeNode | UI Component | Notes |
|----------------|-------------|-------|
| `NumberTypeNode(u8)` | Number input (0-255) | Min/max validation |
| `NumberTypeNode(u16/u32)` | Number input | Appropriate range |
| `NumberTypeNode(u64/u128/i64/i128)` | Text input (BigInt) | Too large for JS number |
| `NumberTypeNode(f32/f64)` | Number input (decimal) | Step=any |
| `BooleanTypeNode` | Checkbox / Toggle | |
| `PublicKeyTypeNode` | Pubkey input + address book | Base58 validation |
| `StringTypeNode` | Text input | With encoding indicator |
| `BytesTypeNode` | Hex/Base64 input | Toggle encoding |
| `OptionTypeNode` | Nullable wrapper (checkbox + inner) | "Include this field?" |
| `EnumTypeNode` | Select dropdown | Variants as options |
| `StructTypeNode` | Nested fieldset | Recursive rendering |
| `TupleTypeNode` | Grouped inputs | Indexed fields |
| `ArrayTypeNode` | Dynamic list (add/remove items) | |
| `MapTypeNode` | Key-value pair list | |
| `SetTypeNode` | Unique value list | |
| `DefinedTypeLinkNode` | Resolve → render referenced type | Look up in definedTypes |

---

## 6. Anchor IDL v2 (New Schema) Support

### What Changed in Anchor IDL v2 (0.30+)

The new IDL spec is a significant overhaul. Key differences:

```jsonc
// === OLD (pre-0.30) ===
{
  "version": "0.1.0",
  "name": "counter",
  "instructions": [{
    "name": "initialize",
    "accounts": [
      { "name": "counter", "isMut": true, "isSigner": false },
      { "name": "user", "isMut": true, "isSigner": true },
      { "name": "systemProgram", "isMut": false, "isSigner": false }
    ],
    "args": [{ "name": "initialValue", "type": "u64" }]
  }],
  "accounts": [{
    "name": "Counter",
    "type": { "kind": "struct", "fields": [{ "name": "count", "type": "u64" }] }
  }],
  "metadata": { "address": "Fg6P...xyz" }
}

// === NEW (0.30+) ===
{
  "address": "Fg6P...xyz",
  "metadata": { "name": "counter", "version": "0.1.0", "spec": "0.1.0" },
  "instructions": [{
    "name": "initialize",
    "discriminator": [175, 175, 109, 31, 13, 152, 155, 237],
    "accounts": [
      { "name": "counter", "writable": true, "pda": { "seeds": [...] } },
      { "name": "user", "writable": true, "signer": true },
      { "name": "system_program", "address": "11111111111111111111111111111111" }
    ],
    "args": [{ "name": "initial_value", "type": "u64" }]
  }],
  "accounts": [{
    "name": "Counter",
    "discriminator": [255, 176, 4, 245, 188, 253, 124, 25]
  }],
  "types": [{
    "name": "Counter",
    "type": { "kind": "struct", "fields": [{ "name": "count", "type": "u64" }] }
  }],
  "events": [],
  "errors": []
}
```

### Key Structural Changes

1. **`address` moved to top level** — no more `metadata.address`
2. **`metadata` now holds `name`, `version`, `spec`** — program identity
3. **Explicit discriminators** — 8-byte arrays on instructions and accounts
4. **`isMut`/`isSigner` → `writable`/`signer`** — boolean flags renamed and simplified
5. **Account names use snake_case** — previously camelCase
6. **PDA definitions inline** — accounts can have `pda: { seeds: [...] }` directly
7. **System program accounts have `address` field** — explicitly specifying known program addresses
8. **`types` separated from `accounts`** — account discriminators in `accounts`, type definitions in `types`
9. **Constants support** — new top-level `constants` array
10. **Events have discriminators** — explicit 8-byte discriminators

### Why Codama Handles This

`@codama/nodes-from-anchor` supports **both** IDL formats. It auto-detects the version and normalizes to the same Codama AST:

```typescript
import { rootNodeFromAnchor } from "@codama/nodes-from-anchor";

// Works with BOTH old and new IDL formats
const rootNode = rootNodeFromAnchor(idlJson);
// → Always produces the same RootNode structure regardless of IDL version
```

This is the primary reason to use Codama as the intermediate layer — it abstracts away IDL version differences.

---

## 7. Solana Kit / Web3.js v2 Migration

### Why Web3.js v2 (Solana Kit)

| Aspect | @solana/web3.js v1 | @solana/kit (v2) |
|--------|-------------------|------------------|
| Bundle size | ~400KB | Tree-shakeable, <50KB typical |
| API style | Class-based (OOP) | Functional, composable |
| BigInt | Number (unsafe for u64) | Native BigInt |
| Codecs | Manual Buffer manipulation | `@solana/codecs` (Borsh-aligned) |
| Transaction | Legacy Transaction class | `TransactionMessage` + `compileTransaction` |
| Signers | Keypair class | `@solana/signers` (wallet-aware) |
| Types | Runtime validation | TypeScript-first, compile-time safe |

### Key Packages

```
@solana/kit                — Unified import (replaces @solana/web3.js)
@solana/rpc               — RPC client (JSON-RPC 2.0)
@solana/rpc-subscriptions — WebSocket subscriptions
@solana/transaction-messages — Build transaction messages
@solana/transactions      — Compile, sign, send transactions
@solana/signers           — Signer abstractions
@solana/codecs            — Borsh serialization (aligns with Codama)
@solana/addresses         — Address validation, PDA derivation
@solana/programs          — Program address constants
@solana/accounts          — Account fetching and decoding
@solana/errors            — Error handling
```

### Transaction Building with Solana Kit

```typescript
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";
import { pipe } from "@solana/functional";
import {
  createTransactionMessage,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstruction,
} from "@solana/transaction-messages";
import { compileTransaction } from "@solana/transactions";
import { getSignatureFromTransaction, signTransaction } from "@solana/signers";
import { address, getProgramDerivedAddress } from "@solana/addresses";
import { getSetComputeUnitLimitInstruction } from "@solana/compute-budget";

// 1. Create RPC connection
const rpc = createSolanaRpc("http://127.0.0.1:8899");

// 2. Build instruction from Codama AST
function buildInstruction(
  instructionNode: InstructionNode,
  accounts: Record<string, Address>,
  args: Record<string, unknown>,
  programAddress: Address
): IInstruction {
  // Serialize args using @solana/codecs based on Codama type info
  const data = serializeInstructionData(instructionNode, args);

  // Build account metas from Codama account nodes
  const keys = instructionNode.accounts.map(acc => ({
    address: accounts[acc.name],
    role: getAccountRole(acc), // AccountRole.WRITABLE_SIGNER, etc.
  }));

  return { programAddress, accounts: keys, data };
}

// 3. Build and send transaction
const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

const txMessage = pipe(
  createTransactionMessage({ version: 0 }),
  tx => setTransactionMessageFeePayer(feePayer, tx),
  tx => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  tx => appendTransactionMessageInstruction(instruction, tx),
);

// 4. Sign with wallet (via @solana/connector)
const signedTx = await signTransaction([walletSigner], compileTransaction(txMessage));

// 5. Send and confirm
const signature = getSignatureFromTransaction(signedTx);
await rpc.sendTransaction(signedTx).send();
```

### Codama + Solana Codecs for Serialization

Codama types map directly to `@solana/codecs`:

```typescript
import {
  getU8Codec, getU16Codec, getU32Codec, getU64Codec,
  getI8Codec, getI16Codec, getI32Codec, getI64Codec,
  getF32Codec, getF64Codec,
  getBooleanCodec,
  getUtf8Codec,
  getArrayCodec, getStructCodec, getOptionCodec,
  getEnumCodec, getTupleCodec, getMapCodec, getSetCodec,
  getFixedSizeCodec,
  combineCodec,
} from "@solana/codecs";
import { getAddressCodec } from "@solana/addresses";

function codamaTypeToCodec(typeNode: TypeNode): Codec {
  if (isNumberTypeNode(typeNode)) {
    const codecs = { u8: getU8Codec, u16: getU16Codec, u32: getU32Codec, u64: getU64Codec, /* etc */ };
    return codecs[typeNode.format]();
  }
  if (isBooleanTypeNode(typeNode)) return getBooleanCodec();
  if (isPublicKeyTypeNode(typeNode)) return getAddressCodec();
  if (isStringTypeNode(typeNode)) return getUtf8Codec();
  if (isOptionTypeNode(typeNode)) return getOptionCodec(codamaTypeToCodec(typeNode.item));
  if (isArrayTypeNode(typeNode)) return getArrayCodec(codamaTypeToCodec(typeNode.item));
  if (isStructTypeNode(typeNode)) {
    const fields = typeNode.fields.map(f => [f.name, codamaTypeToCodec(f.type)]);
    return getStructCodec(fields);
  }
  if (isEnumTypeNode(typeNode)) {
    // Handle enum variants
    return getEnumCodec(typeNode.variants);
  }
  // ... etc
}
```

---

## 8. Native Rust & Pinocchio Program Support

### The Problem

Anchor programs have IDL files. Native Rust programs and Pinocchio programs do not — they're raw Solana BPF programs with no standard interface description.

### Approaches for Non-Anchor Programs

#### Option A: Shank-Annotated Programs

[Shank](https://github.com/metaplex-foundation/shank) is a macro library that generates IDLs from native Rust programs:

```rust
// Native Rust program with Shank annotations
#[derive(ShankInstruction)]
pub enum MyInstruction {
    #[account(0, writable, signer, name = "payer")]
    #[account(1, writable, name = "data_account")]
    #[account(2, name = "system_program")]
    Initialize { value: u64 },
}
```

Shank generates a Kinobi-compatible IDL → Codama can ingest it.

**Detection:** Look for `shank` in `Cargo.toml` dependencies, check for IDL output.

#### Option B: Codama JSON (Manual or Generated)

Programs can provide a Codama JSON file directly (hand-authored or generated by tools):

```json
{
  "kind": "rootNode",
  "program": {
    "kind": "programNode",
    "name": "myNativeProgram",
    "publicKey": "MyProg...",
    "instructions": [...]
  }
}
```

**Detection:** Look for `*.codama.json` or `codama.json` files.

#### Option C: Manual IDL Definition (UI-Based)

For programs with no IDL at all, Testship can offer a UI to manually define the interface:

1. Enter program address
2. Define instructions manually:
   - Instruction name
   - Discriminator bytes (or index for native)
   - Account list with signer/writable flags
   - Argument types
3. Save as a Codama JSON file for reuse

This is similar to how Etherscan allows manual ABI input for unverified contracts.

#### Option D: On-Chain IDL (Anchor Programs on Mainnet/Devnet)

For deployed Anchor programs, the IDL is stored on-chain at a derived address:

```typescript
import { address, getProgramDerivedAddress } from "@solana/addresses";

// Anchor stores IDL at PDA: seeds = [b"anchor:idl", programId]
const [idlAddress] = await getProgramDerivedAddress({
  programAddress: programId,
  seeds: [Buffer.from("anchor:idl"), programId.toBytes()],
});

// Fetch, decompress (zstd), parse
const idlAccount = await rpc.getAccountInfo(idlAddress);
```

This enables testing any deployed Anchor program without local source code.

### Pinocchio Programs

[Pinocchio](https://github.com/febo/pinocchio) is a zero-copy, zero-alloc Solana program framework. Programs built with Pinocchio are raw BPF with no IDL standard.

**Support strategy:**
- Same as native Rust: use Shank annotations, Codama JSON, or manual definition
- Pinocchio programs that use `pinocchio-idl` (if it exists) could be auto-detected
- Otherwise, manual IDL definition is the fallback

### Unified Program Detection Flow

```
testship start [--idl <path>] [--program <address>] [--codama <path>]

Detection priority:
1. Explicit --idl or --codama flag → use that file directly
2. Anchor.toml present → read target/idl/*.json → rootNodeFromAnchor()
3. *.codama.json present → read directly as RootNode
4. Cargo.toml with shank dependency → look for shank IDL output
5. --program <address> flag → fetch on-chain IDL (Anchor programs)
6. Fallback → prompt user: "No IDL found. Enter program address or define manually?"
```

---

## 9. Runtime Backends (Validator & In-Process SVM)

> **Lean approach:** Start with LiteSVM only. Build it as a concrete implementation,
> not through the `RuntimeProvider` interface. Extract the interface only when we add the
> second backend (Surfpool or solana-test-validator). Per our
> [guidelines](architectural-guidelines.md): "Don't add until needed."

Testship should support multiple runtime backends, ranging from a full local validator to an in-process SVM that requires zero external setup. The developer picks the right tool for the job — or Testship picks for them.

### 9.1 The Three Tiers

```
┌─────────────────────────────────────────────────────────────────────┐
│  Tier 1: LiteSVM (In-Process)                                       │
│  Zero setup. SVM runs inside the Testship server process.           │
│  Best for: Quick instruction testing, iteration speed, CI.          │
│  No deploy step. No external process. Millisecond execution.        │
├─────────────────────────────────────────────────────────────────────┤
│  Tier 2: Surfpool (Lightweight Validator)                           │
│  Managed external process. Hot program reload. Mainnet forking.     │
│  Best for: Testing with mainnet state, multi-program flows.         │
├─────────────────────────────────────────────────────────────────────┤
│  Tier 3: solana-test-validator (Full Validator)                     │
│  Full JSON-RPC, WebSocket subs, Geyser plugins, ledger.            │
│  Best for: Integration/E2E testing, full RPC compatibility.         │
└─────────────────────────────────────────────────────────────────────┘
```

### 9.2 LiteSVM — Zero-Validator Testing

[LiteSVM](https://github.com/LiteSVM/litesvm) is a lightweight, in-process SVM implementation. The `litesvm` npm package provides Node.js bindings via NAPI-RS (native addon, not WASM).

**What it does:**
- Runs the full Solana VM inside the Node.js process — no external validator
- Load `.so` programs directly from disk (`svm.addProgramFromFile()`)
- Create accounts, airdrop SOL, send transactions — all synchronous
- System Program and SPL Token come preloaded
- Sysvar manipulation (Clock, Rent, ComputeBudget, etc.)
- Compute metering and CPI support

**What it doesn't do:**
- No full JSON-RPC server (only basic methods)
- No WebSocket subscriptions
- No Geyser plugins
- No persistent ledger across restarts
- No Windows support
- **Does not run in the browser** (native addon, not WASM)

**Why it's perfect for Testship's default mode:**

The current workflow requires developers to run a validator externally. With LiteSVM embedded in the Hono server, the flow becomes:

```
Before:  testship start → (user manually starts solana-test-validator) → (user deploys program) → test
After:   testship start → test
```

LiteSVM runs in the server process. The UI sends instruction data via HTTP. The server executes against the in-process SVM and returns results. From the developer's perspective: **build your program, run testship, start testing. No deploy step.**

**Integration architecture:**

```typescript
import { LiteSVM } from "litesvm";
import { Keypair, Transaction, PublicKey } from "@solana/web3.js";

class LiteSvmProvider implements RuntimeProvider {
  private svm: LiteSVM;

  async start(config: RuntimeConfig) {
    this.svm = new LiteSVM();

    // Load programs from target/deploy/*.so
    for (const prog of config.loadPrograms ?? []) {
      this.svm.addProgramFromFile(
        new PublicKey(prog.programId),
        prog.path  // e.g., "target/deploy/counter.so"
      );
    }
  }

  async sendTransaction(tx: Transaction): Promise<TransactionResult> {
    // Synchronous execution — instant results
    const meta = this.svm.sendTransaction(tx);
    return {
      signature: meta.signature,
      logs: meta.logs,
      computeUnits: meta.computeUnitsConsumed,
      err: meta.err,
    };
  }

  async airdrop(address: string, lamports: bigint) {
    this.svm.airdrop(new PublicKey(address), lamports);
  }

  async getAccount(address: string) {
    return this.svm.getAccount(new PublicKey(address));
  }

  // No external process to manage
  async stop() { /* no-op, GC handles it */ }
  isRunning() { return true; }

  // No RPC URL — communication is in-process
  getRpcUrl() { return null; }
  getWsUrl() { return null; }
}
```

**Note on @solana/web3.js v1 dependency:** LiteSVM's JS bindings currently depend on `@solana/web3.js` ^1.x for types (Transaction, PublicKey, etc.). Since Testship targets Solana Kit (v2), we'll need an adapter layer to convert between the two at the LiteSVM boundary. This is straightforward — the core types (addresses, transactions) are byte-compatible, just different wrappers.

### 9.3 Surfpool — Lightweight Validator with Mainnet Forking

[Surfpool](https://github.com/txtx/surfpool) is an alternative to `solana-test-validator` built by the Txtx team. Key advantages:

- **Hot-loads mainnet programs** — fork mainnet state without genesis config hacks
- **Faster startup** — lighter than the full validator
- **Program hot-reloading** — deploy updated .so files without restarting
- **Simnet mode** — simulated network for fast iteration
- **Built-in faucet** — airdrop without rate limits
- **Subgraph indexing** — built-in event/account indexing
- **REST API** — additional endpoints beyond standard JSON-RPC

```typescript
class SurfpoolProvider implements RuntimeProvider {
  private process: ChildProcess;

  async start(config: RuntimeConfig) {
    const args = ["start"];
    if (config.rpcPort) args.push("--rpc-port", String(config.rpcPort));
    if (config.simnet) args.push("--simnet");
    for (const prog of config.clonePrograms ?? []) {
      args.push("--clone-program", `${prog.address}:${prog.cluster}`);
    }
    this.process = spawn("surfpool", args);
  }

  getRpcUrl() { return `http://127.0.0.1:${this.rpcPort}`; }
  getWsUrl() { return `ws://127.0.0.1:${this.wsPort}`; }
}
```

### 9.4 solana-test-validator — Full Fidelity

The standard local validator from the Solana CLI. Use when you need full RPC compatibility, WebSocket subscriptions, or Geyser plugin support.

### 9.5 RuntimeProvider Abstraction

```typescript
interface RuntimeProvider {
  name: string;
  tier: "in-process" | "lightweight" | "full";

  // Lifecycle
  start(config: RuntimeConfig): Promise<void>;
  stop(): Promise<void>;
  isRunning(): boolean;

  // RPC (null for in-process providers like LiteSVM)
  getRpcUrl(): string | null;
  getWsUrl(): string | null;

  // Core operations (all providers must support these)
  sendTransaction(tx: Transaction): Promise<TransactionResult>;
  simulateTransaction(tx: Transaction): Promise<SimulationResult>;
  getAccount(address: string): Promise<AccountInfo | null>;
  getBalance(address: string): Promise<bigint>;
  airdrop(address: string, lamports: bigint): Promise<void>;

  // Program management
  loadProgram(path: string, programId: string): Promise<void>;

  // Optional capabilities (not all providers support these)
  capabilities: {
    mainnetForking: boolean;     // Surfpool: yes, others: no
    hotProgramReload: boolean;   // Surfpool: yes, LiteSVM: reload by restarting
    websocketSubscriptions: boolean; // test-validator: yes, LiteSVM: no
    fullRpc: boolean;            // test-validator: yes, LiteSVM: no
    persistentLedger: boolean;   // test-validator: yes, LiteSVM: no
    geyserPlugins: boolean;      // test-validator: yes, others: no
  };

  // Logs
  streamLogs(): AsyncIterable<LogEntry>;
}

interface RuntimeConfig {
  rpcPort?: number;
  ledgerDir?: string;
  loadPrograms?: Array<{ path: string; programId: string }>;
  clonePrograms?: Array<{ address: string; cluster: "mainnet" | "devnet" }>;
  cloneAccounts?: Array<{ address: string; cluster: "mainnet" | "devnet" }>;
  simnet?: boolean;  // Surfpool-specific
}
```

### 9.6 Auto-Selection Logic

```
testship start (no flags)
  → Default: LiteSVM (instant, zero setup)
  → Auto-loads .so from target/deploy/ if Anchor project detected

testship start --runtime surfpool
  → Starts Surfpool, full RPC available

testship start --runtime validator
  → Starts solana-test-validator

testship start --runtime external --rpc <url>
  → Connects to an existing RPC endpoint (local or remote)

testship start --clone <address>
  → Implies Surfpool (only backend that supports mainnet forking)
```

### 9.7 Comparison Table

| Feature | LiteSVM (in-process) | Surfpool | solana-test-validator |
|---------|:---:|:---:|:---:|
| Startup time | Instant (~10ms) | ~1-2s | ~5-10s |
| Deploy step needed | No — loads .so directly | No — hot loads | Yes |
| Execution speed | ~1ms per tx | ~400ms per slot | ~400ms per slot |
| Mainnet fork | No | Yes | Partial (`--clone`) |
| Hot program reload | Restart SVM (fast) | Yes | Requires restart |
| Full JSON-RPC | No | Yes | Yes |
| WebSocket subs | No | Partial | Yes |
| Geyser plugins | No | No | Yes |
| Persistent ledger | No (in-memory) | Yes | Yes |
| External process | No | Yes | Yes |
| Compute metering | Yes | Yes | Yes |
| CPI support | Yes | Yes | Yes |
| Install required | `npm install litesvm` | `cargo install surfpool` | Comes with Solana CLI |

### 9.8 UI Integration

- **Runtime selector** in header — dropdown showing current backend with tier indicator
- **One-click tier switching** — "Switch to Surfpool for mainnet forking" contextual prompts
- **Status indicator** — green (running) / yellow (starting) / red (stopped)
- **Airdrop button** — works across all backends
- **Log viewer** — streamed from any backend
- **Program deployment** — drag & drop .so (LiteSVM: instant load, others: deploy tx)
- **Capability badges** — show what the current backend supports (e.g., "No WS subs" on LiteSVM)

### 9.9 CLI Flags

```
testship start
  --runtime <litesvm|surfpool|validator|external>  # Default: litesvm
  --rpc <url>                    # Required for --runtime external
  --clone <program-address>      # Clone mainnet program (implies surfpool)
  --simnet                       # Surfpool simnet mode (implies surfpool)
  --no-runtime                   # UI only, no backend runtime management
```

---

## 10. Proposed Module Structure (Rewrite)

> **Note:** Testship is published on npm as a single package (CLI + server + bundled UI).
> The current flat structure (`cli/`, `server/`, `ui/`, `shared/`) works well for this —
> keep it unless we need to publish sub-packages independently. The structure below shows
> the target internal organization within the single package.

```
testship/                           # Single npm package
├── cli/
│   ├── index.ts                    # Entry point (bin: testship)
│   ├── commands/
│   │   ├── start.ts                # Main command
│   │   └── init.ts                 # Generate codama.json for native programs
│   ├── detection/
│   │   ├── anchor.ts               # Anchor project detection
│   │   ├── shank.ts                # Shank project detection
│   │   ├── codama.ts               # Codama JSON detection
│   │   └── index.ts                # Unified detection pipeline
│   └── runtime/
│       └── litesvm.ts              # In-process SVM (start here, extract interface later)
│
├── server/
│   ├── index.ts                    # Hono app setup
│   ├── routes/
│   │   ├── idl.ts                  # IDL serving (multi-program)
│   │   ├── events.ts               # SSE endpoint
│   │   └── runtime.ts              # Runtime control endpoints (execute, airdrop, etc.)
│   └── services/
│       └── idl-watcher.ts          # File watching service
│
├── shared/
│   ├── types.ts
│   └── constants.ts
│
├── ui/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── header.tsx
│   │   │   │   ├── sidebar.tsx             # Program/instruction nav
│   │   │   │   └── wallet/
│   │   │   ├── instruction/
│   │   │   │   ├── instruction-form.tsx    # Main instruction form
│   │   │   │   ├── account-input.tsx       # Pubkey input with PDA derivation
│   │   │   │   ├── arg-input.tsx           # Type-aware argument input
│   │   │   │   ├── type-renderer.tsx       # Codama type → form field mapping
│   │   │   │   └── pda-resolver.tsx        # PDA auto-derivation UI
│   │   │   ├── account/
│   │   │   │   ├── account-explorer.tsx    # Browse program accounts
│   │   │   │   ├── account-viewer.tsx      # Decoded account data
│   │   │   │   └── account-book.tsx        # Saved accounts for reuse
│   │   │   ├── transaction/
│   │   │   │   ├── tx-builder.tsx          # Multi-instruction tx builder
│   │   │   │   ├── tx-simulator.tsx        # Simulation results
│   │   │   │   ├── tx-history.tsx          # Transaction log
│   │   │   │   └── tx-result.tsx           # Decoded transaction result
│   │   │   ├── runtime/
│   │   │   │   ├── status.tsx              # Runtime health indicator
│   │   │   │   ├── log-viewer.tsx          # Streamed logs
│   │   │   │   └── controls.tsx            # Airdrop, etc.
│   │   │   └── ui/                         # shadcn components
│   │   ├── stores/
│   │   │   ├── workspace.ts                # Programs, IDL, Codama AST
│   │   │   ├── accounts.ts                 # Account book, recently used
│   │   │   └── transactions.ts             # Transaction history
│   │   ├── lib/
│   │   │   ├── codama-to-form.ts           # AST → form config mapping
│   │   │   ├── codama-to-codec.ts          # AST → @solana/codecs mapping
│   │   │   ├── transaction-builder.ts      # Solana Kit tx construction
│   │   │   ├── pda.ts                      # PDA derivation helpers
│   │   │   └── account-decoder.ts          # Decode account data using Codama
│   │   └── hooks/
│   │       ├── use-instruction.ts          # Instruction execution hook
│   │       ├── use-account.ts              # Account fetching/decoding
│   │       └── use-rpc.ts                  # RPC connection hook
│   ├── package.json                        # UI deps (React, Vite, etc.)
│   └── vite.config.ts
│
├── package.json                    # Root — published to npm, contains bin entry
├── tsconfig.json
└── docs/
```

---

## 11. Implementation Plan

> **Alignment with [architectural-guidelines.md](architectural-guidelines.md):**
> This plan is phased specifically to avoid speculative complexity. Phase 1 is the only
> must-do — it delivers the core value prop (IDL → form → execute). Phases 2-4 are
> documented for direction, not commitment. Don't build the `RuntimeProvider` abstraction
> until we have two backends to abstract over. Don't build multi-program support until
> someone actually needs it. Don't add Surfpool until LiteSVM proves insufficient.
> The doc describes a ceiling, not a floor. Build the minimum at each step.

### Phase 1: Core Engine (Codama + Solana Kit)

**Goal:** Execute a single instruction against a local validator from the UI.

1. **Codama pipeline finalization**
   - Complete `use-workspace.ts` to fully parse IDL → Codama AST
   - Build `codama-to-form.ts` — map every TypeNode to a form field config
   - Build `codama-to-codec.ts` — map every TypeNode to a `@solana/codecs` codec
   - Handle all Codama types: numbers, bools, pubkeys, strings, bytes, options, enums, structs, arrays, tuples, maps, sets, defined type references

2. **Instruction form UI**
   - Sidebar with program name and instruction list
   - Instruction form: auto-generated account inputs + argument inputs
   - PDA auto-derivation (using `getProgramDerivedAddress` from `@solana/addresses`)
   - Account role badges (signer, writable, optional)
   - Known program resolution (system program, token program, etc.)

3. **Transaction execution**
   - Install `@solana/kit`
   - Build transaction from form state using `@solana/transaction-messages`
   - Simulate before sending (show compute units, logs)
   - Sign via `@solana/connector` wallet
   - Send, confirm, decode result
   - Display success/error with parsed logs

4. **Account viewer**
   - Fetch account data by address
   - Decode using Codama AST + `@solana/codecs`
   - Display decoded struct fields in a readable table

### Phase 2: Multi-Program & Native Support

5. **Multi-program workspace**
   - Server serves multiple IDLs (`GET /api/idl` → returns array or keyed map)
   - UI sidebar shows multiple programs
   - Cross-program account references

6. **Non-Anchor program support**
   - CLI detection for Shank and Codama JSON
   - `testship init` command — generate a codama.json scaffold for native programs
   - Manual IDL builder UI
   - On-chain IDL fetching for deployed Anchor programs

7. **Transaction history & account book**
   - Persist transaction history in localStorage/IndexedDB
   - Save/label frequently used accounts
   - Re-execute previous transactions
   - Export transaction as Solana Kit TypeScript code

### Phase 3: Runtime Backends

8. **LiteSVM integration (default runtime)**
   - `RuntimeProvider` interface
   - `LiteSvmProvider` — loads .so from `target/deploy/`, zero setup
   - Server-side execution: UI sends instruction data → server runs against LiteSVM → returns result
   - Adapter layer for LiteSVM's @solana/web3.js v1 types ↔ Solana Kit v2 types
   - Auto-loads programs when IDL watcher detects rebuild

9. **Surfpool & solana-test-validator providers**
   - `SurfpoolProvider` — mainnet forking, hot program reload, simnet mode
   - `SolanaTestProvider` — full-fidelity fallback
   - `ExternalProvider` — connect to any running RPC
   - Auto-detect if a validator is already running on default port

10. **Runtime UI**
    - Runtime selector dropdown with tier badges
    - Status indicator (green/yellow/red)
    - Airdrop button (works on all backends)
    - Log viewer with filtering
    - Program deployment (drag & drop .so)
    - Contextual prompts ("Need mainnet state? Switch to Surfpool")

### Phase 4: DX Polish

11. **Export & sharing**
    - Export test as TypeScript (Solana Kit code generation)
    - Session sharing via URL (compressed state)
    - Import/export workspace configs

12. **Advanced features**
    - Multi-instruction transaction builder (batch)
    - CPI visualization (trace inner instructions)
    - Compute budget estimation and optimization
    - Token account helpers (create ATA, mint tokens)
    - Event listener (subscribe to program logs)
    - Error decoder (Anchor error codes → human-readable messages)

---

## Appendix A: Key Dependencies (Target)

```jsonc
// CLI + Server
{
  "commander": "^14.0.0",
  "hono": "^4.11.0",
  "@hono/node-server": "^1.19.0",
  "chokidar": "^4.0.0",
  "chalk": "^5.0.0",
  "ora": "^9.0.0",
  "litesvm": "^0.6.0",           // In-process SVM (default runtime)
  "@inquirer/prompts": "^7.0.0"
}

// UI
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "zustand": "^5.0.0",
  "@tanstack/react-query": "^5.0.0",

  // Solana Kit (Web3.js v2)
  "@solana/kit": "^2.1.0",

  // Codama
  "@codama/nodes": "^1.5.0",
  "@codama/nodes-from-anchor": "^1.3.0",
  "@codama/visitors": "^1.5.0",

  // Wallet
  "@solana/connector": "^0.1.0",

  // UI
  "tailwindcss": "^4.0.0",
  "@radix-ui/*": "latest"
}
```

## Appendix B: Codama ↔ Solana Codecs Reference

| Codama TypeNode | @solana/codecs Function | Notes |
|----------------|------------------------|-------|
| `numberTypeNode('u8')` | `getU8Codec()` | |
| `numberTypeNode('u16')` | `getU16Codec()` | Little-endian default |
| `numberTypeNode('u32')` | `getU32Codec()` | |
| `numberTypeNode('u64')` | `getU64Codec()` | Returns BigInt |
| `numberTypeNode('u128')` | `getU128Codec()` | Returns BigInt |
| `numberTypeNode('i8')` | `getI8Codec()` | |
| `numberTypeNode('i16')` | `getI16Codec()` | |
| `numberTypeNode('i32')` | `getI32Codec()` | |
| `numberTypeNode('i64')` | `getI64Codec()` | Returns BigInt |
| `numberTypeNode('f32')` | `getF32Codec()` | |
| `numberTypeNode('f64')` | `getF64Codec()` | |
| `booleanTypeNode()` | `getBooleanCodec()` | u8 under the hood |
| `publicKeyTypeNode()` | `getAddressCodec()` | 32 bytes |
| `stringTypeNode('utf8')` | `addCodecSizePrefix(getUtf8Codec(), getU32Codec())` | Length-prefixed |
| `bytesTypeNode()` | `getBytesCodec()` | Raw bytes |
| `optionTypeNode(inner)` | `getOptionCodec(innerCodec)` | Borsh Option |
| `arrayTypeNode(item, size)` | `getArrayCodec(itemCodec, { size })` | Length-prefixed or fixed |
| `structTypeNode(fields)` | `getStructCodec([...fieldCodecs])` | Ordered fields |
| `enumTypeNode(variants)` | `getEnumCodec(variants)` | u8 discriminator |
| `tupleTypeNode(items)` | `getTupleCodec([...itemCodecs])` | |
| `mapTypeNode(k, v)` | `getMapCodec(kCodec, vCodec)` | |
| `setTypeNode(item)` | `getSetCodec(itemCodec)` | |

## Appendix C: Runtime Backend Comparison

| Feature | LiteSVM (in-process) | Surfpool | solana-test-validator |
|---------|:---:|:---:|:---:|
| Startup time | ~10ms | ~1-2s | ~5-10s |
| External process | No | Yes | Yes |
| Deploy step needed | No (loads .so directly) | No (hot loads) | Yes |
| Execution speed | ~1ms/tx | ~400ms/slot | ~400ms/slot |
| Mainnet fork | No | Native fork support | `--clone` (slow) |
| Program hot reload | Restart SVM (~10ms) | Hot swap .so files | Requires restart |
| Full JSON-RPC | No (basic ops only) | Yes | Yes |
| WebSocket subs | No | Partial | Yes |
| Built-in faucet | In-memory airdrop | REST API faucet | `solana airdrop` CLI |
| Account indexing | No | Built-in subgraph | No |
| Persistent ledger | No (in-memory) | Yes | Yes |
| Geyser plugins | No | No | Yes |
| CPI support | Yes | Yes | Yes |
| Compute metering | Yes | Yes | Yes |
| Stability | Maintained, NAPI-RS | Newer, actively developed | Battle-tested |
| Installation | `npm install litesvm` | `cargo install surfpool` | Comes with Solana CLI |
| Best for | Quick iteration, CI | Mainnet forking, multi-program | Full E2E, RPC compat |
