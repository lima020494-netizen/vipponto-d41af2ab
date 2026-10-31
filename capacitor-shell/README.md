# Android hosted shell

The Capacitor configuration starts at `https://vippontopro.app/quiosque` with app ID `com.pontoprogestao.app`. The hosted application keeps its existing authentication, offline queue and operational engine.

After approving and publishing the web changes, run `bunx cap add android`, then `bunx cap sync android` and `bunx cap open android` in an Android development environment. This configuration is a starting point, not a built or signed APK. Android Studio, SDK, signing credentials and physical-device validation remain required. Capacitor alone does not provide a Sunmi printer bridge; native printer integration must be implemented and tested separately.