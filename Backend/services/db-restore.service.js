const { exec } = require('child_process');
const path = require('path');
const logger = require('../utilities/logger.utils');
const restoreDatabase = (folderName) => {
    try {
        const backupPath = path.join(__dirname, '..', 'backups', folderName, 'mystore');
        const mongoURI = process.env.MONGO_URI;

        const command = `"C:\\Program Files\\MongoDB\\Tools\\100\\bin\\mongorestore.exe" --uri="${mongoURI}" --drop --gzip "${backupPath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                logger.error('Restore Error', { message: error.message, stack: error.stack });
                return;
            }

            logger.info(`Database restored successfully`);
            logger.debug(stdout);
        });

    } catch (err) {
        logger.error('Unexpected Restore Error', { message: err.message, stack: err.stack });
    }
};

module.exports = { restoreDatabase };
