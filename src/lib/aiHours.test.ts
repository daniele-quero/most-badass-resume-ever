import { describe, expect, it } from "vitest";
import { computeAiHours } from "./aiHours";

describe("computeAiHours", () => {
  it("computes the breakdown for a known reference date", () => {
    const result = computeAiHours(new Date(2026, 8, 1));

    expect(result).toEqual({
      spanDays: 184,
      workingDays: 131,
      vacationDays: 10,
      effectiveDays: 121,
      hours: 726
    });
  });

  it("returns all zeros before the AI contact date", () => {
    const result = computeAiHours(new Date(2026, 1, 15));

    expect(result).toEqual({
      spanDays: 0,
      workingDays: 0,
      vacationDays: 0,
      effectiveDays: 0,
      hours: 0
    });
  });

  it("returns all zeros on the contact date itself (no elapsed days yet)", () => {
    const result = computeAiHours(new Date(2026, 2, 1));

    expect(result).toEqual({
      spanDays: 0,
      workingDays: 0,
      vacationDays: 0,
      effectiveDays: 0,
      hours: 0
    });
  });

  it("scales the vacation allowance with the elapsed span", () => {
    const oneYearLater = computeAiHours(new Date(2027, 2, 2));

    expect(oneYearLater.spanDays).toBe(366);
    expect(oneYearLater.vacationDays).toBe(20);
  });
});
