#!/usr/bin/env node
"use strict";
// In dev, should run node -r ts-node/register src/cli/index.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.on('uncaughtException', function (e) {
    console.error(e);
    process.exit(1);
});
process.on('unhandledRejection', function (e) {
    console.error(e);
    process.exit(1);
});
const commander_1 = require("commander");
const extract_1 = __importDefault(require("./extract"));
const discover_1 = __importDefault(require("./discover"));
const server_1 = __importDefault(require("./server"));
const package_json_1 = __importDefault(require("../../package.json"));
const program = new commander_1.Command()
    .name(package_json_1.default.name)
    .description(package_json_1.default.description)
    .version(package_json_1.default.version)
    .allowUnknownOption(false);
program
    .command('extract <source>')
    .option('--stdout', 'Prints JSON to stdout instead of creating a file')
    .option('--verbose', 'Verbose logging')
    .option('-d, --db <value>', 'Filter results to DB')
    .option('-s, --store <value>', 'Filter results to store')
    .action(async (source, options) => {
    await extract_1.default(source, options);
});
program
    .command('discover')
    .option('--stdout', 'Prints to stdout')
    .option('--csv', 'Prints to a CSV file')
    .action(async (options) => {
    await discover_1.default(options);
});
program
    .command('server')
    .option('-p, --port <port>', 'Port to use', '3000')
    .action(async (options) => {
    await server_1.default(options);
});
program.parseAsync(process.argv);
