import { createReadStream, existsSync, statSync } from "fs";
import path from "path";
import { Readable } from "stream";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROOT = process.cwd();
const MEDIA_ROOT = path.join(ROOT, "browse-media");
const ONE_YEAR = "public, max-age=31536000, immutable";

type Params = { params: Promise<{ component: string; asset: string }> };

function isKnownComponentAsset(component: string, asset: string) {
  return (
    /^[a-z0-9-]+$/.test(component) &&
    /^(poster|video)(-[a-f0-9]{10})?\.(avif|mp4)$/.test(asset)
  );
}

function resolveLocalPath(component: string, asset: string): string | null {
  if (asset.startsWith("poster") && asset.endsWith(".avif")) {
    return path.join(MEDIA_ROOT, "posters", `${component}.avif`);
  }
  if (asset.startsWith("video") && asset.endsWith(".mp4")) {
    return path.join(MEDIA_ROOT, "videos", `${component}.mp4`);
  }
  return null;
}

/**
 * Serve browse posters/videos from the repo `browse-media/` folder.
 */
export async function GET(request: Request, { params }: Params) {
  const { component, asset } = await params;
  if (!isKnownComponentAsset(component, asset)) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  const filePath = resolveLocalPath(component, asset);
  if (!filePath || !existsSync(filePath)) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  const stat = statSync(filePath);
  const contentType = asset.endsWith(".avif") ? "image/avif" : "video/mp4";
  const range = request.headers.get("range");

  if (range && asset.endsWith(".mp4")) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (match) {
      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Number(match[2]) : stat.size - 1;
      if (
        Number.isFinite(start) &&
        Number.isFinite(end) &&
        start >= 0 &&
        end >= start &&
        end < stat.size
      ) {
        const stream = createReadStream(filePath, { start, end });
        return new Response(Readable.toWeb(stream) as ReadableStream, {
          status: 206,
          headers: {
            "Content-Type": contentType,
            "Content-Length": String(end - start + 1),
            "Content-Range": `bytes ${start}-${end}/${stat.size}`,
            "Accept-Ranges": "bytes",
            "Cache-Control": ONE_YEAR,
          },
        });
      }
    }
  }

  const stream = createReadStream(filePath);
  return new Response(Readable.toWeb(stream) as ReadableStream, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stat.size),
      "Accept-Ranges": "bytes",
      "Cache-Control": ONE_YEAR,
    },
  });
}
