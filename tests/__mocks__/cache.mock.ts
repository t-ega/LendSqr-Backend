// __mocks__/cache.mock.ts

const mockCustomCache = {
    get: jest.fn((x) => x),
    set: jest.fn(),
};

export default mockCustomCache;
