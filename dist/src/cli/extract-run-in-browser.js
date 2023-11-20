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
var _this = this;
var jsToEvaluateOnPage = function (options) { return __awaiter(_this, void 0, void 0, function () {
    var callbackForEachStore, callbackForEachDb, databases, results, _i, databases_1, db, _a, _b;
    var _this = this;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                callbackForEachStore = function (db, connection, storeName) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        if (options.store && storeName != options.store) {
                            console.log("Ignoring to read database \"" + db.name + "\" store \"" + storeName + "\"");
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, new Promise(function (resolveStore, rejectStore) {
                                var transaction = connection.result.transaction(storeName, 'readonly');
                                console.log("Starting to read database \"" + db.name + "\" store \"" + storeName + "\"");
                                transaction.onerror = function (err) {
                                    rejectStore(new Error("Transaction error for store " + storeName + ": " + err));
                                };
                                transaction.onabort = function (err) {
                                    rejectStore(new Error("Transaction aborted for store " + storeName + ": " + err));
                                };
                                var values = [];
                                var onTransactionCursor = function (event) {
                                    var cursor = event.target.result;
                                    if (cursor) {
                                        values.push(cursor.value);
                                        cursor.continue();
                                    }
                                    else {
                                        resolveStore(values);
                                    }
                                };
                                transaction.objectStore(storeName).openCursor().onsuccess = onTransactionCursor;
                            })];
                    });
                }); };
                callbackForEachDb = function (db) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        console.log("Database \"" + db.name + "\" version " + db.version);
                        return [2 /*return*/, new Promise(function (resolveDb, rejectDb) {
                                var _this = this;
                                var rejectFromError = function (reason, error) { return rejectDb(new Error(reason + ": " + error)); };
                                var connection = window.indexedDB.open(db.name);
                                connection.onsuccess = function () { return __awaiter(_this, void 0, void 0, function () {
                                    var objectStoreNames, dbExportObject, resolveStorePromises, e_1;
                                    var _this = this;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                objectStoreNames = Array.from(connection.result.objectStoreNames);
                                                dbExportObject = {
                                                    databaseName: db.name,
                                                    stores: [],
                                                };
                                                console.log("Database \"" + db.name + "\" version " + db.version + " has object stores:", objectStoreNames);
                                                resolveStorePromises = objectStoreNames.map(function (storeName) { return __awaiter(_this, void 0, void 0, function () {
                                                    var values;
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0: return [4 /*yield*/, callbackForEachStore(db, connection, storeName)];
                                                            case 1:
                                                                values = _a.sent();
                                                                dbExportObject.stores.push({
                                                                    storeName: storeName,
                                                                    values: values,
                                                                });
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                }); });
                                                _a.label = 1;
                                            case 1:
                                                _a.trys.push([1, 3, , 4]);
                                                return [4 /*yield*/, Promise.all(resolveStorePromises)];
                                            case 2:
                                                _a.sent();
                                                return [3 /*break*/, 4];
                                            case 3:
                                                e_1 = _a.sent();
                                                rejectFromError('Error resolving object store', e_1);
                                                return [2 /*return*/];
                                            case 4:
                                                resolveDb(dbExportObject);
                                                return [2 /*return*/];
                                        }
                                    });
                                }); };
                                connection.onerror = function (e) { return rejectFromError('Connection failed', e); };
                                connection.onupgradeneeded = function (e) { return rejectFromError('Upgrade needed', e); };
                                connection.onblocked = function (e) { return rejectFromError('Blocked', e); };
                            })];
                    });
                }); };
                return [4 /*yield*/, window.indexedDB.databases()];
            case 1:
                databases = _c.sent();
                if (options.db) {
                    databases = databases.filter(function (_a) {
                        var name = _a.name;
                        return name.indexOf(options.db) !== -1;
                    });
                }
                console.log("Found " + databases.length + " databases");
                if (!options.includeStores) return [3 /*break*/, 6];
                results = [];
                _i = 0, databases_1 = databases;
                _c.label = 2;
            case 2:
                if (!(_i < databases_1.length)) return [3 /*break*/, 5];
                db = databases_1[_i];
                _b = (_a = results).push;
                return [4 /*yield*/, callbackForEachDb(db)];
            case 3:
                _b.apply(_a, [_c.sent()]);
                _c.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/, results.filter(function (t) { return t; })];
            case 6: return [2 /*return*/, databases.map(function (database) { return ({ databaseName: database }); })];
        }
    });
}); };
module.exports = {
    jsToEvaluateOnPage: jsToEvaluateOnPage,
};
