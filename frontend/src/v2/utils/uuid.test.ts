import { afterEach, describe, expect, it, vi } from "vitest";
import { createUuid } from "./uuid";

afterEach(() => vi.unstubAllGlobals());

describe("createUuid", () => {
  it("preserves the browser-provided UUID when randomUUID is available", () => {
    const randomUUID = vi.fn(() => "123e4567-e89b-42d3-a456-426614174000");
    vi.stubGlobal("crypto", { randomUUID } as Crypto);

    expect(createUuid()).toBe("123e4567-e89b-42d3-a456-426614174000");
    expect(randomUUID).toHaveBeenCalledOnce();
  });

  it("creates an RFC 4122 v4 UUID from Web Crypto bytes without randomUUID", () => {
    const getRandomValues = vi.fn((bytes: Uint8Array) => {
      bytes.set(Array.from({ length: 16 }, (_, index) => index));
      return bytes;
    });
    vi.stubGlobal("crypto", { getRandomValues } as unknown as Crypto);

    expect(createUuid()).toBe("00010203-0405-4607-8809-0a0b0c0d0e0f");
    expect(getRandomValues).toHaveBeenCalledOnce();
  });

  it("rejects a browser without secure UUID or byte generation", () => {
    vi.stubGlobal("crypto", {});

    expect(createUuid).toThrow("Secure UUID generation is unavailable");
  });
});
