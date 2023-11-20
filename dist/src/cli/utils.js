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
exports.globPromise = exports.getFolderSizeInMb = exports.unique = exports.timestampForFilename = void 0;
var get_folder_size_1 = __importDefault(require("get-folder-size"));
var glob_1 = __importDefault(require("glob"));
function timestampForFilename() {
    return new Date()
        .toISOString()
        .replace(/[/:]/g, '-')
        .replace(/\.\d+Z$/, '')
        .replace('T', '-at-');
}
exports.timestampForFilename = timestampForFilename;
function unique(array) {
    return Array.from(new Set(array));
}
exports.unique = unique;
function getFolderSizeInMb(path) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    get_folder_size_1.default(path, function (err, size) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            var sizeInMb = size === 0 ? 0 : Number((size / 1024 / 1024).toFixed(1));
                            resolve(sizeInMb);
                        }
                    });
                })];
        });
    });
}
exports.getFolderSizeInMb = getFolderSizeInMb;
function globPromise(pattern, options) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            options = Object.assign({ silent: true, strict: false }, options);
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    glob_1.default(pattern, options, function (err, matches) {
                        if (err) {
                            if (err.message.includes('EPERM: operation not permitted')) {
                                err.message +=
                                    " (try going to your Mac's System Preferences > Privacy > Full Disk Access, then grant access to Terminal/iTerm)";
                            }
                            reject(err);
                        }
                        else {
                            resolve(matches);
                        }
                    });
                })];
        });
    });
}
exports.globPromise = globPromise;
