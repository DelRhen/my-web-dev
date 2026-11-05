/**
 * app.js - Global initialization
 */
const App = (() => {
  const init = async () => {
    // Optionally log API version for diagnostics
    try {
      const versionRes = await Api.getVersion();
      if (versionRes && versionRes.success && versionRes.data) {
        console.log(`VALORANT API Version: ${versionRes.data.version || versionRes.data.branch || 'Online'}`);
      }
    } catch (e) {
      // Quiet fail for optional version check
    }
  };

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
