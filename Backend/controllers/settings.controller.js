const { createBackup } = require('../services/db-backup.service');
const { restoreDatabase } = require('../services/db-restore.service');

exports.createNewBackup = async (req, res) => {
    try {
        await createBackup(); 
        res.status(201).json({ message: 'Backup created' });
    } catch (err) {
        res.status(500).json({ message: `Error, backup failed: ${err.message}` });
    }
}

exports.restoreNewDatabase = async (req, res) => {
    try {
        const folderName = req.params.folderName;
        await restoreDatabase(folderName); 
        res.status(200).json({ message: 'Database restored' });
    } catch (err) {
        res.status(500).json({ message: `Error, restore failed: ${err.message}` });
    }
}

