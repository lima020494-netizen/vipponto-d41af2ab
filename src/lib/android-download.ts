export const ANDROID_APK_URL = "https://github.com/lima020494-netizen/pontoprogestao/releases/latest/download/Ponto-pro-gestao.apk";

export function androidDownloadResponse() {
  return new Response(null, { status: 302, headers: { Location: ANDROID_APK_URL, "Cache-Control": "no-store" } });
}