#!/usr/bin/env node

// In dev, should run node -r ts-node/register src/cli/index.ts

process.on('uncaughtException', function (e) {
    console.error(e);
    process.exit(1);
});

process.on('unhandledRejection', function (e) {
    console.error(e);
    process.exit(1);
});

import {Command} from 'commander';
import extract from './extract';
import discover from './discover';
import server from './server';

import packageInfo from '../../package.json';

const program = new Command()
    .name(packageInfo.name)
    .description(packageInfo.description)
    .version(packageInfo.version)
    .allowUnknownOption(false);

program
    .command('extract <source>')
    .option('--stdout', 'Prints JSON to stdout instead of creating a file')
    .option('--verbose', 'Verbose logging')
    .option('-d, --db <value>', 'Filter results to DB')
    .option('-s, --store <value>', 'Filter results to store')
    .option('-k, --key <value>', 'Filter results to key. keyvalue is required with this')
    .option('--keyvalue <value>', 'Key value use together with --key')
    .option('-c, --cookie <value>', 'Read cookies of domain instead of indexed DB')
    .action(async (source, options) => {
        await extract(source, options);
    });

program
    .command('discover')
    .option('--stdout', 'Prints to stdout')
    .option('--csv', 'Prints to a CSV file')
    .action(async (options) => {
        await discover(options);
    });

program
    .command('server')
    .option('-p, --port <port>', 'Port to use', '3000')
    .action(async (options) => {
        await server(options);
    });

program.parseAsync(process.argv);
