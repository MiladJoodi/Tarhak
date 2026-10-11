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
    (/^poster(-[a-f0-9]{10})?\.avif$/.test(asset) ||
      /^video(-[a-f0-9]{10})?(\.(mp4|webm))?$/.test(asset))
  );
}

function resolveLocalPath(
  component: string,
  asset: string,
): { filePath: string; contentType: string; filename: string } | null {
  if (asset.startsWith("poster") && asset.endsWith(".avif")) {
    return {
      filePath: path.join(MEDIA_ROOT, "posters", `${component}.avif`),
      contentType: "image/avif",
      filename: `${component}.avif`,
    };
  }

  if (!asset.startsWith("video")) return null;

  const webmPath = path.join(MEDIA_ROOT, "videos", `${component}.webm`);
  const mp4Path = path.join(MEDIA_ROOT, "videos", `${component}.mp4`);

  if (asset.endsWith(".webm")) {
    return {
      filePath: webmPath,
      contentType: "video/webm",
      filename: `${component}.webm`,
    };
  }
  if (asset.endsWith(".mp4")) {
    // Prefer the requested mp4; fall back to webm so old clients keep working.
    if (existsSync(mp4Path)) {
      return {
        filePath: mp4Path,
        contentType: "video/mp4",
        filename: `${component}.mp4`,
      };
    }
    if (existsSync(webmPath)) {
      return {
        filePath: webmPath,
        contentType: "video/webm",
        filename: `${component}.webm`,
      };
    }
    return {
      filePath: mp4Path,
      contentType: "video/mp4",
      filename: `${component}.mp4`,
    };
  }

  // Extension-less `video` — prefer webm, then mp4.
  if (existsSync(webmPath)) {
    return {
      filePath: webmPath,
      contentType: "video/webm",
      filename: `${component}.webm`,
    };
  }
  return {
    filePath: mp4Path,
    contentType: "video/mp4",
    filename: `${component}.mp4`,
  };
}

/**
 * Serve browse posters/videos from the repo `browse-media/` folder.
 */
export async function GET(request: Request, { params }: Params) {
  const { component, asset } = await params;
  if (!isKnownComponentAsset(component, asset)) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  const resolved = resolveLocalPath(component, asset);
  if (!resolved || !existsSync(resolved.filePath)) {
    return NextResponse.json({ error: "Media not found" }, { status: 404 });
  }

  const { filePath, contentType, filename } = resolved;
  const stat = statSync(filePath);
  const isVideo = contentType.startsWith("video/");
  const range = request.headers.get("range");

  if (range && isVideo) {
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
            "Content-Disposition": `inline; filename="${filename}"`,
            "X-Content-Type-Options": "nosniff",
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
      "Content-Disposition": `inline; filename="${filename}"`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
