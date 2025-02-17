const { changeTurn, availabilityCharacters, validateTurno, updateTurno } = require('../controller');
const constants = require('../constants');
const pool = require('../connectionManager');

jest.mock('../controller', () => ({
  ...jest.requireActual('../controller'),
  availabilityCharacters: jest.fn(),
  validateTurno: jest.fn(),
  updateTurno: jest.fn(),
}));

describe('changeTurn function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    pool.end();
  });

  it('should return correct turn when valid idGame is provided', async () => {
    const selectResult = {
      rows: [
        { turno: 'mr SOPER' },
      ],
    };

    const mockClient = {
      query: jest.fn().mockResolvedValue(selectResult),
      release: jest.fn(),
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);
    availabilityCharacters.mockResolvedValue({ characterAvaliable: ['mr SOPER', 'miss REDES'], areAvailable: ['mr SOPER', 'miss REDES'] });
    validateTurno.mockResolvedValue(true);
    updateTurno.mockResolvedValue();

    const idGame = '123456';

    const result = await changeTurn(idGame);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_TURN_PARTIDA, [idGame]);
    expect(mockClient.release).toHaveBeenCalled();

    expect(result.exito).toBe(true);
    console.log('RESULT:', result.turno_character);
    expect(result.turno_character).toEqual('mr SOPER');
  });

  test('should return error message when invalid idGame is provided', async () => {
    const selectResult = { rows: [] };

    const mockClient = {
      query: jest.fn().mockResolvedValue(selectResult),
      release: jest.fn(),
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    const idGame = '-800';

    const result = await changeTurn(idGame);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_TURN_PARTIDA, [idGame]);
    expect(mockClient.release).toHaveBeenCalled();
    expect(result.exito).toBe(false);
    expect(result.msg).toEqual(constants.WRONG_IDGAME);
  });
});