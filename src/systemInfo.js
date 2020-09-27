const si = require('systeminformation');

const getSystemInfo = async () => {
    const osData = await si.osInfo()
    const cpuData = await si.cpu();
    const gpuData = await si.graphics()
    const diskData = await si.diskLayout()
    gpuData.controllers.map(item => {
        delete item.bus;
        delete item.vramDynamic;
    });
    console.log(diskData)
    diskData.map(item => {
        delete item.vendor;
        delete item.device;
        delete item.bytesPerSector;
        delete item.totalCylinders;
        delete item.totalHeads;
        delete item.totalSectors;
        delete item.tracksPerCylinder;
        delete item.sectorsPerTrack;
        delete item.firmwareRevision;
        delete item.serialNum;
        delete item.smartStatus;
    });
    return {
        os: {
            platform: osData.platform,
            distro: osData.distro,
            hostname: osData.hostname,
            arch: osData.arch,
            build: osData.build
        },
        cpu: {
            manufacturer: cpuData.manufacturer,
            brand: cpuData.brand,
        },
        gpu: gpuData.controllers,
        disk: diskData
    }
}

module.exports = {
    getSystemInfo: getSystemInfo
}