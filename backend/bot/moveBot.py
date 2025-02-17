###############################################
# Author: Grace Hopper
#
#
#
###############################################

import sys
import json

info_tablero = []
info_habitaciones = []

# Constantes para n_players y n_things
N_PLAYERS = 6
N_PLACES = 9
N_WEAPONS = 6
N_PEOPLE = 6
PLACES = ['aulas norte',
  'recepcion',
  'laboratorio',
  'escaleras',
  'biblioteca',
  'ba:nos',
  'despacho',
  'cafeteria',
  'aulas sur']
PEOPLE = ['mr SOPER',
  'miss REDES',
  'mr PROG',
  'miss FISICA',
  'mr DISCRETO',
  'miss IA']
WEAPONS = ['teclado',
  'cable de red',
  'cafe envenenado',
  'router afilado',
  'troyano',
  'cd']

# Constantes para el tablero
N_COLS = 24

# Comprobación de que ua casilla es válida
def checkIndex(index):
	if index < 0 or index >= len(info_tablero):
		return False
	if (info_tablero[index]['isWalkable'] == False and info_tablero[index]['isRoom'] == False) or (info_tablero[index]['roomName'] != '' and info_tablero[index]['isDoor'] == False):
		return False
	return True

def checkNeighbour(index, vecino):
	if checkIndex(vecino):
		if (vecino % 24 == 0) and (index % 24 == 23):
			return False
		if (vecino % 24 == 23) and (index % 24 == 0):
			return False
		return True
	return False


# Comprobación de qué casillas vecinas son válidas
def checkNeighbours(index, vecinos):
	checked = []
	if info_tablero[index]['isDoor'] != False:
		if(info_tablero[index]['isDoor'] == 'd' and checkIndex(index + vecinos[0])):
			checked.append(index + vecinos[0])
		elif(info_tablero[index]['isDoor'] == 'r' and checkIndex(index + vecinos[1])):
			checked.append(index + vecinos[1])
		elif(info_tablero[index]['isDoor'] == 'u' and checkIndex(index + vecinos[2])):
			checked.append(index + vecinos[2])
		elif(info_tablero[index]['isDoor'] == 'l' and checkIndex(index + vecinos[3])):
			checked.append(index + vecinos[3])
	else:
		for i in range(4):
			if checkNeighbour(index, index + vecinos[i]):
				if info_tablero[index + vecinos[i]]['isDoor'] != False:
					if(i == 0 and info_tablero[index + vecinos[i]]['isDoor'] == 'u'):
						checked.append(index + vecinos[i])
					elif(i == 1 and info_tablero[index + vecinos[i]]['isDoor'] == 'l'):
						checked.append(index + vecinos[i])
					elif(i == 2 and info_tablero[index + vecinos[i]]['isDoor'] == 'd'):
						checked.append(index + vecinos[i])
					elif(i == 3 and info_tablero[index + vecinos[i]]['isDoor'] == 'r'):
						checked.append(index + vecinos[i])
				else:
					checked.append(index + vecinos[i])
	return checked


def bfs(casilla, dados, vecinos):
	visited = []
	if info_tablero[casilla]['roomName'] != '':
		# estamos en una habitacion y podemos salir por varias puertas y hay pasadizos
		frontera = [c['idx'] for c in info_tablero if info_tablero[casilla]['roomName'] == c['roomName'] and c['isDoor']!=False]
		paths = [c for c in info_tablero if info_tablero[casilla]['roomName'] == c['roomName'] and c['isPath']!=False]
		for c in paths:
			# print(c) (DEBUG)
			visited.append(int(c['isPath']))
		
		# print(f"la frontera es {frontera} y los visited son {visited}") (DEBUG)
		
	else:
		frontera = [casilla]
	while dados >= 0:
		for _ in range(len(frontera)):
			casilla = frontera.pop(0)
			visited.append(casilla)
			for neighbour in checkNeighbours(casilla, vecinos):
				if neighbour not in visited and neighbour not in frontera:
					frontera.append(neighbour)
		dados -= 1

	return visited

