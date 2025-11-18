import { describe, it, expect } from "vitest";
import { isAccountPda } from "../pdaUtils";
import {
  accountPdaAccount,
  argPdaAccount,
  complexPdaAccount,
  mixedPdaAccount,
  nonPdaAccount,
  simplePdaAccount,
} from "@/tests/fixtures/accounts";

describe("pdaUtils", () => {
  it("should return true if the account is a pda", () => {
    expect(isAccountPda(simplePdaAccount)).toBe(true);
    expect(isAccountPda(argPdaAccount)).toBe(true);
    expect(isAccountPda(accountPdaAccount)).toBe(true);
    expect(isAccountPda(complexPdaAccount)).toBe(true);
    expect(isAccountPda(mixedPdaAccount)).toBe(true);
  });

  it("should return false if the account is not a pda", () => {
    expect(isAccountPda(nonPdaAccount)).toBe(false);
  });
});
