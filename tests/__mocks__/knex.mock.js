"use strict";
// __mocks__/knex.js
Object.defineProperty(exports, "__esModule", { value: true });
const mockKnex = {
    transaction: jest.fn((x) => x),
};
exports.default = mockKnex;
