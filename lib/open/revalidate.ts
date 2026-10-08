import { revalidatePath } from "next/cache";

/** Invalidate the open component page + shared layout nav after admin writes. */
export function revalidateOpenComponent(slug: string) {
  const name = slug.trim();
  if (!name) return;
  revalidatePath(`/docs/components/${name}`);
  revalidatePath("/docs/components", "layout");
}
