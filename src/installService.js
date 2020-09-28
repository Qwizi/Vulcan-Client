const Service = require('node-windows').Service;

const svc = new Service({
    name: 'Vulcan Client',
    description: 'Vulcan Client',
    script: './index.js'
})

const updater = new Service({
    name: 'Vulcan Client Updater',
    description: 'Vulcan Client Updater',
    script: './updater.js'
})

svc.on('install',function(){
    svc.start();
});

updater.on('install', () => {
    updater.start()
})

svc.install();
updater.install()

module.exports = {
    svc: svc,
    updater: updater
}