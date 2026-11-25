export type ApiSurface = "office" | "field";

export function apiSurfacePath(surface: ApiSurface, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `/${surface}${normalizedPath}`;
}
