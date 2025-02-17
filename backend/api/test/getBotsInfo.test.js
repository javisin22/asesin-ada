const { getBotsInfo } = require('../controller');
const constants = require('../constants');
const pool = require('../connectionManager'); 



describe('getBotsInfo function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    pool.end();
    });
  test('should return correct bot information when valid idGame is provided', async () => {
    const selectResult = {
      rows: [
        { personaje: 'mr SOPER', sospechas: 3, level: 2 },
        { personaje: 'miss REDES', sospechas: 2, level: 1 },
      ]
    };

    const mockClient = {
      query: jest.fn().mockResolvedValue(selectResult),
      release: jest.fn()
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    const idGame = 123456; 

    const result = await getBotsInfo(idGame);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_INFO_BOTS, [idGame]);
    expect(mockClient.release).toHaveBeenCalled();
    expect(result.exito).toBe(true);
    expect(result.personajes).toEqual(['mr SOPER', 'miss REDES']);
    expect(result.sospechas).toEqual([3, 2]);
    expect(result.niveles).toEqual([2, 1]);
  });

  test('should return error message when invalid idGame is provided', async () => {
    const selectResult = { rows: [] };

    const mockClient = {
      query: jest.fn().mockResolvedValue(selectResult),
      release: jest.fn()
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    const idGame = -4566; 

    const result = await getBotsInfo(idGame);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_INFO_BOTS, [idGame]);
    expect(mockClient.release).toHaveBeenCalled();
    expect(result.exito).toBe(false);
    expect(result.msg).toBe(constants.WRONG_IDGAME);
  });
});
