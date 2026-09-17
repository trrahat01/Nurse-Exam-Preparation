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
 */
const STARTIO_ADAPTER_DEP = "implementation 'io.start:admob-mediation:3.1.1'";

function addStartioDependency(buildGradle) {
  if (buildGradle.includes('io.start:admob-mediation')) {
    return buildGradle;
  }
  // Insert at the top of the last `dependencies { ... }` block of app/build.gradle.
  const idx = buildGradle.lastIndexOf('dependencies {');
  if (idx === -1) {
    throw new Error('withStartioAdmob: could not locate dependencies block in app build.gradle');
  }
  const open = buildGradle.indexOf('{', idx) + 1;
  return buildGradle.slice(0, open) + `\n    ${STARTIO_ADAPTER_DEP}` + buildGradle.slice(open);
}

module.exports = function withStartioAdmob(config) {
  return withAppBuildGradle(config, (cfg) => {
    cfg.modResults.contents = addStartioDependency(cfg.modResults.contents);
    return cfg;
  });
};