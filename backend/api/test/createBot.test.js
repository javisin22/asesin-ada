const { createBot } = require('../controller'); 
const pool = require('../connectionManager'); 


describe('createBot', () => {
  afterAll(() => {
      pool.end();
  });
  test('should create a bot correctly', async () => {
    const username = 'testBot';
    const lvl = 1;
    const mockClient = {
      connect: jest.fn(),
      query: jest.fn().mockResolvedValue({ rows: [{ username }] }),
      release: jest.fn(),
    };
    pool.connect = jest.fn().mockResolvedValue(mockClient);

    let result;
    try {
      result = await createBot(username, lvl);
    } finally {
      mockClient.release();
    }

    // Assert
    expect(mockClient.query).toHaveBeenCalledTimes(2); 
    expect(result).toEqual({ exito: true, username }); 
    expect(mockClient.release).toHaveBeenCalledTimes(2);
});
});