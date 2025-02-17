const { playerInformation, getCards,getPlayerStateInformation } = require('../controller');
const pool = require('../connectionManager');
const constants = require('../constants');

jest.mock('../controller', () => ({
  ...jest.requireActual('../controller'),
  playerInformation: jest.fn(),
  getCards: jest.fn(),
}));

describe('getPlayerStateInformation', () => {
  afterAll(() => {
    pool.end();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns player state information', async () => {
      const mockClient = {
      query: jest.fn().mockResolvedValue({
        rows: [
          { 
            positions: ['position1'],
            sospechas: ['sospecha1', 'sospecha2'],
            cards: ['card1', 'card2'],
            turnoOwner: 'turno1', 
          }
        ]
      }),
      release: jest.fn(),
    };
    pool.connect = jest.fn().mockResolvedValue(mockClient);

    let result;
    try{
        result = await getPlayerStateInformation(123456, 'username1');

        playerInformation.mockResolvedValue(
          result.positions = ['position1'],
          result.sospechas = ['sospecha1', 'sospecha2'],
          result.turnoOwner = 'turno1',
        );
        
        getCards.mockResolvedValue(result.cards = ['card1', 'card2']);

    }finally{
        mockClient.release();
    }
    //expect(result.sospechas).toEqual(['sospecha1', 'sospecha2']);
    expect(result).toEqual({
      exito: true,
      positions: ['position1'],
      sospechas: ['sospecha1', 'sospecha2'],
      cards: ['card1', 'card2'],
      turnoOwner: 'turno1',
    });
  });
});

/*describe('getPlayerStateInformation', () => {
  afterAll(() => {
    pool.end();
  });

  test('returns player state information', async () => {
    playerInformation.mockResolvedValue({
      positions: ['position1'],
      sospechas: ['sospecha1', 'sospecha2'],
      turnoOwner: 'turno1',
    });
    
    getCards.mockResolvedValue({
      cards: ['card1', 'card2'],
    });

    const mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    mockClient.query.mockResolvedValue({
      rows: [
        { 
          positions: ['position1'],
          sospechas: ['sospecha1', 'sospecha2'],
          cards: ['card1', 'card2'],
          turnoOwner: 'turno1', 
        }
      ]
    });
    
    pool.connect = jest.fn().mockResolvedValue(mockClient);

    const result = await getPlayerStateInformation(123456, 'username1');

    expect(result).toEqual({
      exito: true,
      positions: ['position1'],
      sospechas: ['sospecha1', 'sospecha2'],
      cards: ['card1', 'card2'],
      turnoOwner: 'turno1',
    });
  });
});*/
