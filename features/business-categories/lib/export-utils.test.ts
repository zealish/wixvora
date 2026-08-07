import { describe, it, expect } from "vitest";
import { prepareExportData } from "./export-utils";
import type { CategoryWithChildren } from "../types";

describe("prepareExportData", () => {
  it("should flatten hierarchical categories with parent names", () => {
    const categories: CategoryWithChildren[] = [
      {
        id: "1",
        name: "Food & Beverage",
        slug: "food-beverage",
        icon: "Utensils",
        displayOrder: 1,
        status: "active",
        parentId: null,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
        children: [
          {
            id: "2",
            name: "Restaurant",
            slug: "restaurant",
            icon: "ChefHat",
            displayOrder: 1,
            status: "active",
            parentId: "1",
            createdAt: new Date("2026-01-02"),
            updatedAt: new Date("2026-01-02"),
            children: [],
          },
        ],
      },
    ];

    const result = prepareExportData(categories, []);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      name: "Food & Beverage",
      slug: "food-beverage",
      parentCategory: "—",
      icon: "Utensils",
      displayOrder: 1,
      status: "active",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(result[1]).toEqual({
      name: "Restaurant",
      slug: "restaurant",
      parentCategory: "Food & Beverage",
      icon: "ChefHat",
      displayOrder: 1,
      status: "active",
      createdAt: "2026-01-02T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    });
  });

  it("should filter by selectedIds when provided", () => {
    const categories: CategoryWithChildren[] = [
      {
        id: "1",
        name: "Category 1",
        slug: "category-1",
        icon: null,
        displayOrder: 1,
        status: "active",
        parentId: null,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
        children: [],
      },
      {
        id: "2",
        name: "Category 2",
        slug: "category-2",
        icon: null,
        displayOrder: 2,
        status: "active",
        parentId: null,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
        children: [],
      },
    ];

    const result = prepareExportData(categories, ["1"]);

    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("Category 1");
  });

  it("should handle categories without icons", () => {
    const categories: CategoryWithChildren[] = [
      {
        id: "1",
        name: "No Icon",
        slug: "no-icon",
        icon: null,
        displayOrder: 1,
        status: "active",
        parentId: null,
        createdAt: new Date("2026-01-01"),
        updatedAt: new Date("2026-01-01"),
        children: [],
      },
    ];

    const result = prepareExportData(categories, []);

    expect(result[0]?.icon).toBe("—");
  });
});
