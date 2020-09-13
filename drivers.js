const {getAllInstalledSoftware} = require('fetch-installed-software')



const getInstalledBrowsers = async () => {
    const browsers = [];

    const softs = await getAllInstalledSoftware();
    const chrome = softs.find(item => item.DisplayName == 'Google Chrome');
    if (chrome) browsers.push(chrome);
    return browsers
}

const googleDriver = async () => {
    console.log(`Klient ma zainstalowanego chroma w wersji ${google.Version}`);
      fs.access('drivers/chromedriver.exe', fs.F_OK, (err) => {
        if (err) {
          const chromedriverNameZip = 'chromedriver_win32.zip'
          const webdriverVersion = google.Version.substring(0, 2);
          request(`http://chromedriver.storage.googleapis.com/LATEST_RELEASE_${webdriverVersion}`, (error, response, body) => {
            if (response.statusCode == 200) {
                const finalWebdriverVersion = body;
                console.log(finalWebdriverVersion)
                request(`http://chromedriver.storage.googleapis.com/${finalWebdriverVersion}/${chromedriverNameZip}`)
                  .pipe(fs.createWriteStream(chromedriverNameZip))
                  .on('close', function () {
                    console.log('File written!');
                    zip = new AdmZip(chromedriverNameZip)
                    zip.extractAllTo('drivers/', true);
                    fs.unlink(chromedriverNameZip, (err) => {
                      if (err) {
                        console.error(err)
                      }
  
                    })
                  });
            }
          })
        }
      })
  
    let service = new chrome.ServiceBuilder(path.join('drivers', 'chromedriver.exe')).build()
      chrome.setDefaultService(service)
  
    driver = new Builder()
        .withCapabilities(Capabilities.chrome())
        .build()
}

module.exports = {
    getInstalledBrowsers: getInstalledBrowsers,
    googleDriver: googleDriver
}