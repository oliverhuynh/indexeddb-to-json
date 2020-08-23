import {homedir} from 'os';
import {createObjectCsvWriter, createObjectCsvStringifier} from 'csv-writer';
import {timestampForFilename, getFolderSizeInMb, globPromise, unique} from './utils';

export type DatabaseType = 'Unknown' | 'Slack' | 'Teams';

interface IndexedDBRoot {
    directory: string;
    size: number;
    type: DatabaseType;
}

interface CommandOptions {
    csv?: boolean;
    stdout?: boolean;
    return?: boolean;
}

export default async function discover(options: CommandOptions): Promise<void | IndexedDBRoot[]> {
    const searchPaths = [
        // MacOS:
        `${homedir}/Library`,
        // Windows:
        `${homedir}/AppData`,
        // Linux:
        `${homedir}/.config`,
        // You might also want to search:
        // homedir,
        // MacOS's Time Machine backups:
        // '/Volumes/*/Backups.backupdb/*/*/* - Data/Users/*/Library'
    ];

    const ignoreDirs = ['**/.git/**', '**/node_modules/**'];

    async function findIndexedDbRootsInPath(path: string): Promise<string[]> {
        const roots = await globPromise('**/CURRENT', {
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
        } else if (searchPath.endsWith('/')) {
            throw new Error('Search path must not end with / but got: ' + searchPath);
        }
        console.log('Searching ' + searchPath);
    });

    const globPromises: Promise<string[]>[] = searchPaths.map((searchPath) => {
        return globPromise(searchPath + '/**/*indexeddb*/', {
            realpath: true,
            nosort: true,
            nocase: true,
            dot: true,
            ignore: ignoreDirs,
        });
    });

    const potentialDirsDeep: string[][] = await Promise.all(globPromises);
    let potentialDirs: string[] = potentialDirsDeep
        .filter((dir) => dir.length > 0)
        .reduce((prev, current) => {
            return prev.concat(current);
        }, []);
    potentialDirs = unique(potentialDirs);

    const searchPromises: Promise<string[]>[] = potentialDirs.map(findIndexedDbRootsInPath);
    const indexedDbRootsDeep: string[][] = await Promise.all(searchPromises);
    let indexedDbRoots = indexedDbRootsDeep
        .filter((roots: string[]) => roots.length > 0)
        .reduce((prev: string[], current: string[]): string[] => {
            return prev.concat(current);
        }, [] as string[]);
    indexedDbRoots = unique(indexedDbRoots);
    indexedDbRoots = indexedDbRoots.sort((a, b) => a.localeCompare(b));

    const databases: IndexedDBRoot[] = await Promise.all(
        indexedDbRoots.map(async (directory: string) => {
            const size = await getFolderSizeInMb(directory);
            const type: DatabaseType = directory.toLowerCase().includes('slack')
                ? 'Slack'
                : directory.toLowerCase().includes('teams')
                ? 'Teams'
                : 'Unknown';
            return {directory, size, type};
        }),
    );

    console.log('Found ' + databases.length + ' database(s)');

    async function printDatabases(databases: IndexedDBRoot[]) {
        if (databases.length === 0) {
            return;
        }

        const csvHeaders = [
            {id: 'directory', title: 'Directory'},
            {id: 'size', title: 'Size in MB'},
            {id: 'type', title: 'Type'},
        ];

        if (options.csv) {
            const outputFile = 'discovered-indexeddb-' + timestampForFilename() + '.csv';
            const csvWriter = createObjectCsvWriter({
                path: outputFile,
                header: csvHeaders,
            });
            await csvWriter.writeRecords(databases);
            console.log('Wrote to ' + outputFile);
        } else if (options.stdout) {
            const csvWriter = createObjectCsvStringifier({
                header: csvHeaders,
            });
            console.log(csvWriter.getHeaderString()!.trim());
            console.log(csvWriter.stringifyRecords(databases).trim());
        }
    }

    if (options.csv || options.stdout) {
        printDatabases(databases);
    } else if (options.return) {
        return databases;
    } else {
        throw new Error('Must use --stdout or --csv');
    }
}
