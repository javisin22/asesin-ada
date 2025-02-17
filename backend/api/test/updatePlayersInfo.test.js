const { update_players_info } = require('../controller');
const constants = require('../constants');
const pool = require('../connectionManager');

describe('update_players_info function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    pool.end();
  });

  it('should return correct message when valid username, suspicions and position are provided', async () => {
    const updateResult = {
      rows: [
        { },
      ],
    };

    const mockClient = {
      query: jest.fn().mockResolvedValue(updateResult),
      release: jest.fn(),
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    const username = 'mr SOPER';
    const sospechas = 3;
    const position = 4;

    const result = await update_players_info(username, sospechas, position);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(constants.UPDATE_SOSPECHAS, [username, sospechas]);
    expect(mockClient.release).toHaveBeenCalled();
    expect(result.exito).toBe(true);
    expect(result.msg).toEqual(constants.CORRECT_UPDATE);
  });

  test('should return error message when invalid username is provided', async () => {
    const updateResult = { rows: [] };

    const mockClient = {
      query: jest.fn().mockResolvedValue(updateResult),
      release: jest.fn(),
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    const username = 'InvalidBot';
    const sospechas = 3;
    const position = 5;

    let error;
    try {
      await update_players_info(username, sospechas, position);
    } catch (e) {
      error = e;
    }

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(constants.UPDATE_SOSPECHAS, [username, sospechas]);
    expect(mockClient.release).toHaveBeenCalled();
    expect(error);
  });
});