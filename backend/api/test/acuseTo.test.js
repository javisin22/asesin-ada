const { acuse_to, win, lose} = require('../controller');
const constants = require('../constants');
const pool = require('../connectionManager'); 

jest.mock('../controller', () => ({
    ...jest.requireActual('../controller'), 
    win: jest.fn(),
    lose: jest.fn()
}));


describe('acuse_to function', () => {
    afterAll(() => {
        pool.end();
    });
  beforeEach(() => {
    jest.clearAllMocks();
  });
  

    test('should return correct message and call lose function when no solution found', async () => {
    const selectResult = {rows: []};
    const mockClient = {
      query: jest.fn().mockResolvedValue(selectResult),
      release: jest.fn()
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    const idGame = 123456;
    const player = 'Player1';
    const characterCard = 'mr SOPER';
    const weaponCard = 'troyano';
    const placeCard = 'Aulas norte';

    win.mockResolvedValue({exito: true}, {msg: "¡Has ganado la partida!"});
    lose.mockResolvedValue({exito: false}, {msg: "¡Has perdido la partida!"})
    const result = await acuse_to(player, idGame, characterCard, weaponCard, placeCard);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_SOLUTION, [idGame, characterCard, weaponCard, placeCard]);
    expect(mockClient.release).toHaveBeenCalled();
    expect(result.exito).toBe(false);
    expect(result.msg).toBe(constants.WRONG_ACUSE);
  });

    test('should return correct message and call win function when solution found', async () => {
    const selectResult = {
      rows: [{ solution: 'Correct' }]
    };

    const mockClient = {
      query: jest.fn().mockResolvedValue(selectResult),
      release: jest.fn()
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    const idGame = 123456;
    const player = 'Player1';
    const characterCard = 'mr SOPER';
    const weaponCard = 'troyano';
    const placeCard = 'Aulas norte';

    win.mockResolvedValue({exito: true}, {msg: "¡Has ganado la partida!"});
    lose.mockResolvedValue({exito: false}, {msg: "¡Has perdido la partida!"})
    const result = await acuse_to(player, idGame, characterCard, weaponCard, placeCard);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_SOLUTION, [idGame, characterCard, weaponCard, placeCard]);
    expect(mockClient.release).toHaveBeenCalled();
    expect(result.exito).toBe(true);
    expect(result.msg).toBe(constants.CORRECT_ACUSE);
  });
});
