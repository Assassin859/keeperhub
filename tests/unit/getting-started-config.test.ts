import { describe, expect, it } from "vitest";
import {
  getMonitorTargets,
  SEPOLIA_CHAIN_ID,
  TESTNET_AAVE_SEPOLIA_POOL,
  TESTNET_READY_BADGE,
} from "@/lib/onboarding/getting-started-config";

describe("getMonitorTargets", () => {
  it("injects Sepolia Aave pool when testnet workspace is Sepolia", () => {
    const chips = getMonitorTargets({
      isTestnetWorkspace: true,
      chainId: SEPOLIA_CHAIN_ID,
    });
    const aave = chips.find((chip) => chip.id === "aave-health");
    expect(aave?.prompt).toContain(TESTNET_AAVE_SEPOLIA_POOL);
    expect(aave?.badge).toBe(TESTNET_READY_BADGE);
  });

  it("uses generic prompts without badge for default context", () => {
    const chips = getMonitorTargets({});
    const aave = chips.find((chip) => chip.id === "aave-health");
    expect(aave?.prompt).toBe(
      "Monitor my Aave v3 health factor every hour and alert me when it drops below 1.5."
    );
    expect(aave?.badge).toBeUndefined();
    expect(aave?.prompt).not.toContain(TESTNET_AAVE_SEPOLIA_POOL);
  });

  it("injects wallet address into whale withdrawal chip", () => {
    const chips = getMonitorTargets({
      walletAddress: "0xabc1234567890123456789012345678901234567",
    });
    const whale = chips.find((chip) => chip.id === "whale-withdrawal");
    expect(whale?.prompt).toContain(
      "0xabc1234567890123456789012345678901234567"
    );
  });
});
