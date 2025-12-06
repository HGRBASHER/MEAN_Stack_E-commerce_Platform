const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('../utilities/logger.utils');
const createBackup = () => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFolder = path.join(__dirname, '..', 'backups', `backup-${timestamp}`);
        if (!fs.existsSync(backupFolder)) {
            fs.mkdirSync(backupFolder, { recursive: true });
        }
        const mongoURI = process.env.MONGO_URI;
        const command = `"C:\\Program Files\\MongoDB\\Tools\\100\\bin\\mongodump.exe" --uri="${mongoURI}" --out="${backupFolder}" --gzip`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                logger.error('Backup Error', { message: error.message, stack: error.stack });
                return;
            }
            logger.info(`Backup created successfully at: ${backupFolder}`);
            logger.debug(stdout);
        });
    } catch (err) {
        logger.error('Unexpected Backup Error', { message: err.message, stack: err.stack });
    }
};

module.exports = { createBackup };
