"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discover_1 = __importDefault(require("../cli/discover"));
const queryStringSchema = {
    type: 'object',
    properties: {
        includeDatabaseCounts: { type: 'boolean' },
    },
    additionalProperties: false,
};
const route = {
    method: 'GET',
    url: '/discover.json',
    schema: {
        querystring: queryStringSchema,
        response: {
            200: {
                type: 'object',
                properties: {
                    indexedDbRoots: { type: 'array' },
                },
            },
        },
    },
    handler: async (request, reply) => {
        const { includeDatabaseCounts } = request.query;
        const indexedDbRoots = (await discover_1.default({
            return: true,
            includeDatabaseCounts,
        }));
        reply.send({ indexedDbRoots });
    },
};
function register(server) {
    server.route(route);
}
exports.default = register;
