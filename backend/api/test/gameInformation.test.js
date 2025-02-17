const { gameInformation, availabilityCharacters } = require('../controller'); 
const pool = require('../connectionManager'); 
const constants = require('../constants'); 

jest.mock('../controller', () => ({
    ...jest.requireActual('../controller'), 
    availabilityCharacters: jest.fn(),
}));
describe('gameInformation function', () => {

  beforeEach(() => {
    availabilityCharacters.mockResolvedValue({ areAvailable: true });
  });

  afterAll(() => {
    pool.end();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns game information when game exists', async () => {
    const idGame = '1';
    const selectValues = [idGame];
    const mockSelectResult = { 
      rows: [
        { 
          estado: 'testState', 
          ficha: 'testDate', 
          tipo: 'testType', 
          turno: 'testTurn',
          areAvailable: ["", "", "", "", "", ""], 

        }
      ] 
    };

    mockClient = {
        query: jest.fn().mockResolvedValue(mockSelectResult),
        release: jest.fn(),
    };
    pool.connect = jest.fn().mockResolvedValue(mockClient);

    let result;
    try{
        result = await gameInformation(idGame);
    }finally{
        mockClient.release();
    }

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_INFO_GAME, selectValues);
    expect(mockClient.release).toHaveBeenCalledTimes(4);
    expect(result).toEqual({
      exito: true,
      estado: 'testState',
      fecha_ini: 'testDate',
      tipo: 'testType',
      turno: 'testTurn',
      areAvailable: ["", "", "", "", "", ""],
    });
  });

  test('returns error when game does not exist', async () => {
    const idGame = '1';
    const selectValues = [idGame];
    const mockSelectResult = { rows: [] };

    mockClient.query.mockResolvedValue(mockSelectResult);

    const result = await gameInformation(idGame);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_INFO_GAME, selectValues);
    expect(mockClient.release).toHaveBeenCalled();
    expect(result).toEqual({ exito: false, msg: constants.WRONG_IDGAME });
  });
});