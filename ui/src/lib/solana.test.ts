import type { Idl } from "@coral-xyz/anchor";
import { Keypair, PublicKey, type Connection } from "@solana/web3.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { derivePDA, toAnchorType, toBuffer } from "./solana";
import { BN } from "bn.js";
import type { IdlDiscriminator, IdlType } from "@coral-xyz/anchor/dist/cjs/idl";
import type { PDASeed } from "./types";

const createMockConnection = () => {
  return {
    getAccountInfo: vi.fn(),
  } as unknown as Connection;
};

const createMockIdl = (): Idl => ({
  metadata: {
    version: "0.1.0",
    name: "test_program",
    spec: "0.1.0",
  },
  address: "test_program",
  instructions: [
    {
      discriminator:
        "0x0000000000000000000000000000000000000000000000000000000000000000" as unknown as IdlDiscriminator,
      name: "testInstruction",
      accounts: [],
      args: [
        { name: "amount", type: "u64" },
        { name: "identifier", type: "string" },
        { name: "pubkey", type: "pubkey" },
        { name: "flag", type: "u8" },
      ],
    },
  ],
  types: [
    {
      name: "UserAccount",
      type: {
        kind: "struct",
        fields: [
          { name: "owner", type: "pubkey" },
          { name: "bump", type: "u8" },
          { name: "counter", type: "u64" },
        ],
      },
    },
  ],
});

describe("toBuffer", () => {
  it("should convert u8 to buffer", () => {
    const buffer = toBuffer(42, "u8");
    expect(buffer).toEqual(new Uint8Array([42]));
  });

  it("should convert u16 to buffer", () => {
    const buffer = toBuffer(1000, "u16");
    expect(buffer).toEqual(new Uint8Array([232, 3])); // 1000 in little endian
  });

  it("should convert u32 to buffer", () => {
    const buffer = toBuffer(100000, "u32");
    expect(buffer.length).toBe(4);
  });

  it("should convert string to buffer", () => {
    const buffer = toBuffer("hello", "string");
    expect(buffer).toEqual(new TextEncoder().encode("hello"));
  });

  it("should convert pubkey to buffer", () => {
    const pubkey = Keypair.generate().publicKey.toBase58();
    const buffer = toBuffer(pubkey, "pubkey");
    expect(buffer.length).toBe(32);
  });

  it("should handle BN values", () => {
    const bn = new BN(12345);
    const buffer = toBuffer(bn, "u64");
    expect(buffer.length).toBe(8);
  });

  it("should throw error for unsupported type", () => {
    expect(() => toBuffer("test", "unsupported" as unknown as IdlType)).toThrow(
      "Unsupported type"
    );
  });
});

describe("toAnchorType", () => {
  it("should convert numeric types to BN", () => {
    expect(toAnchorType(42, "u64")).toBeInstanceOf(BN);
    expect(toAnchorType(100, "u32")).toBeInstanceOf(BN);
    expect(toAnchorType(-50, "i32")).toBeInstanceOf(BN);
  });

  it("should convert string booleans to boolean", () => {
    expect(toAnchorType("true", "bool")).toBe(true);
    expect(toAnchorType("false", "bool")).toBe(false);
    expect(toAnchorType(true, "bool")).toBe(true);
  });

  it("should convert strings", () => {
    expect(toAnchorType("test", "string")).toBe("test");
  });

  it("should convert pubkey strings to PublicKey", () => {
    const pubkey = Keypair.generate().publicKey.toBase58();
    const result = toAnchorType(pubkey, "pubkey");
    expect(result).toBeInstanceOf(PublicKey);
  });
});

