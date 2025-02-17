const { dealCards } = require('../controller'); 
const pool = require('../connectionManager'); 
const constants = require('../constants'); 


describe('dealCards function', () => {
  afterAll(() => {
    pool.end();
  });
  test('returns cards when game exists', async () => {
    const mockPlayers = [{ userName: 'player1' }, { userName: 'player2' }];
    const mockIdGame = 1;

    const mockClient = {
      connect: jest.fn(),
      query: jest.fn().mockResolvedValue({
        rows: [
          { cards: ['card1', 'card2'] },
          { cards: ['card3', 'card4'] },
        ],
      }),
      release: jest.fn(),
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    const result = await dealCards(mockPlayers, mockIdGame);

    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_CARTAS_DISTINT_SOLUTION, [mockIdGame]);
    console.log('Hola estoy en dealCards');
    console.log('RESULT:', result.cards);
    const expectedOutput1 = [
      [['card1', 'card2']],
      [['card3', 'card4']],
      [],
      [],
      [],
      [],
    ].map(cards => cards.sort());
    
    const expectedOutput2 = [
      [['card3', 'card4']],
      [['card1', 'card2']],
      [],
      [],
      [],
      [],
    ].map(cards => cards.sort());
    
    const sortedResultCards = result.cards.map(cards => cards.sort());
    
    expect([expectedOutput1, expectedOutput2]).toContainEqual(sortedResultCards);
    expect(result.exito).toEqual(true);
     
  });
  test('throws an error when the query fails', async () => {
    const mockPlayers = [{ userName: 'player1' }, { userName: 'player2' }];
    const mockIdGame = 1;
  
    const mockClient = {
      connect: jest.fn(),
      query: jest.fn().mockRejectedValue(new Error('Database error')),
      release: jest.fn(),
    };
  
    pool.connect = jest.fn().mockResolvedValue(mockClient);
  
    await expect(dealCards(mockPlayers, mockIdGame)).rejects.toThrow('Database error');
  });
});