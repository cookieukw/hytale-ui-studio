import { describe, it, expect } from "vitest";
import { nineSliceInsets } from "../components/editor/utils/nine-slice";

describe("nineSliceInsets", () => {
  it("returns null when no border is declared", () => {
    expect(nineSliceInsets({ texture: "Panel.png" })).toBeNull();
  });

  it("applies a uniform Border to all four edges", () => {
    expect(nineSliceInsets({ border: 46 })).toEqual({
      top: 46,
      right: 46,
      bottom: 46,
      left: 46,
    });
  });

  it("supports HorizontalBorder on its own", () => {
    // TopBar/Background.png ships with only HorizontalBorder: 74.
    expect(nineSliceInsets({ horizontalBorder: 74 })).toEqual({
      top: 0,
      right: 74,
      bottom: 0,
      left: 74,
    });
  });

  it("supports VerticalBorder on its own", () => {
    expect(nineSliceInsets({ verticalBorder: 12 })).toEqual({
      top: 12,
      right: 0,
      bottom: 12,
      left: 0,
    });
  });

  it("lets the axis-specific values override Border", () => {
    expect(nineSliceInsets({ border: 8, horizontalBorder: 30 })).toEqual({
      top: 8,
      right: 30,
      bottom: 8,
      left: 30,
    });
  });

  it("treats an all-zero border as plain stretching", () => {
    expect(nineSliceInsets({ border: 0 })).toBeNull();
  });

  it("clamps negative values instead of emitting invalid CSS", () => {
    expect(nineSliceInsets({ border: -5 })).toBeNull();
  });
});
