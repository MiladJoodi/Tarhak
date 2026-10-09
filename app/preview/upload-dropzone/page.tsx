import type { Metadata } from "next";

import UploadDropzone from "@/registry/default/example/upload-dropzone";

export const metadata: Metadata = {
  title: "Upload Dropzone",
  robots: { index: false, follow: false },
};

export default function UploadDropzonePreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <UploadDropzone />
    </main>
  );
}
