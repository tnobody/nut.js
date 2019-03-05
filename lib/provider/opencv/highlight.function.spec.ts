import { Point } from "../../point.class";
import { Region } from "../../region.class";
import { highlight } from "./highlight.function";

describe("highlight", () => {
  it("should draw a border around a given Region", async () => {
    // GIVEN
    const targetRegion = new Region(10, 10, 100, 100);

    // WHEN

    // THEN
    await expect(() => highlight(targetRegion)).not.toThrowError();
  });

  it("should draw a border around a given Point", async () => {
    // GIVEN
    const targetPoint = new Point(100, 100);

    // WHEN

    // THEN
    await expect(() => highlight(targetPoint)).not.toThrowError();
  });
});
