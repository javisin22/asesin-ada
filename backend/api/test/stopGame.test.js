const { changeGameState, stopGame } = require('../controller');
const constants = require('../constants'); 
const pool = require('../connectionManager'); 


describe('stopGame function', () => {
  afterAll(() => {
    pool.end();
  });
  test('returns success when game state is changed', async () => {

    const idGame = 123456
    const mockClient = {
      connect: jest.fn(),
      query: jest.fn().mockResolvedValue({
        rows: [{}], 
      }),
      release: jest.fn(),
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    const result = await stopGame(idGame);

    expect(result).toEqual({ exito: true});
  });
});