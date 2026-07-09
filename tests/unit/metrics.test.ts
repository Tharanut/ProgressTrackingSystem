import { describe, expect, it } from "vitest";

import {
  capacityRemainingPercent,
  daysBetween,
  isOverload,
  isProjectOverdue,
  utilizationPercent,
  variance,
} from "@/lib/metrics";

describe("variance", () => {
  it("computes Variance = Actual - Planned and Variance % (spec §9.4)", () => {
    // Duration example from docs/spec.md §6.8: Planned 10, Actual 13 -> +3, +30%
    expect(variance(10, 13)).toEqual({ variance: 3, variancePercent: 30 });
    // Man-Day example: Planned 20, Actual 25 -> +5, +25%
    expect(variance(20, 25)).toEqual({ variance: 5, variancePercent: 25 });
    // Cost example: Planned 40000, Actual 52000 -> +12000, +30%
    expect(variance(40000, 52000)).toEqual({ variance: 12000, variancePercent: 30 });
  });

  it("returns a negative variance when actual is under plan", () => {
    expect(variance(20, 15)).toEqual({ variance: -5, variancePercent: -25 });
  });

  it("returns null variancePercent when planned is 0 (avoid division by zero)", () => {
    expect(variance(0, 10)).toEqual({ variance: 10, variancePercent: null });
  });

  it("returns zero variance when planned equals actual", () => {
    expect(variance(10, 10)).toEqual({ variance: 0, variancePercent: 0 });
  });
});

describe("utilizationPercent", () => {
  it("computes Actual / Planned * 100, rounded (spec §6.9 example: 26/20 -> 130%)", () => {
    expect(utilizationPercent(20, 26)).toBe(130);
    expect(utilizationPercent(15, 12)).toBe(80);
    expect(utilizationPercent(30, 35)).toBe(117);
  });

  it("returns 0 when planned is 0 (avoid division by zero)", () => {
    expect(utilizationPercent(0, 10)).toBe(0);
  });

  it("returns 0 when both planned and actual are 0", () => {
    expect(utilizationPercent(0, 0)).toBe(0);
  });
});

describe("isOverload", () => {
  it("is true only when utilization exceeds 100%", () => {
    expect(isOverload(130)).toBe(true);
    expect(isOverload(101)).toBe(true);
    expect(isOverload(100)).toBe(false);
    expect(isOverload(80)).toBe(false);
  });
});

describe("capacityRemainingPercent", () => {
  it("is the inverse of utilization when under 100%", () => {
    expect(capacityRemainingPercent(80)).toBe(20);
    expect(capacityRemainingPercent(0)).toBe(100);
  });

  it("clamps to 0 when overloaded (never negative)", () => {
    expect(capacityRemainingPercent(130)).toBe(0);
    expect(capacityRemainingPercent(100)).toBe(0);
  });
});

describe("daysBetween", () => {
  it("computes whole days between two ISO dates", () => {
    expect(daysBetween("2026-07-01", "2026-07-11")).toBe(10);
  });

  it("returns null when either date is missing", () => {
    expect(daysBetween(null, "2026-07-11")).toBeNull();
    expect(daysBetween("2026-07-01", null)).toBeNull();
    expect(daysBetween(null, null)).toBeNull();
  });

  it("returns 0 for the same date", () => {
    expect(daysBetween("2026-07-01", "2026-07-01")).toBe(0);
  });
});

describe("isProjectOverdue", () => {
  const today = "2026-07-15";

  it("is true when planned_end_date has passed and progress is under 100%", () => {
    expect(isProjectOverdue("2026-07-10", 80, today)).toBe(true);
  });

  it("is false when progress already reached 100% even past the planned end date", () => {
    expect(isProjectOverdue("2026-07-10", 100, today)).toBe(false);
  });

  it("is false when the planned end date hasn't arrived yet", () => {
    expect(isProjectOverdue("2026-07-20", 50, today)).toBe(false);
  });

  it("is false when there is no planned end date", () => {
    expect(isProjectOverdue(null, 50, today)).toBe(false);
  });

  it("is false on the planned end date itself (not yet overdue)", () => {
    expect(isProjectOverdue(today, 50, today)).toBe(false);
  });
});
