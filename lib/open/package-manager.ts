export const PACKAGE_MANAGERS = ["npm", "bun", "yarn", "pnpm"] as const;

export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

export const PACKAGE_MANAGER_STORAGE_KEY = "tarhak.package-manager.v2";
export const REGISTRY_NAMESPACE = "@tarhak";

export function registryItem(slug: string) {
  return `${REGISTRY_NAMESPACE}/${slug}`;
}

/** Registry slug used in copy_events / copy counts (`animated-collection`). */
export function copyEventSlug(value: string) {
  const slug = value.trim();
  const prefix = `${REGISTRY_NAMESPACE}/`;
  return slug.startsWith(prefix) ? slug.slice(prefix.length) : slug;
}

export function isPackageManager(value: string): value is PackageManager {
  return (PACKAGE_MANAGERS as readonly string[]).includes(value);
}

/** Bare slug for `tarhak add` (strips `@tarhak/`). */
export function installSlug(item: string) {
  return copyEventSlug(item);
}

const TARHAK_CLI = "@tarhak/cli@latest";

export function cliInstallCommand(manager: PackageManager, item: string) {
  const slug = installSlug(item);
  switch (manager) {
    case "bun":
      return `bunx --bun ${TARHAK_CLI} add ${slug}`;
    case "yarn":
      return `yarn dlx ${TARHAK_CLI} add ${slug}`;
    case "pnpm":
      return `pnpm dlx ${TARHAK_CLI} add ${slug}`;
    default:
      return `npx ${TARHAK_CLI} add ${slug}`;
  }
}

export function manualInstallCommand(manager: PackageManager, packages: string[]) {
  const list = packages.join(" ");
  if (!list) return "";
  switch (manager) {
    case "bun":
      return `bun add ${list}`;
    case "yarn":
      return `yarn add ${list}`;
    case "pnpm":
      return `pnpm add ${list}`;
    default:
      return `npm install ${list}`;
  }
}

export function parseDependencyTag(raw: string): { name: string; version: string } {
  const value = raw.trim();
  if (!value) return { name: "", version: "" };
  if (value.startsWith("@")) {
    const second = value.indexOf("@", 1);
    if (second === -1) return { name: value, version: "" };
    return { name: value.slice(0, second), version: value.slice(second + 1) };
  }
  const at = value.indexOf("@");
  if (at === -1) return { name: value, version: "" };
  return { name: value.slice(0, at), version: value.slice(at + 1) };
}

export function serializeDependencyTag(name: string, version?: string) {
  const pkg = name.trim();
  const ver = version?.trim();
  if (!pkg) return "";
  return ver ? `${pkg}@${ver}` : pkg;
}
