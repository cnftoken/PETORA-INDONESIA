import { describe, expect, it } from "vitest";
import { formatRupiah } from "./idr";

describe("formatRupiah", () => {
  it("formats integer Rupiah with Indonesian grouping", () => {
    expect(formatRupiah(269500)).toBe("Rp269.500");
  });
});