describe("derivePDA", () => {
  let mockConnection: Connection;
  let mockIdl: Idl;
  const programId = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

  beforeEach(() => {
    mockConnection = createMockConnection();
    mockIdl = createMockIdl();
  });

  describe("with const seeds", async () => {
    it("should derive PDA with const seeds", async () => {
      const seeds: PDASeed[] = [
        {
          kind: "const",
          value: Array.from(new TextEncoder().encode("metadata")),
        },
      ];

      const pda = await derivePDA(
        seeds,
        programId,
        new Map(),
        {},
        mockConnection,
        mockIdl
      );

      expect(pda).toBeInstanceOf(PublicKey);

      const [expectedPda] = PublicKey.findProgramAddressSync(
        [new TextEncoder().encode("metadata")],
        new PublicKey(programId)
      );
      expect(pda.toBase58()).toBe(expectedPda.toBase58());
    });

    it("should derive PDA with multiple const seeds", async () => {
      const seeds: PDASeed[] = [
        {
          kind: "const",
          value: Array.from(new TextEncoder().encode("prefix")),
        },
        {
          kind: "const",
          value: Array.from(new TextEncoder().encode("suffix")),
        },
      ];

      const pda = await derivePDA(
        seeds,
        programId,
        new Map(),
        {},
        mockConnection,
        mockIdl
      );

      const [expectedPda] = PublicKey.findProgramAddressSync(
        [
          new TextEncoder().encode("prefix"),
          new TextEncoder().encode("suffix"),
        ],
        new PublicKey(programId)
      );
      expect(pda.toBase58()).toBe(expectedPda.toBase58());
    });
  });

  describe("with arg seeds", async () => {
    it("should derive PSA with u64 arg seed", async () => {
      const seeds: PDASeed[] = [
        {
          kind: "arg",
          path: "amount",
        },
      ];

      const args = { amount: 1000 };

      const pda = await derivePDA(
        seeds,
        programId,
        new Map(),
        args,
        mockConnection,
        mockIdl
      );

      expect(pda).toBeInstanceOf(PublicKey);
      const [expectedPda] = PublicKey.findProgramAddressSync(
        [toBuffer(1000, "u64")],
        new PublicKey(programId)
      );
      expect(pda.toBase58()).toBe(expectedPda.toBase58());
    });

    it("should derive PDA with string arg seed", async () => {
      const seeds: PDASeed[] = [
        {
          kind: "arg",
          path: "identifier",
        },
      ];

      const args = { identifier: "user123" };

      const pda = await derivePDA(
        seeds,
        programId,
        new Map(),
        args,
        mockConnection,
        mockIdl
      );

      expect(pda).toBeInstanceOf(PublicKey);
      const [expectedPda] = PublicKey.findProgramAddressSync(
        [new TextEncoder().encode("user123")],
        new PublicKey(programId)
      );
      expect(pda.toBase58()).toBe(expectedPda.toBase58());
    });

    it("should derive PDA with pubkey arg seed", async () => {
      const seeds: PDASeed[] = [
        {
          kind: "arg",
          path: "pubkey",
        },
      ];

      const testPubkey = Keypair.generate().publicKey.toString();
      const args = { pubkey: testPubkey };

      const pda = await derivePDA(
        seeds,
        programId,
        new Map(),
        args,
        mockConnection,
        mockIdl
      );

      expect(pda).toBeInstanceOf(PublicKey);
      const [expectedPda] = PublicKey.findProgramAddressSync(
        [new PublicKey(testPubkey).toBytes()],
        new PublicKey(programId)
      );
      expect(pda.toBase58()).toBe(expectedPda.toBase58());
    });

    it("should throw error if arg is missing", async () => {
      const seeds: PDASeed[] = [
        {
          kind: "arg",
          path: "missingArg",
        },
      ];

      await expect(
        derivePDA(seeds, programId, new Map(), {}, mockConnection, mockIdl)
      ).rejects.toThrow("Missing arg: missingArg");
    });

    it("should throw error if arg type is unknown", async () => {
      const seeds: PDASeed[] = [
        {
          kind: "arg",
          path: "unknownArg",
        },
      ];

      const args = { unknownArg: "value" };

      await expect(
        derivePDA(seeds, programId, new Map(), args, mockConnection, mockIdl)
      ).rejects.toThrow("Unknown arg type: unknownArg");
    });
  });

  describe("with account seeds", async () => {
    it("should derive PDA with account seed", async () => {
      const accountPubKey = Keypair.generate().publicKey.toString();
      const seeds: PDASeed[] = [
        {
          kind: "account",
          path: "userAccount",
        },
      ];

      const accounts = new Map([["userAccount", accountPubKey]]);

      const pda = await derivePDA(
        seeds,
        programId,
        accounts,
        {},
        mockConnection,
        mockIdl
      );

      expect(pda).toBeInstanceOf(PublicKey);
      const [expectedPda] = PublicKey.findProgramAddressSync(
        [new PublicKey(accountPubKey).toBytes()],
        new PublicKey(programId)
      );
      expect(pda.toBase58()).toBe(expectedPda.toBase58());
    });

    it("should throw error if account is missing", async () => {
      const seeds: PDASeed[] = [
        {
          kind: "account",
          path: "missingAccount",
        },
      ];

      await expect(
        derivePDA(seeds, programId, new Map(), {}, mockConnection, mockIdl)
      ).rejects.toThrow("Missing account: missingAccount");
    });
  });

  describe("mixed seed combinations", () => {
    it("should derive PDA with const + arg seeds", async () => {
      const seeds: PDASeed[] = [
        {
          kind: "const",
          value: Array.from(new TextEncoder().encode("user")),
        },
        {
          kind: "arg",
          path: "amount",
        },
      ];

      const args = { amount: 500 };

      const pda = await derivePDA(
        seeds,
        programId,
        new Map(),
        args,
        mockConnection,
        mockIdl
      );

      expect(pda).toBeInstanceOf(PublicKey);
    });

    it("should derive PDA with const + account seeds", async () => {
      const accountPubkey = Keypair.generate().publicKey.toString();
      const seeds: PDASeed[] = [
        {
          kind: "const",
          value: Array.from(new TextEncoder().encode("vault")),
        },
        {
          kind: "account",
          path: "owner",
        },
      ];

      const accounts = new Map([["owner", accountPubkey]]);

      const pda = await derivePDA(
        seeds,
        programId,
        accounts,
        {},
        mockConnection,
        mockIdl
      );

      expect(pda).toBeInstanceOf(PublicKey);
    });

    it("should derive PDA with const + arg + account seeds", async () => {
      const accountPubkey = Keypair.generate().publicKey.toString();
      const seeds: PDASeed[] = [
        {
          kind: "const",
          value: Array.from(new TextEncoder().encode("escrow")),
        },
        {
          kind: "account",
          path: "authority",
        },
        {
          kind: "arg",
          path: "amount",
        },
      ];

      const accounts = new Map([["authority", accountPubkey]]);
      const args = { amount: 1000 };

      const pda = await derivePDA(
        seeds,
        programId,
        accounts,
        args,
        mockConnection,
        mockIdl
      );

      expect(pda).toBeInstanceOf(PublicKey);
    });
  });

  describe("seed size validation", () => {
    it("should throw error if seed exceeds 32 bytes", async () => {
      const longString = "a".repeat(50); // 50 bytes > 32
      const seeds: PDASeed[] = [
        {
          kind: "const",
          value: Array.from(new TextEncoder().encode(longString)),
        },
      ];

      await expect(
        derivePDA(seeds, programId, new Map(), {}, mockConnection, mockIdl)
      ).rejects.toThrow("Seed exceeds 32 bytes");
    });

    it("should accept seed exactly at 32 bytes", async () => {
      const exactString = "a".repeat(32); // exactly 32 bytes
      const seeds: PDASeed[] = [
        {
          kind: "const",
          value: Array.from(new TextEncoder().encode(exactString)),
        },
      ];

      const pda = await derivePDA(
        seeds,
        programId,
        new Map(),
        {},
        mockConnection,
        mockIdl
      );

      expect(pda).toBeInstanceOf(PublicKey);
    });

    it("should accept seed less than 32 bytes", async () => {
      const shortString = "test"; // 4 bytes < 32
      const seeds: PDASeed[] = [
        {
          kind: "const",
          value: Array.from(new TextEncoder().encode(shortString)),
        },
      ];

      const pda = await derivePDA(
        seeds,
        programId,
        new Map(),
        {},
        mockConnection,
        mockIdl
      );

      expect(pda).toBeInstanceOf(PublicKey);
    });
  });

  describe("custom program ID for PDA derivation", () => {
    it("should use custom program ID when pdaProgram is provided", async () => {
      const customProgramId = Keypair.generate().publicKey;
      const seeds: PDASeed[] = [
        {
          kind: "const",
          value: Array.from(new TextEncoder().encode("custom")),
        },
      ];

      const pdaProgram = {
        kind: "const" as const,
        value: Array.from(customProgramId.toBytes()),
      };

      const pda = await derivePDA(
        seeds,
        programId,
        new Map(),
        {},
        mockConnection,
        mockIdl,
        pdaProgram
      );

      // Verify it uses custom program ID
      const [expectedPda] = PublicKey.findProgramAddressSync(
        [new TextEncoder().encode("custom")],
        customProgramId
      );
      expect(pda.toString()).toBe(expectedPda.toString());
    });
  });
});
