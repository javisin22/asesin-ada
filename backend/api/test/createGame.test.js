const { createGame } = require('../controller'); 
const pool = require('../connectionManager')
const constants = require('../constants'); 

jest.mock('../controller', () => ({
  ...jest.requireActual('../controller'),
  generarEnteroSeisDigitos: jest.fn(),
  getAsesino: jest.fn(),
  getArma: jest.fn(),
  getLugar: jest.fn(),
  getCurrentDate: jest.fn()
}));

const {
  generarEnteroSeisDigitos,
  getAsesino,
  getArma,
  getLugar,
  getCurrentDate
} = require('../controller');

describe('createGame function', () => {
  afterAll(() => {
    pool.end();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('creates a game successfully', async () => {
    const asesino = 'mr DISCRETO';
    const arma = 'troyano';
    const lugar = 'aulas norte';
    const date = 'hoy';
    const id_partida = 123456;
    const mockClient = {
      query: jest.fn()
        .mockResolvedValueOnce({ rows: [] }) 
        .mockResolvedValue({ rows: [{}] }),
      release: jest.fn()
    };
    

    let result;
    try {
      result = await createGame('l');
      generarEnteroSeisDigitos.mockReturnValue(result.id_partida = 123456);
      getAsesino.mockResolvedValue(result.asesino = asesino);
      getArma.mockResolvedValue(result.arma = arma);
      getLugar.mockResolvedValue(result.lugar = lugar);
      getCurrentDate.mockReturnValue(result.date = date);

    } finally {
      await mockClient.release();
    }

    expect(result.exito).toBe(true);
    expect(result.id_partida).toBe(id_partida);
    expect(result.asesino).toBe(asesino);
    expect(result.arma).toBe(arma);
    expect(result.lugar).toBe(lugar);
    
  });


});