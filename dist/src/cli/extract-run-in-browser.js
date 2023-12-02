const jsToEvaluateOnPage = async (options) => {
    /* global window */
    const callbackForEachStore = async (db, connection, storeName) => {
        if (options.store && storeName != options.store) {
            console.log(`Ignoring to read database "${db.name}" store "${storeName}" because user need to export ${options.store}`);
            return false;
        }
        const ret = await new Promise((resolveStore, rejectStore) => {
            const transaction = connection.result.transaction(storeName, 'readonly');
            console.log(`Starting to read database "${db.name}" store "${storeName}"`);
            transaction.onerror = (err) => {
                rejectStore(new Error(`Transaction error for store ${storeName}: ${err}`));
            };
            transaction.onabort = function (err) {
                rejectStore(new Error(`Transaction aborted for store ${storeName}: ${err}`));
            };
            const values = [];
            const onTransactionCursor = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    values.push(cursor.value);
                    cursor.continue();
                }
                else {
                    resolveStore(values);
                }
            };
            transaction.objectStore(storeName).openCursor().onsuccess = onTransactionCursor;
        });
        if (options.key) {
            return ret.filter(item => item[options.key].indexOf(options.keyvalue) !== -1);
        }
        return ret;
    };
    const callbackForEachDb = async (db) => {
        console.log(`Database "${db.name}", current version: ${db.version}`);
        let connection;
        let indexeddb;
        let objectStoreNames = [];
        try {
            connection = window.indexedDB.open(db.name);
            indexeddb = await new Promise((resolve, reject) => {
                connection.onsuccess = async () => {
                    resolve(connection.result);
                };
                connection.onerror = (e) => reject('Connection failed', e);
                connection.onupgradeneeded = (e) => reject('Upgrade needed', e);
                connection.onblocked = (e) => reject('Blocked', e);
            });
            const objectStoreNameRaw = Array.from(indexeddb.objectStoreNames).map(i => i.toString());
            objectStoreNames = [...objectStoreNameRaw].join(',').split(',');
        }
        catch (e) {
            throw new Error(`DB error connection ${e}`);
        }
        const dbExportObject = {
            databaseName: db.name,
            stores: [],
        };
        console.log(`Database "${db.name}" version ${db.version} has object stores:`, objectStoreNames.length);
        for (const storeName of objectStoreNames) {
            // console.log(`Looping through ${storeName}`);
            try {
                const values = await callbackForEachStore(db, connection, storeName);
                dbExportObject.stores.push({
                    storeName: storeName,
                    values: values,
                });
            }
            catch (e) {
                console.error('Error resolving object store', e, e);
            }
        }
        dbExportObject.stores = dbExportObject.stores.filter(({ values }) => values);
        return dbExportObject;
    };
    let databases = await window.indexedDB.databases();
    if (options.db) {
        databases = databases.filter(({ name }) => name.indexOf(options.db) !== -1);
    }
    console.log(`Found ${databases.length} databases`);
    if (options.includeStores) {
        const results = [];
        for (const db of databases) {
            try {
                results.push(await callbackForEachDb(db));
                console.log(`Finished exporting DB ${db.name}`);
            }
            catch (e) {
                console.error(`Error load db: ${db.name}`, { e });
            }
        }
        return results.filter((t) => t && t.stores.length);
    }
    else {
        return databases.map((database) => ({ databaseName: database }));
    }
};
module.exports = {
    jsToEvaluateOnPage,
};
