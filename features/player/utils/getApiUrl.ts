export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://192.168.1.32:3568";
}
