# ProGuard / R8 rules for Nurse Exam Preparation
# Root-level file: Expo prebuild copies this into android/app/proguard-rules.pro
# so custom keep-rules persist across `eas build` (prebuild --clean).
# These protect the React Native / Reanimated / Lottie / AdMob libraries from
# being stripped/obfuscated, and apply when you enable minify in release builds.

# React Native core
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class org.fbjni.** { *; }

# Reanimated + Worklets
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.worklets.** { *; }

# Lottie
-keep class com.airbnb.android.react.lottie.** { *; }
-keep class com.airbnb.lottie.** { *; }

# Google Mobile Ads (AdMob)
-keep class io.invertase.googlemobileads.** { *; }
-keep class com.google.android.gms.ads.** { *; }

# Async Storage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Expo modules
-keep class expo.modules.** { *; }

# SVG
-keep class com.horcrux.svg.** { *; }

# Safe area context
-keep class com.th3rdwave.safeareacontext.** { *; }

# Keep React Native bridge methods
-keepclassmembers,allowshrinking,allowobfuscation class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
}
