const winston = require('winston')

const logger = winston.createLogger(
    {
        level: 'info',
        format: winston.format.json(),
        defaultMeta: {service: 'user-service'},
        transports: [
            new winston.transports.File({filename: 'error.log', level:'error'}),
            new winston.transports.File({filename: 'combined.log'})
        ],
        exceptionHandlers: [
            new winston.transports.File({filename: 'exceptions.log'})
        ]
    }
)

module.exports = {
    logger: logger
}