def turn(casillas_pjs, casilla, dados, vecinos):

	if dados < 2 or dados > 12:
		print("Número de dados no válido: ", dados, file=sys.stderr)
		sys.exit(1)

	with open('../bot/infoTablero.json', 'r') as file:
		global info_tablero
		info_tablero = json.load(file)
	
	# Leer el JSON desde el archivo
	with open('../bot/infoHabitaciones.json', 'r') as file:
		global info_habitaciones
		info_habitaciones = json.load(file)
		# Quitar ada byron
		info_habitaciones = info_habitaciones[:4] + info_habitaciones[5:]


	if casilla < 0 or casilla >= len(info_tablero):
		print("Casilla inicial no válida: ", casilla, file=sys.stderr)
		sys.exit(1)

	# Sintaxis del tablero: { isRoom: bool,  roomName: 'int', isStartingCell: bool, isWalkable: bool, isDoor: 'num_hab', idx:int }
	# Sintaxis de las habitaciones: { roomName: 'int', roomNumber: int, style: {} }
		
	# Comprobación de la casilla inicial
	if not checkIndex(casilla):
		print("Casilla inicial no válida: ", casilla, file=sys.stderr)
		sys.exit(1)
	
	# Comprobación de las casillas de los jugadores
	for i in range(len(casillas_pjs)):
		# Marcar las casillas de los jugadores como no transitables
		info_tablero[casillas_pjs[i]]['isWalkable'] = False if info_tablero[casillas_pjs[i]]['isRoom'] == False else None

	candidatos = bfs(casilla, dados, vecinos)
	candidatos = sorted(candidatos)
	# print(candidatos) (DEBUG)
	return candidatos

def bfs_habitacion(candidatos, room, vecinos, casillas_pjs):

	room = str(room)
	# Inicializar la lista de explorados
	visitados = []
	frontera = [c['idx'] for c in info_tablero if c['roomName'] == room and c['isDoor'] != False]
	
	while frontera:
		casilla_actual = frontera.pop(0)
		
		# Verificar si la casilla actual es una candidata
		if casilla_actual in candidatos:
			return casilla_actual  # Se encontró una casilla candidata
		
		# Marcar la casilla actual como visitada
		visitados.append(casilla_actual)
		
		# Explorar los vecinos de la casilla actual
		for vecino in checkNeighbours(casilla_actual, vecinos):
			if vecino not in visitados:
				frontera.append(vecino)
	
	# No se encontraron casillas candidatas, el jugador está atrapado, probar sin bloquear las casillas de los jugadores
	visitados = []
	frontera = [c['idx'] for c in info_tablero if c['roomName'] == room and c['isDoor'] != False]

	# Comprobación de las casillas de los jugadores
	for i in range(len(casillas_pjs)):
		# Marcar las casillas de los jugadores como transitables
		info_tablero[casillas_pjs[i]]['isWalkable'] = True

	while frontera:
		casilla_actual = frontera.pop(0)
		
		# Verificar si la casilla actual es una candidata
		if casilla_actual in candidatos:
			# Restaurar las casillas de los jugadores
			for i in range(len(casillas_pjs)):
				# Marcar las casillas de los jugadores como no transitables
				info_tablero[casillas_pjs[i]]['isWalkable'] = False if info_tablero[casillas_pjs[i]]['isRoom'] == False else None
			return casilla_actual  # Se encontró una casilla candidata
		
		# Marcar la casilla actual como visitada
		visitados.append(casilla_actual)
		
		# Explorar los vecinos de la casilla actual
		for vecino in checkNeighbours(casilla_actual, vecinos):
			if vecino not in visitados:
				frontera.append(vecino)

	# Restaurar las casillas de los jugadores
	for i in range(len(casillas_pjs)):
		# Marcar las casillas de los jugadores como no transitables
		info_tablero[casillas_pjs[i]]['isWalkable'] = False if info_tablero[casillas_pjs[i]]['isRoom'] == False else None
	
	return -1

def getLeastInfo(tarjeta, me, group):
	# Calcular la cantidad de información de cada carta
	info = [0 for _ in range(len(tarjeta))]
	for i in range(len(tarjeta)):
		for j in range(N_PLAYERS):
			info[i] += abs(tarjeta[i][j]-50)
	
	min_info = info.index(min(info))
	# Get the last digit of the group
	_me = (me + group) % N_PLAYERS 
	for _ in range(len(info)):
		if info[_me] <= info[min_info]:
			return _me
		_me = (_me + 1) % N_PLAYERS
	return min_info

def decidirMovimiento(candidatos, tarjeta, vecinos, me, group, casillas_pjs):
	min_prob = getLeastInfo(tarjeta, me, group)

	# Transformar el indice en las puertas de la habitación
	room = info_habitaciones[min_prob]['roomNumber']

	# print("place: ", info_habitaciones[min_prob]['roomName']) (DEBUG)

	return bfs_habitacion(candidatos, room, vecinos, casillas_pjs)


