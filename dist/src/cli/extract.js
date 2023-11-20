"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const fs_2 = require("fs");
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const recursive_copy_1 = __importDefault(require("recursive-copy"));
const utils_1 = require("./utils");
const extract_run_in_browser_1 = require("./extract-run-in-browser");
const HOST_IN_SOURCE_PATH_REGEX = /\/(https?_[a-z0-9\\.-]+)_(\d+)\.indexeddb\.leveldb/;
const HOST_IN_LOG_REUSING_LINE = / Reusing (MANIFEST|old log) \/.+\/(https?_[a-z0-9\\.-]+)_(\d+)\.indexeddb\.leveldb/;
const HOST_IS_CHROME_EXTENSION = /\/(chrome-extension_[a-z]+)_0\.indexeddb\.leveldb/;
const CHROME_INSTALLED_PATH = '/opt/google/chrome/google-chrome';
// Having Chrome installed is strongly recommended, because it can decode IndexedDB much
// better than Chromium. Chrome is also required to extract from extensions.
const chromeIsInstalled = fs_1.existsSync(CHROME_INSTALLED_PATH);
async function extract(source, options) {
    if (!fs_1.existsSync(source)) {
        throw new Error(`Source directory does not exist: ${source}`);
    }
    source = source.replace(/\/+$/, '');
    if (!fs_1.existsSync(source + '/CURRENT')) {
        throw new Error(`Source directory does not contain IndexedDB file: ${source}/CURRENT`);
    }
    const outputDir = 'indexeddb-to-json-output';
    let host;
    let port;
    let isExtension;
    let pathToExtension;
    let match1;
    if ((match1 = source.match(HOST_IN_SOURCE_PATH_REGEX)) && match1[1]) {
        host = match1[1].replace('_', '://');
        port = Number(match1[2]);
    }
    let match2;
    if (!host && (match2 = source.match(HOST_IS_CHROME_EXTENSION)) && match2[1]) {
        isExtension = true;
        host = match2[1].replace('_', '://');
        pathToExtension = source
            .replace('/IndexedDB/chrome-extension_', '/Extensions/')
            .replace('_0.indexeddb.leveldb', '');
        const extensionSubDirs = (await fs_2.promises.readdir(pathToExtension)).sort();
        pathToExtension += '/' + extensionSubDirs[extensionSubDirs.length - 1];
        port = 0;
    }
    else {
        isExtension = false;
    }
    if (!host && fs_1.existsSync(source + '/LOG')) {
        const logLines = (await fs_2.promises.readFile(source + '/LOG', 'utf8')).split(/\n/g);
        let match3;
        for (const line of logLines) {
            if ((match3 = line.match(HOST_IN_LOG_REUSING_LINE)) && match3[2]) {
                host = match3[2].replace('_', '://');
                port = Number(match3[3]);
                break;
            }
        }
    }
    if (!host) {
        throw new Error(`Host not figured out for ${source}`);
    }
    if (typeof port !== 'number') {
        throw new Error(`Port not figured out for ${source}`);
    }
    const chromeDir = await fs_2.promises.mkdtemp(path_1.default.join(os_1.default.tmpdir(), 'puppeteer-extract-'));
    console.log('Extracting from:', source);
    console.log('Host:', host);
    console.log('Temporary Chrome directory:', chromeDir);
    if (isExtension) {
        const chromeExtensionDir = chromeDir + '/Default/Extensions/extract';
        await recursive_copy_1.default(pathToExtension, chromeExtensionDir);
        console.log(`Copied extension from ${pathToExtension} to ${chromeExtensionDir}`);
        pathToExtension = chromeExtensionDir;
    }
    console.log(`executablePath: ${CHROME_INSTALLED_PATH}`);
    let browser;
    const args = [
        // See https://peter.sh/experiments/chromium-command-line-switches/
        // Yeah, this code is for real.
        '--allow-failed-policy-fetch-for-test',
        '--allow-insecure-localhost',
        '--allow-no-sandbox-job',
        '--allow-running-insecure-content',
        '--arc-disable-app-sync',
        '--arc-disable-locale-sync',
        '--disable-client-side-phishing-detection',
        '--disable-component-cloud-policy',
        '--disable-cookie-encryption',
        '--disable-default-apps',
        '--disable-explicit-dma-fences',
        '--disable-extensions-file-access-check',
    ];
    const args2 = [
        // See https://peter.sh/experiments/chromium-command-line-switches/
        // Yeah, this code is for real.
        '--allow-failed-policy-fetch-for-test',
        '--allow-insecure-localhost',
        '--allow-no-sandbox-job',
        '--allow-running-insecure-content',
        '--arc-disable-app-sync',
        '--arc-disable-locale-sync',
        '--disable-client-side-phishing-detection',
        '--disable-component-cloud-policy',
        '--disable-cookie-encryption',
        '--disable-default-apps',
        '--disable-explicit-dma-fences',
        '--disable-extensions-file-access-check',
        isExtension ? `--disable-extensions-except=${pathToExtension}` : '--disable-extensions',
        isExtension ? `--load-extension=${pathToExtension}` : '',
        '--disable-machine-cert-request',
        '--disable-site-isolation-trials',
        '--disable-sync',
        '--disable-web-security',
        '--enable-sandbox-logging',
        '--ignore-certificate-errors-spki-list',
        '--ignore-urlfetcher-cert-requests',
        '--managed-user-id=""',
        '--nacl-dangerous-no-sandbox-nonsfi',
        '--no-sandbox-and-elevated',
        '--run-without-sandbox-for-testing',
        '--single-process',
        '--unlimited-storage',
        '--unsafely-allow-protected-media-identifier-for-domain',
        '--unsafely-treat-insecure-origin-as-secure',
        '--webview-disable-safebrowsing-support',
        '--v=1',
        options.verbose ? '--enable-logging' : '',
    ];
    const setup = async () => {
        browser = await puppeteer_1.default.launch({
            executablePath: chromeIsInstalled ? CHROME_INSTALLED_PATH : undefined,
            headless: !isExtension,
            userDataDir: chromeDir,
            ignoreHTTPSErrors: true,
            args,
        });
        // browser.on('disconnected', setup);
        console.log(`Started Puppeteer with pid ${browser.process().pid}`);
    };
    await setup();
    const chromeIndexedDbDir = chromeDir +
        '/Default/IndexedDB/' +
        host.replace(/^(http|https|chrome-extension):\/\//, '$1_') +
        '_' +
        port +
        '.indexeddb.leveldb';
    const blob = source.replace(/\.indexeddb\.leveldb$/, '.indexeddb.blob');
    const chromeBlobDir = chromeIndexedDbDir.replace(/\.indexeddb\.leveldb$/, '.indexeddb.blob');
    await recursive_copy_1.default(source, chromeIndexedDbDir);
    console.log(`Copied IndexedDB from ${source} to ${chromeIndexedDbDir}`);
    // Copy more blob folder
    if (source !== blob && fs_1.existsSync(blob)) {
        await recursive_copy_1.default(blob, chromeBlobDir);
        console.log(`Copied IndexedDB More from ${blob} to ${chromeBlobDir}`);
    }
    const lockfile = chromeIndexedDbDir + '/LOCK';
    if (fs_1.existsSync(lockfile)) {
        await fs_2.promises.unlink(lockfile);
        console.log(`Deleted lockfile ${lockfile}`);
    }
    const sourceDatabasesDir = source
        .replace('IndexedDB', 'databases')
        .replace('.indexeddb.leveldb', '');
    if (fs_1.existsSync(sourceDatabasesDir)) {
        const chromeDatabasesDir = chromeIndexedDbDir
            .replace('IndexedDB', 'databases')
            .replace('.indexeddb.leveldb', '');
        await recursive_copy_1.default(sourceDatabasesDir, chromeDatabasesDir);
        console.log("Copied host's IndexedDB folder to " + chromeDatabasesDir);
        const sourceDatabasesDotDb = sourceDatabasesDir.replace(/\/http.+/, '/Databases.db');
        const sourceDatabasesDotDbJournal = sourceDatabasesDotDb + '-journal';
        const chromeDatabasesDotDb = chromeDir + '/Default/databases/Databases.db';
        const chromeDatabasesDotDbJournal = chromeDatabasesDotDb + '-journal';
        if (fs_1.existsSync(sourceDatabasesDotDb)) {
            await recursive_copy_1.default(sourceDatabasesDotDb, chromeDatabasesDotDb);
            console.log(`Copied Databases.db to ${chromeDatabasesDotDb}`);
        }
        if (fs_1.existsSync(sourceDatabasesDotDbJournal)) {
            await recursive_copy_1.default(sourceDatabasesDotDbJournal, chromeDatabasesDotDbJournal);
            console.log(`Copied Databases.db-journal to ${chromeDatabasesDotDbJournal}`);
        }
    }
    const page = await browser.newPage();
    await page.setCacheEnabled(false);
    await page.setOfflineMode(false);
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.respond({
            status: 200,
            contentType: 'text/html',
            body: 'Fake page',
        });
    });
    if (options.verbose) {
        page.on('console', (msg) => {
            console.log(`Console from inside Chrome: ${msg.text()}`);
        });
    }
    let urlToOpen;
    if (isExtension) {
        urlToOpen = host + '/manifest.json';
    }
    else if (port === 0) {
        urlToOpen = host;
    }
    else if (port > 0) {
        urlToOpen = host + ':' + port;
    }
    else {
        throw new Error(`URL not figured out for ${source}`);
    }
    // console.log(`URL2Open: ${urlToOpen}`);
    await page.goto(urlToOpen);
    const includeStores = typeof options.includeStores === 'boolean' ? options.includeStores : true;
    const db = options.db || false;
    const store = options.store || false;
    const databases = (await page.evaluate(extract_run_in_browser_1.jsToEvaluateOnPage, {
        store,
        db,
        includeStores,
    }));
    const databasesCount = databases.length;
    let storesCount;
    if (includeStores) {
        storesCount = databases.reduce((prev, current) => {
            return prev + Object.keys(current.stores).length;
        }, 0);
    }
    else {
        storesCount = undefined;
    }
    if (fs_1.existsSync(chromeDir + '/chrome_debug.log')) {
        const chromeDebugLog = await fs_2.promises.readFile(chromeDir + '/chrome_debug.log', 'utf8');
        console.error(`In chrome_debug.log:\n${chromeDebugLog}`);
    }
    await browser.close();
    await fs_2.promises.rmdir(chromeDir, {
        recursive: true,
        maxRetries: 5,
        retryDelay: 1000,
    });
    console.log(`Deleted temporary Chrome directory: ${chromeDir}`);
    console.log(`Extracted ${databasesCount} database(s) containing ${storesCount} store(s)`);
    if (options.return) {
        return databases;
    }
    const json = JSON.stringify(databases, null, '    ');
    if (options.stdout) {
        console.log('Databases:\n', json);
    }
    else {
        if (!fs_1.existsSync(outputDir + '/')) {
            await fs_2.promises.mkdir(outputDir + '/');
        }
        const timestamp = utils_1.timestampForFilename();
        const outputFile = outputDir + '/' + host.replace('://', '_') + '-' + timestamp + '.json';
        await fs_2.promises.writeFile(outputFile, json);
        console.log(`Wrote JSON to ${outputFile}`);
    }
}
exports.default = extract;
