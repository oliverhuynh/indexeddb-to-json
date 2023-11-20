"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const csv_writer_1 = require("csv-writer");
const utils_1 = require("./utils");
const extract_1 = __importDefault(require("./extract"));
async function discover(options) {
    const searchPaths = [
        // MacOS:
        `${os_1.homedir}/Library`,
        // Windows:
        `${os_1.homedir}/AppData`,
        // Linux:
        `${os_1.homedir}/.config`,
    ];
    const ignoreDirs = ['**/.git/**', '**/node_modules/**'];
    async function findIndexedDbRootsInPath(path) {
        const roots = await utils_1.globPromise('**/CURRENT', {
            cwd: path,
            realpath: true,
            nosort: true,
            nodir: true,
            nocase: false,
            dot: true,
            ignore: ignoreDirs,
        });
        return roots.map((file) => file.replace(/\/CURRENT$/, ''));
    }
    searchPaths.forEach((searchPath) => {
        if (!searchPath.startsWith('/')) {
            throw new Error('Search path must start with / but got: ' + searchPath);
        }
        else if (searchPath.endsWith('/')) {
            throw new Error('Search path must not end with / but got: ' + searchPath);
        }
        console.log('Searching ' + searchPath);
    });
    const globPromises = searchPaths.map((searchPath) => {
        return utils_1.globPromise(searchPath + '/**/*indexeddb*/', {
            realpath: true,
            nosort: true,
            nocase: true,
            dot: true,
            ignore: ignoreDirs,
        });
    });
    const potentialDirsDeep = await Promise.all(globPromises);
    let potentialDirs = potentialDirsDeep
        .filter((dir) => dir.length > 0)
        .reduce((prev, current) => {
        return prev.concat(current);
    }, []);
    potentialDirs = utils_1.unique(potentialDirs);
    const searchPromises = potentialDirs.map(findIndexedDbRootsInPath);
    const indexedDbRootsDeep = await Promise.all(searchPromises);
    let indexedDbRootPaths = indexedDbRootsDeep
        .filter((roots) => roots.length > 0)
        .reduce((prev, current) => {
        return prev.concat(current);
    }, []);
    indexedDbRootPaths = utils_1.unique(indexedDbRootPaths);
    let indexedDbRoots = await Promise.all(indexedDbRootPaths.map(async (directory) => {
        const size = await utils_1.getFolderSizeInMb(directory);
        const type = directory.toLowerCase().includes('slack')
            ? 'Slack'
            : directory.toLowerCase().includes('teams')
                ? 'Teams'
                : 'Unknown';
        let extractError = undefined;
        let databaseCount = undefined;
        if (options.includeDatabaseCounts) {
            try {
                const databases = (await extract_1.default(directory, {
                    return: options.return,
                    includeStores: false,
                }));
                databaseCount = databases.length;
            }
            catch (e) {
                extractError = e.message;
            }
        }
        return { directory, size, type, databaseCount, extractError };
    }));
    console.log('Found ' + indexedDbRoots.length + ' IndexedDB root(s)');
    indexedDbRoots = indexedDbRoots.sort((a, b) => {
        if (options.includeDatabaseCounts &&
            typeof a.databaseCount === 'number' &&
            typeof b.databaseCount === 'number') {
            return b.databaseCount - a.databaseCount;
        }
        else {
            return a.directory.localeCompare(b.directory);
        }
    });
    async function printRoots(roots) {
        if (roots.length === 0) {
            return;
        }
        const csvHeaders = [
            { id: 'directory', title: 'Directory' },
            { id: 'size', title: 'Size in MB' },
            { id: 'type', title: 'Type' },
        ];
        if (options.includeDatabaseCounts) {
            csvHeaders.push({
                id: 'databaseCount',
                title: 'Database count',
            });
        }
        if (options.csv) {
            const outputFile = 'discovered-indexeddb-' + utils_1.timestampForFilename() + '.csv';
            const csvWriter = csv_writer_1.createObjectCsvWriter({
                path: outputFile,
                header: csvHeaders,
            });
            await csvWriter.writeRecords(roots);
            console.log('Wrote to ' + outputFile);
        }
        else if (options.stdout) {
            const csvWriter = csv_writer_1.createObjectCsvStringifier({
                header: csvHeaders,
            });
            console.log(csvWriter.getHeaderString().trim());
            console.log(csvWriter.stringifyRecords(roots).trim());
        }
    }
    if (options.csv || options.stdout) {
        printRoots(indexedDbRoots);
    }
    else if (options.return) {
        return indexedDbRoots;
    }
    else {
        throw new Error('Must use --stdout or --csv');
    }
}
exports.default = discover;
