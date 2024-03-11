// __mocks__/knex.mock.ts

const mockKnex = {
    transaction: jest.fn((x) => x),
};

export default mockKnex;
