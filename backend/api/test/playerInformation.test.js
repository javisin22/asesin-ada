const { playerInformation } = require('../controller');
const constants = require('../constants');
const pool = require('../connectionManager');

describe('playerInformation function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    pool.end();
  });

  it('should return correct player information when valid player is provided', async () => {
    const selectResult = {
      rows: [
        { 
          ficha: 'mr SOPER', 
          id_partida: '123456', 
          sospechas: 3, 
          posicion: 'position1', 
          estado: 'active', 
          n_jugadas: 10, 
          n_ganadas_local: 5, 
          n_ganadas_online: 2, 
          estado_partida: 'playing', 
          tipo_partida: 'local' 
        },
      ],
    };

    const mockClient = {
      query: jest.fn().mockResolvedValue(selectResult),
      release: jest.fn(),
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    const player = 'Bot1';

    const result = await playerInformation(player);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_INFO_JUGADOR, [player]);
    expect(mockClient.release).toHaveBeenCalled();
    expect(result.exito).toBe(true);
    expect(result.character).toEqual('mr SOPER');
    expect(result.partida_actual).toEqual('123456');
    expect(result.sospechas).toEqual(3);
    expect(result.posicion).toEqual('position1');
    expect(result.estado_player).toEqual('active');
    expect(result.partidas_jugadas).toEqual(10);
    expect(result.partidas_ganadas_local).toEqual(5);
    expect(result.partidas_ganadas_online).toEqual(2);
    expect(result.estado_partida).toEqual('playing');
    expect(result.tipo_partida).toEqual('local');
  });

  it('should return error message when invalid player is provided', async () => {
    const selectResult = { rows: [] };

    const mockClient = {
      query: jest.fn().mockResolvedValue(selectResult),
      release: jest.fn(),
    };

    pool.connect = jest.fn().mockResolvedValue(mockClient);

    const player = 'InvalidBot';

    const result = await playerInformation(player);

    expect(pool.connect).toHaveBeenCalled();
    expect(mockClient.query).toHaveBeenCalledWith(constants.SELECT_INFO_JUGADOR, [player]);
    expect(mockClient.release).toHaveBeenCalled();
    expect(result.exito).toBe(false);
    expect(result.msg).toEqual(constants.WRONG_IDGAME);
  });
});