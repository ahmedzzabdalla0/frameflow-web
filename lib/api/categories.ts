import type { CategoryMap, Category, CreateCategoryBody, UpdateCategoryBody } from "@/types/api";
import { apiGet, apiPost, apiPut, apiDelete } from "./client";

export async function getCategoryMap(): Promise<CategoryMap> {
  return apiGet<CategoryMap>("/api/categories/");
}

export async function getCategories(): Promise<Category[]> {
  return apiGet<Category[]>("/api/categories/list");
}

export async function reorderCategories(ids: number[]): Promise<{ ok: true; ids: number[] }> {
  return apiPost("/api/categories/reorder", { ids });
}

export async function createCategory(
  body: CreateCategoryBody,
): Promise<{ ok: true; category: Category }> {
  return apiPost("/api/categories/", body);
}

export async function updateCategory(
  id: number,
  body: UpdateCategoryBody,
): Promise<{ ok: true; category: Category }> {
  return apiPut(`/api/categories/${id}`, body);
}

export async function deleteCategory(id: number): Promise<{ ok: true }> {
  return apiDelete(`/api/categories/${id}`);
}
