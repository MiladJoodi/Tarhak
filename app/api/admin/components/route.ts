import { NextResponse } from "next/server";
import { assertDevOnly } from "@/lib/admin/guard";
import {
  listComponents,
  upsertComponent,
} from "@/lib/admin/components-fs";
import { extractControlsFromSource } from "@/lib/admin/dial-extract";
import { getComponentCopyCounts } from "@/lib/supabase/admin";

export async function GET() {
  try {
    assertDevOnly();
    const [items, copyCounts] = await Promise.all([
      listComponents(),
      getComponentCopyCounts(),
    ]);
    const ranked = items
      .map((item) => ({
        ...item,
        copies: copyCounts[item.name]?.copies ?? 0,
        lastCopiedAt: copyCounts[item.name]?.lastCopiedAt ?? null,
      }))
      .sort(
        (a, b) =>
          b.copies - a.copies || a.title.localeCompare(b.title),
      );
    return NextResponse.json({ items: ranked });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    const status = message.includes("development") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    assertDevOnly();
    const body = await request.json();
    const {
      name,
      title,
      description,
      code,
      dependencies,
      features,
      dialConfig,
      disabledControls,
      previewBackground,
      hintTop,
      showHint,
      hintKind,
      hintHeading,
      hintDescription,
      hintHideOnScroll,
      tags,
    } = body;

    if (!title || !description || !code) {
      return NextResponse.json(
        { error: "title, description, and code are required" },
        { status: 400 },
      );
    }

    const extracted = extractControlsFromSource(code);
    const result = await upsertComponent({
      name,
      title,
      description,
      code,
      dependencies,
      features,
      dialConfig: dialConfig ?? extracted.dialConfig,
      disabledControls: disabledControls ?? [],
      previewBackground,
      hintTop,
      showHint,
      hintKind,
      hintHeading,
      hintDescription,
      hintHideOnScroll,
      tags,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    const status = message.includes("development") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
