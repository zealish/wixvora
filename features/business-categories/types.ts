export type CategoryStatus = "active" | "inactive";

export interface CategoryWithChildren {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  displayOrder: number;
  status: CategoryStatus;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  children: CategoryWithChildren[];
}

export interface CategoryListItem {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  displayOrder: number;
  status: CategoryStatus;
  parentId: string | null;
  childrenCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryActionResult {
  success: boolean;
  error?: string;
  data?: { id: string };
}