def sospecha(tarjeta, me, election, group):
	if info_tablero[election]['roomName'] == '':
		# print("No se puede hacer una sospecha en una casilla que no es una habitación") (DEBUG)
		print(f"MOVE,{election},FIN,")
	else:
		# Seleccionar una carta de cada tipo (la de menor información)
		# La habitación debe ser la de la casilla en la que se encuentra el jugador
		i = 0
		for room in info_habitaciones:
			if int(info_tablero[election]['roomName']) == room['roomNumber']:
				place = i
				break
			i += 1

		# Desde N_PLACES hasta N_PLACES+N_PEOPLE están los personajes
		who = getLeastInfo(tarjeta[N_PLACES:N_PLACES+N_PEOPLE], me, group)

		# Desde N_PLACES+N_PEOPLE hasta N_PLACES+N_PEOPLE+N_WEAPONS están las armas
		weapon = getLeastInfo(tarjeta[N_PLACES+N_PEOPLE:N_PLACES+N_PEOPLE+N_WEAPONS], me, group)

		# Imprimir la sospecha
		# print(f"Sospecha: {PLACES[place]}, {PEOPLE[who]}, {WEAPONS[weapon]}") (DEBUG)
		print(f"MOVE,{election},SUSPECT,{PLACES[place]},{PEOPLE[who]},{WEAPONS[weapon]},")

def acusacion(tarjeta):
	info_place = False
	info_who = False
	info_weapon = False

	MIN_INFO = 25

	idx_place = -1
	idx_who = -1
	idx_weapon = -1

	# Comprobar si se puede hacer una acusación
	for i in range(len(tarjeta)):
		if i < N_PLACES:
			# Lugares
			if sum(tarjeta[i]) <= MIN_INFO:
				info_place = True
				idx_place = i
		else:
			if not info_place:
				# No hay suficiente información para hacer una acusación
				break
			if i < N_PLACES+N_PEOPLE:
				# Personas
				if sum(tarjeta[i]) <= MIN_INFO:
					info_who = True
					idx_who = i
			else:
				if not (info_who and info_place):
					# No hay suficiente información para hacer una acusación
					break
				# Armas
				if sum(tarjeta[i]) <= MIN_INFO:
					info_weapon = True
					idx_weapon = i

	return (info_place and info_who and info_weapon), idx_place, idx_who, idx_weapon

def printCard(tarjeta):
	print("Tarjeta:")
	print("Lugares:")
	for i in range(N_PLACES):
		print(f"{i}: {tarjeta[i]}")
	print("Personas:")
	for i in range(N_PLACES, N_PLACES+N_PEOPLE):
		print(f"{i}: {tarjeta[i]}")
	print("Armas:")
	for i in range(N_PLACES+N_PEOPLE, N_PLACES+N_PEOPLE+N_WEAPONS):
		print(f"{i}: {tarjeta[i]}")		

def sameRoom(last_pos, decision):
	room = info_tablero[last_pos]['roomName']
	# print(f"room: {room}, decision: {info_tablero[decision]['roomName']}") # (DEBUG)
	if room == '':
		return False
	if room == info_tablero[decision]['roomName']:
		return True
	return False

# Devuelve la posición frente a la puerta de la habitación
def getDoor(casilla, vecinos, casillas_pjs):
	# Si hay un pasadizo, se elige la casilla del pasadizo
	path = [c['idx'] for c in info_tablero if c['isPath'] != False and c['roomName'] == info_tablero[casilla]['roomName']]
	if path:
		return int(info_tablero[path[0]]['isPath'])
	doors = [c['idx'] for c in info_tablero if c['isDoor'] != False and c['roomName'] == info_tablero[casilla]['roomName']]
	choice = -1
	for door in doors:
		# Depende de dónde esté la puerta, se elige la casilla de la puerta
		entrance = info_tablero[door]['idx']
		if info_tablero[door]['isDoor'] == 'd':
			# Comprobar si la puerta está bloqueada
			if not (entrance + vecinos[0] in casillas_pjs):
				# print(f"entrance: {entrance}, vecinos[0]: {vecinos[0]}, result: {entrance + vecinos[0]}")
				choice = (entrance + vecinos[0])
				break
		elif info_tablero[door]['isDoor'] == 'u':
			if not (entrance + vecinos[2] in casillas_pjs):
				# print(f"entrance: {entrance}, vecinos[2]: {vecinos[2]}, result: {entrance + vecinos[2]}")
				choice = (entrance + vecinos[2])
				break
		elif info_tablero[door]['isDoor'] == 'r':
			if not (entrance + vecinos[1] in casillas_pjs):
				# print(f"entrance: {entrance}, vecinos[1]: {vecinos[1]}, result: {entrance + vecinos[1]}")
				choice = (entrance + vecinos[1])
				break
		elif info_tablero[door]['isDoor'] == 'l':
			if not (entrance + vecinos[3] in casillas_pjs):
				# print(f"entrance: {entrance}, vecinos[3]: {vecinos[3]}, result: {entrance + vecinos[3]}")
				choice = (entrance + vecinos[3])
				break
	return choice

