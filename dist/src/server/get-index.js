"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
function register(server) {
    server.get('/', async (_request, reply) => {
        const html = await fs_1.promises.readFile(__dirname + '/static/index.html', 'utf8');
        reply.type('text/html').send(html);
    });
}
exports.default = register;
