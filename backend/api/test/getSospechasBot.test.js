const { getSospechasBot } = require('../controller');
const constants = require('../constants');
const pool = require('../connectionManager');

describe('getSospechasBot function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    pool.end();
  });

  it('should return correct bot suspicions when valid username is provided', async () => {
    const selectResult = {
      rows: [
        { sospechas: 3 },
      ],
    };

    const mockClient = {
      query: jest.fn().mockResolvedValue(selectResult),
      release: jest.fn(),
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    const username = 'Bot1';

    const result = await getSospechasBot(username);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_SOSPECHAS_BOT, [username]);
    expect(mockClient.release).toHaveBeenCalled();
    expect(result.exito).toBe(true);
    expect(result.sospechas).toEqual(3);
  });

  it('should return error message when invalid username is provided', async () => {
    const selectResult = { rows: [] };

    const mockClient = {
      query: jest.fn().mockResolvedValue(selectResult),
      release: jest.fn(),
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    const username = 'InvalidBot';

    const result = await getSospechasBot(username);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_SOSPECHAS_BOT, [username]);
    expect(mockClient.release).toHaveBeenCalled();
    expect(result.exito).toBe(false);
    expect(result.msg).toBe(constants.WRONG_IDGAME);
  });
});