const { removeBots } = require('../controller'); 
const constants = require('../constants'); 
const pool = require('../connectionManager');
describe('removeBots function', () => {

  afterAll(() => {
    pool.end();
  });

  test('removes bots', async () => {
    const mockIdGame = '1';
    const mockClient = {
      connect: jest.fn(),
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect = jest.fn().mockResolvedValue(mockClient);

    let result;
    try {
      result = await removeBots(mockIdGame);
    } finally {
      mockClient.release();
    }

    expect(pool.connect).toHaveBeenCalledTimes(1);
    expect(mockClient.query).toHaveBeenCalledTimes(2);
    expect(mockClient.query).toHaveBeenNthCalledWith(1, constants.DELETE_ALL_BOTS_FROM_BOT, [mockIdGame]);
    expect(mockClient.query).toHaveBeenNthCalledWith(2, constants.DELETE_ALL_BOTS_FROM_JUGADOR, [mockIdGame]);
    expect(mockClient.release).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ exito: true });
  });
});