if __name__ == "__main__":
	
	# Comprobación de parámetros
	if len(sys.argv) != 6:
		print("Uso: python bot.py <[casillas_pjs]> <casilla_inicial> <dados> <tarjeta> <group>", file=sys.stderr)
		sys.exit(1)

	# Inicialización de variables
	casillas_pjs = sys.argv[1]
	# Convertir la lista de casillas de los jugadores a una lista de enteros
	str_casillas_pjs = casillas_pjs.split(",")
	#Replace de empty items en la lista de casillas de los jugadores
	casillas_pjs = []
	for i in range(len(str_casillas_pjs)):
		casillas_pjs.append(int(str_casillas_pjs[i]) if str_casillas_pjs[i] else 1)

	with open('log.txt', 'a') as f:
		f.write(f"{casillas_pjs}\n")
		for i in range(len(casillas_pjs)):
			f.write(f"{type(casillas_pjs[i])}\n")

	yo = int(sys.argv[2])
	casilla = casillas_pjs[yo]
	dados = int(sys.argv[3])
	str_tarjeta = sys.argv[4]

	group = int(sys.argv[5]) % 10

	# Rellenar la tarjeta como una matriz de n_jugadores x n_cartas
	str_tarjeta = str_tarjeta.split(",")

	# Convertir la lista de tarjetas a una matriz de enteros
	tarjeta = [[int(str_tarjeta[i*N_PLAYERS+j]) for j in range(N_PLAYERS)] for i in range(N_PEOPLE+N_PLACES+N_WEAPONS)]

	# Eliminar la componente "yo" de la lista de casillas de los jugadores
	last_pos = casillas_pjs[yo]
	casillas_pjs = casillas_pjs[:yo] + casillas_pjs[yo+1:]
	# Eliminar los posibles <empty items> de la lista de casillas de los jugadores

	casillas_pjs = [c for c in casillas_pjs if c != '']

	vecinos = [N_COLS, 1, -N_COLS, -1]

	candidatos = turn(casillas_pjs, casilla, dados, vecinos)

	acusar, idx_place, idx_who, idx_weapon = acusacion(tarjeta)
	
	if not acusar:
		# Pasar las primeras N_PLACES componentes de la tarjeta a una lista de lugares
		election = decidirMovimiento(candidatos, tarjeta[:N_PLACES], vecinos, yo, group, casillas_pjs)
		# printCard(tarjeta) (DEBUG)
		if election == -1:
			# No se puede mover
			print(f"MOVE,{last_pos},FIN,")
		else:
			if sameRoom(last_pos, election):
				puerta = getDoor(election, vecinos, casillas_pjs)
				if puerta == -1:
					print(f"MOVE,{election},FIN,")
				else:
					sospecha(tarjeta, yo, puerta, group)
			else:
				sospecha(tarjeta, yo, election, group)
	else:
		decision = bfs_habitacion(candidatos, info_habitaciones[idx_place]['roomNumber'], vecinos, casillas_pjs)
		if decision == -1:
			# No me muevo
			print(f"MOVE,{last_pos},FIN,")
		else:
			if sameRoom(last_pos, decision):
				puerta = getDoor(decision, vecinos, casillas_pjs)
				print(f"DOOR,{puerta},FIN,")
			else:
				print(f"MOVE,{decision},FIN,") if (info_tablero[decision]['roomName'] == '') else print(f"MOVE,{decision},ACCUSE,{PLACES[idx_place]},{PEOPLE[idx_who-N_PLACES]},{WEAPONS[idx_weapon-N_PLACES-N_PEOPLE],}")
