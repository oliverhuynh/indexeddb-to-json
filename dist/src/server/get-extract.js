"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const extract_1 = __importDefault(require("../cli/extract"));
const queryStringSchema = {
    type: 'object',
    properties: {
        directory: { type: 'string' },
        asType: { type: 'string' },
    },
    required: ['directory', 'asType'],
    additionalProperties: false,
};
const route = {
    method: 'GET',
    url: '/extract.json',
    schema: {
        querystring: queryStringSchema,
        response: {
            200: {
                type: 'object',
                properties: {
                    databases: { type: 'array' },
                },
            },
        },
    },
    async handler(request, reply) {
        const { directory, asType } = request.query;
        const databases = await extract_1.default(directory, { return: true });
        switch (asType) {
            case 'Unknown':
                break;
            case 'Slack':
                // @todo - create special Slack view.
                break;
            case 'Teams':
                // @todo - create special Teams view.
                break;
            default:
                throw new Error('Unsupported type: ' + asType);
        }
        reply.send({ databases });
    },
};
function register(server) {
    server.route(route);
}
exports.default = register;
