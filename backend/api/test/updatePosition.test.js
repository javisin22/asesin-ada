const { updatePosition } = require('../controller');
const constants = require('../constants');
const pool = require('../connectionManager');

describe('updatePosition function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    pool.end();
  });

  it('should return correct message when valid username and position are provided', async () => {
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

    const username = 'Bot1';
    const pos = 'new_position';

    const result = await updatePosition(username, pos);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(constants.UPDATE_POSTION_PLAYER, [username, pos]);
    expect(mockClient.release).toHaveBeenCalled();
    expect(result.exito).toBe(true);
    expect(result.msg).toEqual(constants.CORRECT_UPDATE);
  });

  it('should return error message when invalid username is provided', async () => {
    const updateResult = { rows: [] };

    const mockClient = {
      query: jest.fn().mockResolvedValue(updateResult),
      release: jest.fn(),
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    const username = 'InvalidBot';
    const pos = 'new_position';

    const result = await updatePosition(username, pos);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(constants.UPDATE_POSTION_PLAYER, [username, pos]);
    expect(mockClient.release).toHaveBeenCalled();
    expect(result.exito).toBe(false);
    expect(result.msg).toEqual(constants.WRONG_USER);
  });
});