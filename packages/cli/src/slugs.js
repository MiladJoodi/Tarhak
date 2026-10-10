import { REGISTRY_NAMESPACE } from "./constants.js";

/** Normalize user input to bare slug: "animated-data-table". */
export function toSlug(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return "";
  if (value.startsWith(`${REGISTRY_NAMESPACE}/`)) {
    return value.slice(REGISTRY_NAMESPACE.length + 1);
  }
  if (value.startsWith("@") && value.includes("/")) {
    return value.split("/").pop() ?? value;
  }
  return value.replace(/^@/, "");
}

/** `@tarhak/<slug>` for farsiui. */
export function toRegistryItem(raw) {
  const slug = toSlug(raw);
  return slug ? `${REGISTRY_NAMESPACE}/${slug}` : "";
}
