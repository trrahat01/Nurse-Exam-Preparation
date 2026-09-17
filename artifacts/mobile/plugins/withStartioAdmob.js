const { withAppBuildGradle } = require('expo/config-plugins');

/**
 * Adds the Start.io (StartApp) AdMob mediation adapter so that when AdMob's own
 * network has no fill, AdMob automatically waterfalls to Start.io as a mediated
 * ad source. Configure the custom event in the AdMob console:
 *   Class Name: io.start.mediation.admob.StartIoAdapter
 *   Parameter:  { appId : '208724361' }
 *
 * EAS runs `expo prebuild --clean`, so this dependency must be injected through a
 * config plugin (a direct android/ edit would be wiped).
 *
 * NOTE: We pin `com.startapp:inapp-sdk:5.2.6` (Kotlin 2.0.0). The latest 5.3.2
 * depends on kotlin-stdlib 2.4.0, which fails the RN 0.81/Expo 54 Gradle build.
 */
const STARTIO_ADAPTER_DEP = "implementation 'io.start:admob-mediation:3.1.1'";
const STARTIO_INAPP_PIN = "implementation 'com.startapp:inapp-sdk:5.2.6'";

function addStartioDependency(buildGradle) {
  const hasAdapter = buildGradle.includes('io.start:admob-mediation');
  const hasPin = buildGradle.includes('com.startapp:inapp-sdk:5.2.6');
  if (hasAdapter && hasPin) {
    return buildGradle;
  }
  const insert = `\n    ${STARTIO_ADAPTER_DEP}\n    ${STARTIO_INAPP_PIN}`;
  const idx = buildGradle.lastIndexOf('dependencies {');
  if (idx === -1) {
    throw new Error('withStartioAdmob: could not locate dependencies block in app build.gradle');
  }
  const open = buildGradle.indexOf('{', idx) + 1;
  return buildGradle.slice(0, open) + insert + buildGradle.slice(open);
}

module.exports = function withStartioAdmob(config) {
  return withAppBuildGradle(config, (cfg) => {
    cfg.modResults.contents = addStartioDependency(cfg.modResults.contents);
    return cfg;
  });
};