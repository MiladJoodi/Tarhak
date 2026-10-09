import type { Metadata } from "next";

import FileUploadProgress from "@/registry/default/example/file-upload-progress";

export const metadata: Metadata = {
  title: "File Upload Progress",
  robots: { index: false, follow: false },
};

export default function FileUploadProgressPreviewPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <FileUploadProgress />
    </main>
  );
}
