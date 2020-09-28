const io = require('socket.io-client');
const fs = require('fs');
const {logger} = require('./logger');
const {svc} = require('./installService');
const axios = require('axios');

const socket = io('http://localhost:3000/updater');


socket.on('connect', () => {
    logger.info('Updater polaczony');
});

socket.on('disconnect', () => {
    logger.info('Updater rozlaczony');
});

const createFile = async(response, path) => {
    return new Promise(resolve => {
        const file = fs.createWriteStream(path)
        response.data.pipe(file)
        file.on('finish', () => file.close(resolve))
    })
}

socket.on('download_new_version', (data) => {
    (async () => {
        logger.info("Dostepna jest nowa wersja klienta");
        logger.debug("Wylaczamy usluge")
        svc.stop()
        logger.debug("Usluga wylaczona")
        logger.debug("Odinstalowujemy usluge")
        svc.uninstall()
        logger.debug("Pobieramy nowa wersje klienta")

        const newVersionUrl = data.release.zipball_url;
        try {
            const response = await axios.get(newVersionUrl, {responseType: 'stream'})
            if (response.status === 200) {
                await createFile(response, `${data.release.name}.zip`)
            }
        } catch (e) {
            logger.error(e);
        }
    })();

})