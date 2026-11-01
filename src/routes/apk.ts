import { createFileRoute, redirect } from "@tanstack/react-router";
import { ANDROID_APK_URL, androidDownloadResponse } from "@/lib/android-download";

export const Route = createFileRoute("/apk")({
  beforeLoad: () => { throw redirect({ href: ANDROID_APK_URL }); },
  server: { handlers: { GET: androidDownloadResponse, HEAD: androidDownloadResponse } },
});