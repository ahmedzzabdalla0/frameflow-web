import type { Settings } from "@/types/api";
import { apiGet, apiPost } from "./client";

export async function getSettings(): Promise<Settings> {
  return apiGet<Settings>("/api/settings/");
}

export async function saveSettings(settings: Settings): Promise<{ ok: true }> {
  return apiPost("/api/settings/", settings);
}
