"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globPromise = exports.getFolderSizeInMb = exports.unique = exports.timestampForFilename = void 0;
const get_folder_size_1 = __importDefault(require("get-folder-size"));
const glob_1 = __importDefault(require("glob"));
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
async function getFolderSizeInMb(path) {
    return new Promise((resolve, reject) => {
        get_folder_size_1.default(path, function (err, size) {
            if (err) {
                reject(err);
            }
            else {
                const sizeInMb = size === 0 ? 0 : Number((size / 1024 / 1024).toFixed(1));
                resolve(sizeInMb);
            }
        });
    });
}
exports.getFolderSizeInMb = getFolderSizeInMb;
async function globPromise(pattern, options) {
    options = Object.assign({ silent: true, strict: false }, options);
    return new Promise((resolve, reject) => {
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
    });
}
exports.globPromise = globPromise;
