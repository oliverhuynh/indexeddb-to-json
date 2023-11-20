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
var os_1 = require("os");
var csv_writer_1 = require("csv-writer");
var utils_1 = require("./utils");
var extract_1 = __importDefault(require("./extract"));
function discover(options) {
    return __awaiter(this, void 0, void 0, function () {
        function findIndexedDbRootsInPath(path) {
            return __awaiter(this, void 0, void 0, function () {
                var roots;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, utils_1.globPromise('**/CURRENT', {
                                cwd: path,
                                realpath: true,
                                nosort: true,
                                nodir: true,
                                nocase: false,
                                dot: true,
                                ignore: ignoreDirs,
                            })];
                        case 1:
                            roots = _a.sent();
                            return [2 /*return*/, roots.map(function (file) { return file.replace(/\/CURRENT$/, ''); })];
                    }
                });
            });
        }
        function printRoots(roots) {
            return __awaiter(this, void 0, void 0, function () {
                var csvHeaders, outputFile, csvWriter, csvWriter;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (roots.length === 0) {
                                return [2 /*return*/];
                            }
                            csvHeaders = [
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
                            if (!options.csv) return [3 /*break*/, 2];
                            outputFile = 'discovered-indexeddb-' + utils_1.timestampForFilename() + '.csv';
                            csvWriter = csv_writer_1.createObjectCsvWriter({
                                path: outputFile,
                                header: csvHeaders,
                            });
                            return [4 /*yield*/, csvWriter.writeRecords(roots)];
                        case 1:
                            _a.sent();
                            console.log('Wrote to ' + outputFile);
                            return [3 /*break*/, 3];
                        case 2:
                            if (options.stdout) {
                                csvWriter = csv_writer_1.createObjectCsvStringifier({
                                    header: csvHeaders,
                                });
                                console.log(csvWriter.getHeaderString().trim());
                                console.log(csvWriter.stringifyRecords(roots).trim());
                            }
                            _a.label = 3;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
        var searchPaths, ignoreDirs, globPromises, potentialDirsDeep, potentialDirs, searchPromises, indexedDbRootsDeep, indexedDbRootPaths, indexedDbRoots;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    searchPaths = [
                        // MacOS:
                        os_1.homedir + "/Library",
                        // Windows:
                        os_1.homedir + "/AppData",
                        // Linux:
                        os_1.homedir + "/.config",
                    ];
                    ignoreDirs = ['**/.git/**', '**/node_modules/**'];
                    searchPaths.forEach(function (searchPath) {
                        if (!searchPath.startsWith('/')) {
                            throw new Error('Search path must start with / but got: ' + searchPath);
                        }
                        else if (searchPath.endsWith('/')) {
                            throw new Error('Search path must not end with / but got: ' + searchPath);
                        }
                        console.log('Searching ' + searchPath);
                    });
                    globPromises = searchPaths.map(function (searchPath) {
                        return utils_1.globPromise(searchPath + '/**/*indexeddb*/', {
                            realpath: true,
                            nosort: true,
                            nocase: true,
                            dot: true,
                            ignore: ignoreDirs,
                        });
                    });
                    return [4 /*yield*/, Promise.all(globPromises)];
                case 1:
                    potentialDirsDeep = _a.sent();
                    potentialDirs = potentialDirsDeep
                        .filter(function (dir) { return dir.length > 0; })
                        .reduce(function (prev, current) {
                        return prev.concat(current);
                    }, []);
                    potentialDirs = utils_1.unique(potentialDirs);
                    searchPromises = potentialDirs.map(findIndexedDbRootsInPath);
                    return [4 /*yield*/, Promise.all(searchPromises)];
                case 2:
                    indexedDbRootsDeep = _a.sent();
                    indexedDbRootPaths = indexedDbRootsDeep
                        .filter(function (roots) { return roots.length > 0; })
                        .reduce(function (prev, current) {
                        return prev.concat(current);
                    }, []);
                    indexedDbRootPaths = utils_1.unique(indexedDbRootPaths);
                    return [4 /*yield*/, Promise.all(indexedDbRootPaths.map(function (directory) { return __awaiter(_this, void 0, void 0, function () {
                            var size, type, extractError, databaseCount, databases, e_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, utils_1.getFolderSizeInMb(directory)];
                                    case 1:
                                        size = _a.sent();
                                        type = directory.toLowerCase().includes('slack')
                                            ? 'Slack'
                                            : directory.toLowerCase().includes('teams')
                                                ? 'Teams'
                                                : 'Unknown';
                                        extractError = undefined;
                                        databaseCount = undefined;
                                        if (!options.includeDatabaseCounts) return [3 /*break*/, 5];
                                        _a.label = 2;
                                    case 2:
                                        _a.trys.push([2, 4, , 5]);
                                        return [4 /*yield*/, extract_1.default(directory, {
                                                return: options.return,
                                                includeStores: false,
                                            })];
                                    case 3:
                                        databases = (_a.sent());
                                        databaseCount = databases.length;
                                        return [3 /*break*/, 5];
                                    case 4:
                                        e_1 = _a.sent();
                                        extractError = e_1.message;
                                        return [3 /*break*/, 5];
                                    case 5: return [2 /*return*/, { directory: directory, size: size, type: type, databaseCount: databaseCount, extractError: extractError }];
                                }
                            });
                        }); }))];
                case 3:
                    indexedDbRoots = _a.sent();
                    console.log('Found ' + indexedDbRoots.length + ' IndexedDB root(s)');
                    indexedDbRoots = indexedDbRoots.sort(function (a, b) {
                        if (options.includeDatabaseCounts &&
                            typeof a.databaseCount === 'number' &&
                            typeof b.databaseCount === 'number') {
                            return b.databaseCount - a.databaseCount;
                        }
                        else {
                            return a.directory.localeCompare(b.directory);
                        }
                    });
                    if (options.csv || options.stdout) {
                        printRoots(indexedDbRoots);
                    }
                    else if (options.return) {
                        return [2 /*return*/, indexedDbRoots];
                    }
                    else {
                        throw new Error('Must use --stdout or --csv');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.default = discover;
