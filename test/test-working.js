const wdio = require('webdriverio');

const opts = {
    port: 4723,
    capabilities: {
      platformName: "Android",
      platformVersion: "7",
      deviceName: "Android Emulator",
      app: "/home/luke/jupiter/jupiter-app/test/jupiter-standalone.apk",
      appPackage: "com.jupitersave.app",
      automationName: "UiAutomator2",
      noSign: true
    }
  };
  
  async function main () {
    const client = await wdio.remote(opts);
  
    await client.deleteSession();
  }
  
  main();
  