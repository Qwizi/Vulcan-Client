const path = require('path')
const io = require('socket.io-client');
const ss = require('screenshot-desktop');
const { v4: uuidv4 } = require('uuid');
const {Builder, By, Key, until, Capabilities} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome')
const chromium = require('selenium-webdriver/chromium')
const {getAllInstalledSoftwareSync} = require('fetch-installed-software')
const fs = require('fs');
const AdmZip = require('adm-zip');
const request = require('request');
const axios = require('axios')
const {getInstalledBrowsers} = require('./drivers');
//const notifier = require('node-notifier');

getInstalledBrowsers().then(browsers => console.log(browsers));

const socket = io('http://localhost:3000/clients');

socket.on('connect', () => {
  console.log('Connected')
});

socket.on('disconnect', () => {
  console.log('Disconnected') // false
});

socket.on('screenshot', () => {
    ss({format: 'png'}).then((img) => {
        filename = `${uuidv4()}.png`;
        socket.emit('get_screenshoot', {img: img, filename: filename})
    })
})

/*const operaDriver = async () => {
    console.log(`Klient ma zainstalowana opere w wersji ${opera.DisplayVersion}`);
    fs.access('drivers/operadriver.exe', fs.F_OK, (err) => {
      if (err) {
        console.log('Plik nie istnieje i trzeba pobrac')
        const githubApiUrl = 'https://api.github.com'
        const repoOwner = 'operasoftware'
        const repoName = 'operachromiumdriver'
        const operadriverNameZip = 'operadriver_win64.zip'
        const operaVersionSplit = opera.DisplayVersion.split('.')
        const operaVersionForWebdriver = operaVersionSplit[0]
        axios.get(`${githubApiUrl}/repos/${repoOwner}/${repoName}/releases`)
          .then(res => {
            console.log(operaVersionForWebdriver);
            const result = res.data.find((item) => new RegExp(`Opera Stable ${operaVersionForWebdriver}`).test(item.body))
            console.log(result)
            const asset = result.assets.find((item) => item.name == operadriverNameZip);
            
            if (asset) {
              const downloadURL = asset.browser_download_url;
              request(downloadURL)
                .pipe(fs.createWriteStream(operadriverNameZip))
                .on('close', () => {
                  console.log('File written!');
                  zip = new AdmZip(operadriverNameZip)
                  zip.extractEntryTo(`operadriver_win64/operadriver.exe`, 'drivers/', false, true);
                  fs.unlink(operadriverNameZip, (err) => {
                    if (err) {
                      console.error(err)
                    }
                    console.log('Plik istnieje')
                    let service = new chrome.ServiceBuilder(path.join('drivers', 'operadriver.exe')).build()
                    chrome.setDefaultService(service)
          
                    return new Promise(new Builder()
                      .withCapabilities(Capabilities.chrome())
                      .build()
                  })
                })
            }
          })
      } else {
        console.log('Plik istnieje')
        let service = new chrome.ServiceBuilder(path.join('drivers', 'operadriver.exe')).build()
        chrome.setDefaultService(service)

        return new Promise(new Builder()
                      .withCapabilities(Capabilities.chrome())
                      .build()
      })
      }
    }
  }
}

const getAvailableDriver = async (data) => {
  const installedSoftware = getAllInstalledSoftwareSync();
  let google = null;
  let driver = null;
  //google = installedSoftware.find((soft) => soft.DisplayName == 'Google Chrome')
  if (google !== null) {
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
  } else {
    opera = installedSoftware.find((soft) => /^Opera Stable [0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/.test(soft.DisplayName))
    console.log(opera)
    if (opera) {
      console.log(`Klient ma zainstalowana opere w wersji ${opera.DisplayVersion}`);
      fs.access('drivers/operadriver.exe', fs.F_OK, (err) => {
        if (err) {
          console.log('Plik nie istnieje i trzeba pobrac')
          const githubApiUrl = 'https://api.github.com'
          const repoOwner = 'operasoftware'
          const repoName = 'operachromiumdriver'
          const operadriverNameZip = 'operadriver_win64.zip'
          const operaVersionSplit = opera.DisplayVersion.split('.')
          const operaVersionForWebdriver = operaVersionSplit[0]
          axios.get(`${githubApiUrl}/repos/${repoOwner}/${repoName}/releases`)
            .then(res => {
              console.log(operaVersionForWebdriver);
              const result = res.data.find((item) => new RegExp(`Opera Stable ${operaVersionForWebdriver}`).test(item.body))
              console.log(result)
              const asset = result.assets.find((item) => item.name == operadriverNameZip);
              
              if (asset) {
                const downloadURL = asset.browser_download_url;
                request(downloadURL)
                  .pipe(fs.createWriteStream(operadriverNameZip))
                  .on('close', () => {
                    console.log('File written!');
                    zip = new AdmZip(operadriverNameZip)
                    zip.extractEntryTo(`operadriver_win64/operadriver.exe`, 'drivers/', false, true);
                    fs.unlink(operadriverNameZip, (err) => {
                      if (err) {
                        console.error(err)
                      }
                      console.log('Plik istnieje')
                      let service = new chrome.ServiceBuilder(path.join('drivers', 'operadriver.exe')).build()
                      chrome.setDefaultService(service)
            
                      return new Promise(new Builder()
                        .withCapabilities(Capabilities.chrome())
                        .build()
                    })
                  })
              }
            })
        } else {
          console.log('Plik istnieje')
          let service = new chrome.ServiceBuilder(path.join('drivers', 'operadriver.exe')).build()
          chrome.setDefaultService(service)

          return new Promise(new Builder()
                        .withCapabilities(Capabilities.chrome())
                        .build()
                    })
        }
      })
    }
  }
  return await driver
}*/

socket.on('website', (data) => {
  let url = data.url
  getAvailableDriver(data).then(driver => {
   //driver.get(url)
    driver.navigate().refresh();
    socket.emit('website')
  })
})