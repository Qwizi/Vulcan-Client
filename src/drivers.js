const fs = require('fs')
const path = require('path')
const util = require('util')
const axios = require('axios')
const {getAllInstalledSoftware} = require('fetch-installed-software')
const AdmZip = require('adm-zip');
const {Builder, Capabilities} = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const edge = require('selenium-webdriver/edge');
const {logger} = require('./logger');


const fileAccess = util.promisify(fs.access);

// Pobieramy wszystkie zainstalowane przegladarki
const getInstalledBrowsers = async () => {
    const browsers = [];

    const softs = await getAllInstalledSoftware();
    const chrome = softs.find(soft => soft.DisplayName === 'Google Chrome');
    if (chrome) browsers.push({name: 'chrome', details: chrome, filename: 'chromedriver.exe'});

    const opera = softs.find((soft) => /^Opera Stable [0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/.test(soft.DisplayName))
    if (opera) browsers.push({name: 'opera', details: opera, filename: 'operadriver.exe'})

    const edge = softs.find((soft) => soft.displayName === 'Microsoft Edge');
    if (edge) browsers.push({name: 'edge', details: edge, filename: 'msedgedriver.exe'})
    logger.info(`Dostepne przeglaraki ${JSON.stringify(browsers)}`)

    return browsers
}

class DriverManager {
    constructor(data) {
        this.data = data;
    }

    getPath() {
        return `drivers/${this.data.filename}`
    }

    async createFile(response, path) {
        return new Promise(resolve => {
            const file = fs.createWriteStream(path)
            response.data.pipe(file)
            file.on('finish', () => file.close(resolve))
        })
    }

    async deleteFile(path) {
        return new Promise((resolve, reject) => {
            fs.unlink(path, (err) => {
                if (err) reject();
                resolve();
            })
        })
    }

    async unzipFile(path) {
        return new Promise(resolve => {
            const zip = new AdmZip(path)
            zip.extractAllTo('drivers/', true);
            resolve();
        })
    }
}

class ChromeDriver extends DriverManager
{
    async downloadDriver() {
        const chromeVersion = this.data.details.Version.substring(0, 2);
        try {
            let latestDriverVersion;
            const latestDriverVersionResponse = await axios.get(`http://chromedriver.storage.googleapis.com/LATEST_RELEASE_${chromeVersion}`)
            if (latestDriverVersionResponse.status === 200) {
                latestDriverVersion = latestDriverVersionResponse.data;
            }

            const driverZipFileName = 'chromedriver_win32.zip';
            const driverResponse = await axios.get(`http://chromedriver.storage.googleapis.com/${latestDriverVersion}/${driverZipFileName}`, {responseType: 'stream'})

            if (driverResponse.status === 200) {
                console.log(`Pobieram plik ${driverZipFileName}`);
                await this.createFile(driverResponse, driverZipFileName);
                console.log('Plik pobrany');
                console.log('Wypakowywuje archiwum')
                await this.unzipFile(driverZipFileName)
                console.log('Wypakowane');
                console.log('Usuwam archiwum');
                await this.deleteFile(driverZipFileName);
                console.log('Archiwum usuniete');

            }

        } catch (err) {
            console.log(err);
        }

    }
    async getDriver() {
        try {
            await fileAccess(this.getPath(), fs.F_OK)
            console.log('PLik istnieje');
        } catch (err) {
            console.log('Plik nie istnieje, musimy go pobrac');
            await this.downloadDriver()
        }
        console.log('Teraz tworzymy drivera');
        try {
            let service = new chrome.ServiceBuilder(path.join('drivers', 'chromedriver.exe')).build()
            chrome.setDefaultService(service)
        } catch (e) {
            console.log(e)
        }


        return new Builder()
            .withCapabilities(Capabilities.chrome())
            .build()
    }
}

class OperaDriver extends DriverManager
{
    async unzipEntryFile(path) {
        return new Promise(resolve => {
            const zip = new AdmZip(path)
            zip.extractEntryTo(`operadriver_win64/operadriver.exe`, 'drivers/', false, true);
            resolve();
        })
    }

    async downloadDriver() {
        const githubApiUrl = 'https://api.github.com'
        const repoOwner = 'operasoftware'
        const repoName = 'operachromiumdriver';
        const driverZipFileName = 'operadriver_win64.zip';
        const operaVersion = this.data.details.DisplayVersion.split('.')[0]
        try {
            const response = await axios.get(`${githubApiUrl}/repos/${repoOwner}/${repoName}/releases`)
            if (response.status === 200) {
                const result = response.data.find((item) => new RegExp(`Opera Stable ${operaVersion}`).test(item.body))
                const asset = result.assets.find((item) => item.name == driverZipFileName);
                if (asset) {
                    const downloadURL = asset.browser_download_url;
                    const driverRes = await axios.get(downloadURL, {responseType: 'stream'})

                    if (driverRes.status === 200) {
                        console.log(`Pobieram plik ${driverZipFileName}`);
                        await this.createFile(driverRes, driverZipFileName);
                        console.log('Plik pobrany');
                        console.log('Wypakowywuje archiwum')
                        await this.unzipEntryFile(driverZipFileName)
                        console.log('Wypakowane');
                        await this.deleteFile(driverZipFileName);
                        console.log('Archiwum usuniete');

                    }
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    async getDriver() {
        try {
            await fileAccess(this.getPath(), fs.F_OK)
            console.log('Plik istnieje')
        } catch (err) {
            console.log('Plik nie istnieje, musimy go pobrac');
            await this.downloadDriver()
        }
        console.log('Teraz tworzymy drivera');
        try {
            let service = new chrome.ServiceBuilder(path.join('drivers', 'operadriver.exe')).build()
            chrome.setDefaultService(service)
        } catch (e) {
            console.log(e);
        }


        return new Builder()
            .withCapabilities(Capabilities.chrome())
            .build()
    }
}

class EdgeDriver extends DriverManager
{
    async downloadDriver() {
        console.log(this.data);
    }

    async getDriver() {
        try {
            await fileAccess(this.getPath(), fs.F_OK)
            console.log('Plik istnieje')
        } catch (err) {
            console.log('Plik nie istnieje, musimy go pobrac')
            await this.downloadDriver()
        }

        try {
            let service = new edge.ServiceBuilder(path.join('drivers', 'msedgedriver.exe')).build()
            edge.setDefaultService(service)
        } catch (e) {
            console.log(e);
        }
    }
}


const getDriver = async () => {
    let driver = null;
    const browsers = await getInstalledBrowsers();
    if (browsers.length > 0) {
        const randomBrowserNumber = Math.floor(Math.random() * browsers.length);
        const browser = browsers[randomBrowserNumber];
        let driverInstance;
        switch(browser.name) {
            case 'chrome':
                driverInstance = new ChromeDriver(browser)
                break;
            case 'opera':
                driverInstance = new OperaDriver(browser);
                break;
        }
        driver = await driverInstance.getDriver();
    }
    return driver;
}

module.exports = {
    getDriver: getDriver
}