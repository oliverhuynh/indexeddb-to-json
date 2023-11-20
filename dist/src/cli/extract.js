"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var fs_2 = require("fs");
var path_1 = __importDefault(require("path"));
var os_1 = __importDefault(require("os"));
var puppeteer_1 = __importDefault(require("puppeteer"));
var recursive_copy_1 = __importDefault(require("recursive-copy"));
var utils_1 = require("./utils");
var extract_run_in_browser_1 = require("./extract-run-in-browser");
var HOST_IN_SOURCE_PATH_REGEX = /\/(https?_[a-z0-9\\.-]+)_(\d+)\.indexeddb\.leveldb/;
var HOST_IN_LOG_REUSING_LINE = / Reusing (MANIFEST|old log) \/.+\/(https?_[a-z0-9\\.-]+)_(\d+)\.indexeddb\.leveldb/;
var HOST_IS_CHROME_EXTENSION = /\/(chrome-extension_[a-z]+)_0\.indexeddb\.leveldb/;
var CHROME_INSTALLED_PATH = '/opt/google/chrome/google-chrome';
// Having Chrome installed is strongly recommended, because it can decode IndexedDB much
// better than Chromium. Chrome is also required to extract from extensions.
var chromeIsInstalled = fs_1.existsSync(CHROME_INSTALLED_PATH);
function extract(source, options) {
    return __awaiter(this, void 0, void 0, function () {
        var outputDir, host, port, isExtension, pathToExtension, match1, match2, extensionSubDirs, logLines, match3, _i, logLines_1, line, chromeDir, chromeExtensionDir, browser, args, args2, setup, chromeIndexedDbDir, blob, chromeBlobDir, lockfile, sourceDatabasesDir, chromeDatabasesDir, sourceDatabasesDotDb, sourceDatabasesDotDbJournal, chromeDatabasesDotDb, chromeDatabasesDotDbJournal, page, urlToOpen, includeStores, db, store, databases, databasesCount, storesCount, chromeDebugLog, json, timestamp, outputFile;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!fs_1.existsSync(source)) {
                        throw new Error("Source directory does not exist: " + source);
                    }
                    source = source.replace(/\/+$/, '');
                    if (!fs_1.existsSync(source + '/CURRENT')) {
                        throw new Error("Source directory does not contain IndexedDB file: " + source + "/CURRENT");
                    }
                    outputDir = 'indexeddb-to-json-output';
                    if ((match1 = source.match(HOST_IN_SOURCE_PATH_REGEX)) && match1[1]) {
                        host = match1[1].replace('_', '://');
                        port = Number(match1[2]);
                    }
                    if (!(!host && (match2 = source.match(HOST_IS_CHROME_EXTENSION)) && match2[1])) return [3 /*break*/, 2];
                    isExtension = true;
                    host = match2[1].replace('_', '://');
                    pathToExtension = source
                        .replace('/IndexedDB/chrome-extension_', '/Extensions/')
                        .replace('_0.indexeddb.leveldb', '');
                    return [4 /*yield*/, fs_2.promises.readdir(pathToExtension)];
                case 1:
                    extensionSubDirs = (_a.sent()).sort();
                    pathToExtension += '/' + extensionSubDirs[extensionSubDirs.length - 1];
                    port = 0;
                    return [3 /*break*/, 3];
                case 2:
                    isExtension = false;
                    _a.label = 3;
                case 3:
                    if (!(!host && fs_1.existsSync(source + '/LOG'))) return [3 /*break*/, 5];
                    return [4 /*yield*/, fs_2.promises.readFile(source + '/LOG', 'utf8')];
                case 4:
                    logLines = (_a.sent()).split(/\n/g);
                    match3 = void 0;
                    for (_i = 0, logLines_1 = logLines; _i < logLines_1.length; _i++) {
                        line = logLines_1[_i];
                        if ((match3 = line.match(HOST_IN_LOG_REUSING_LINE)) && match3[2]) {
                            host = match3[2].replace('_', '://');
                            port = Number(match3[3]);
                            break;
                        }
                    }
                    _a.label = 5;
                case 5:
                    if (!host) {
                        throw new Error("Host not figured out for " + source);
                    }
                    if (typeof port !== 'number') {
                        throw new Error("Port not figured out for " + source);
                    }
                    return [4 /*yield*/, fs_2.promises.mkdtemp(path_1.default.join(os_1.default.tmpdir(), 'puppeteer-extract-'))];
                case 6:
                    chromeDir = _a.sent();
                    console.log('Extracting from:', source);
                    console.log('Host:', host);
                    console.log('Temporary Chrome directory:', chromeDir);
                    if (!isExtension) return [3 /*break*/, 8];
                    chromeExtensionDir = chromeDir + '/Default/Extensions/extract';
                    return [4 /*yield*/, recursive_copy_1.default(pathToExtension, chromeExtensionDir)];
                case 7:
                    _a.sent();
                    console.log("Copied extension from " + pathToExtension + " to " + chromeExtensionDir);
                    pathToExtension = chromeExtensionDir;
                    _a.label = 8;
                case 8:
                    console.log("executablePath: " + CHROME_INSTALLED_PATH);
                    args = [
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
                    args2 = [
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
                        isExtension ? "--disable-extensions-except=" + pathToExtension : '--disable-extensions',
                        isExtension ? "--load-extension=" + pathToExtension : '',
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
                    setup = function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, puppeteer_1.default.launch({
                                        executablePath: chromeIsInstalled ? CHROME_INSTALLED_PATH : undefined,
                                        headless: !isExtension,
                                        userDataDir: chromeDir,
                                        ignoreHTTPSErrors: true,
                                        args: args,
                                    })];
                                case 1:
                                    browser = _a.sent();
                                    // browser.on('disconnected', setup);
                                    console.log("Started Puppeteer with pid " + browser.process().pid);
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    return [4 /*yield*/, setup()];
                case 9:
                    _a.sent();
                    chromeIndexedDbDir = chromeDir +
                        '/Default/IndexedDB/' +
                        host.replace(/^(http|https|chrome-extension):\/\//, '$1_') +
                        '_' +
                        port +
                        '.indexeddb.leveldb';
                    blob = source.replace(/\.indexeddb\.leveldb$/, '.indexeddb.blob');
                    chromeBlobDir = chromeIndexedDbDir.replace(/\.indexeddb\.leveldb$/, '.indexeddb.blob');
                    return [4 /*yield*/, recursive_copy_1.default(source, chromeIndexedDbDir)];
                case 10:
                    _a.sent();
                    console.log("Copied IndexedDB from " + source + " to " + chromeIndexedDbDir);
                    if (!(source !== blob && fs_1.existsSync(blob))) return [3 /*break*/, 12];
                    return [4 /*yield*/, recursive_copy_1.default(blob, chromeBlobDir)];
                case 11:
                    _a.sent();
                    console.log("Copied IndexedDB More from " + blob + " to " + chromeBlobDir);
                    _a.label = 12;
                case 12:
                    lockfile = chromeIndexedDbDir + '/LOCK';
                    if (!fs_1.existsSync(lockfile)) return [3 /*break*/, 14];
                    return [4 /*yield*/, fs_2.promises.unlink(lockfile)];
                case 13:
                    _a.sent();
                    console.log("Deleted lockfile " + lockfile);
                    _a.label = 14;
                case 14:
                    sourceDatabasesDir = source
                        .replace('IndexedDB', 'databases')
                        .replace('.indexeddb.leveldb', '');
                    if (!fs_1.existsSync(sourceDatabasesDir)) return [3 /*break*/, 19];
                    chromeDatabasesDir = chromeIndexedDbDir
                        .replace('IndexedDB', 'databases')
                        .replace('.indexeddb.leveldb', '');
                    return [4 /*yield*/, recursive_copy_1.default(sourceDatabasesDir, chromeDatabasesDir)];
                case 15:
                    _a.sent();
                    console.log("Copied host's IndexedDB folder to " + chromeDatabasesDir);
                    sourceDatabasesDotDb = sourceDatabasesDir.replace(/\/http.+/, '/Databases.db');
                    sourceDatabasesDotDbJournal = sourceDatabasesDotDb + '-journal';
                    chromeDatabasesDotDb = chromeDir + '/Default/databases/Databases.db';
                    chromeDatabasesDotDbJournal = chromeDatabasesDotDb + '-journal';
                    if (!fs_1.existsSync(sourceDatabasesDotDb)) return [3 /*break*/, 17];
                    return [4 /*yield*/, recursive_copy_1.default(sourceDatabasesDotDb, chromeDatabasesDotDb)];
                case 16:
                    _a.sent();
                    console.log("Copied Databases.db to " + chromeDatabasesDotDb);
                    _a.label = 17;
                case 17:
                    if (!fs_1.existsSync(sourceDatabasesDotDbJournal)) return [3 /*break*/, 19];
                    return [4 /*yield*/, recursive_copy_1.default(sourceDatabasesDotDbJournal, chromeDatabasesDotDbJournal)];
                case 18:
                    _a.sent();
                    console.log("Copied Databases.db-journal to " + chromeDatabasesDotDbJournal);
                    _a.label = 19;
                case 19: return [4 /*yield*/, browser.newPage()];
                case 20:
                    page = _a.sent();
                    return [4 /*yield*/, page.setCacheEnabled(false)];
                case 21:
                    _a.sent();
                    return [4 /*yield*/, page.setOfflineMode(false)];
                case 22:
                    _a.sent();
                    return [4 /*yield*/, page.setRequestInterception(true)];
                case 23:
                    _a.sent();
                    page.on('request', function (request) {
                        request.respond({
                            status: 200,
                            contentType: 'text/html',
                            body: 'Fake page',
                        });
                    });
                    if (options.verbose) {
                        page.on('console', function (msg) {
                            console.log("Console from inside Chrome: " + msg.text());
                        });
                    }
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
                        throw new Error("URL not figured out for " + source);
                    }
                    // console.log(`URL2Open: ${urlToOpen}`);
                    return [4 /*yield*/, page.goto(urlToOpen)];
                case 24:
                    // console.log(`URL2Open: ${urlToOpen}`);
                    _a.sent();
                    includeStores = typeof options.includeStores === 'boolean' ? options.includeStores : true;
                    db = options.db || false;
                    store = options.store || false;
                    return [4 /*yield*/, page.evaluate(extract_run_in_browser_1.jsToEvaluateOnPage, {
                            store: store,
                            db: db,
                            includeStores: includeStores,
                        })];
                case 25:
                    databases = (_a.sent());
                    databasesCount = databases.length;
                    if (includeStores) {
                        storesCount = databases.reduce(function (prev, current) {
                            return prev + Object.keys(current.stores).length;
                        }, 0);
                    }
                    else {
                        storesCount = undefined;
                    }
                    if (!fs_1.existsSync(chromeDir + '/chrome_debug.log')) return [3 /*break*/, 27];
                    return [4 /*yield*/, fs_2.promises.readFile(chromeDir + '/chrome_debug.log', 'utf8')];
                case 26:
                    chromeDebugLog = _a.sent();
                    console.error("In chrome_debug.log:\n" + chromeDebugLog);
                    _a.label = 27;
                case 27: return [4 /*yield*/, browser.close()];
                case 28:
                    _a.sent();
                    return [4 /*yield*/, fs_2.promises.rmdir(chromeDir, {
                            recursive: true,
                            maxRetries: 5,
                            retryDelay: 1000,
                        })];
                case 29:
                    _a.sent();
                    console.log("Deleted temporary Chrome directory: " + chromeDir);
                    console.log("Extracted " + databasesCount + " database(s) containing " + storesCount + " store(s)");
                    if (options.return) {
                        return [2 /*return*/, databases];
                    }
                    json = JSON.stringify(databases, null, '    ');
                    if (!options.stdout) return [3 /*break*/, 30];
                    console.log('Databases:\n', json);
                    return [3 /*break*/, 34];
                case 30:
                    if (!!fs_1.existsSync(outputDir + '/')) return [3 /*break*/, 32];
                    return [4 /*yield*/, fs_2.promises.mkdir(outputDir + '/')];
                case 31:
                    _a.sent();
                    _a.label = 32;
                case 32:
                    timestamp = utils_1.timestampForFilename();
                    outputFile = outputDir + '/' + host.replace('://', '_') + '-' + timestamp + '.json';
                    return [4 /*yield*/, fs_2.promises.writeFile(outputFile, json)];
                case 33:
                    _a.sent();
                    console.log("Wrote JSON to " + outputFile);
                    _a.label = 34;
                case 34: return [2 /*return*/];
            }
        });
    });
}
exports.default = extract;
