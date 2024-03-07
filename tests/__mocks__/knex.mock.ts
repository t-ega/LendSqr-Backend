// __mocks__/knex.js

const mockKnex = {
    transaction: jest.fn((x) => x),
};

export default mockKnex;
