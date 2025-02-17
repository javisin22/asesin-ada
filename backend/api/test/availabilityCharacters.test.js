const { availabilityCharacters } = require('../controller'); 
const pool = require('../connectionManager'); 
const constants = require('../constants'); 
const { currentCharacters } = require('../controller'); 

jest.mock('../controller', () => ({
  ...jest.requireActual('../controller'),
  currentCharacters: jest.fn(),
}));

describe('availabilityCharacters function', () => {
  beforeEach(() => {
    currentCharacters.mockImplementation(() => Array(constants.NUM_PLAYERS).fill(''));
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterAll(() => {
    pool.end();
  });

  test('returns availability of characters', async () => {
    const idGame = '123456';
    const mockClient = {
      release: jest.fn(),
      query: jest.fn().mockResolvedValue({ rows: [] }),

    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    const result = await availabilityCharacters(idGame);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.release).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      areAvailable: Array(constants.NUM_PLAYERS).fill(''),
      characterAvaliable: constants.CHARACTERS_NAMES,
    });
  });
});