"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const utils_1 = require("./utils");
async function command(options) {
    const host = '127.0.0.1';
    const port = Number(options.port);
    const server = await fastify_1.default({
        logger: true,
    });
    const endpoints = await utils_1.globPromise(__dirname + '/../server/*.ts', {});
    endpoints.forEach((endpoint) => {
        require(endpoint).default(server);
    });
    await server.listen({ host, port });
    console.log(`Listening on http://${host}:${port}`);
    console.log('Endpoints:');
    console.log(server.printRoutes());
}
exports.default = command;
