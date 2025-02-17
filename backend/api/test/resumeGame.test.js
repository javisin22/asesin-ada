const { changeGameState, resumeGame } = require('../controller'); 
const constants = require('../constants'); 
const pool = require('../connectionManager'); 


describe('changeGameState function', () => {
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

    const result = await resumeGame(idGame);

    expect(result).toEqual({ exito: true });
  });
});