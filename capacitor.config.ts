import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.pontoprogestao.app",
  appName: "Ponto Pro Gestão",
  webDir: "capacitor-shell",
  server: {
    url: "https://vippontopro.app/quiosque",
    cleartext: false,
  },
};

export default config;