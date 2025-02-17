
import json
global info_tablero
global info_habitaciones

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

def getInfo():
	with open('../bot/infoTablero.json', 'r') as file:
		global info_tablero
		info_tablero = json.load(file)
	
	# Leer el JSON desde el archivo
	with open('../bot/infoHabitaciones.json', 'r') as file:
		global info_habitaciones
		info_habitaciones = json.load(file)
		# Quitar ada byron
		info_habitaciones = info_habitaciones[:4] + info_habitaciones[5:]

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

if __name__ == "__main__":
	getInfo()
	elec = 105
	bot9742710 = "0,0,0,0,100,0,0,0,100,0,0,0,0,100,0,0,0,0,100,0,0,0,0,0,50,0,0,0,0,50,0,0,100,0,0,0,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,0,50,50,0,0,0,50,50,50,50,0,0,0,50,50,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,0,0,100,0,100,0,0,0,0,0,0,0,0,50,50,0,0,0,0,100,0,50,0,0,0,0,50,0,100,0,0,0,0,50,0,0,0,0,50,0,0,0,0,0,0"
	bot9742711 = "0,0,0,0,100,0,50,0,0,0,50,50,0,100,0,0,0,0,50,50,0,0,0,0,0,0,0,0,0,100,0,0,100,0,0,0,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,0,50,50,0,0,0,0,0,0,50,0,0,0,50,50,0,0,0,0,0,0,50,50,0,0,0,0,0,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,50,50,0,0,0,0,50,50,0,0,0,0,0,0,100,0,0,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0"
	bot9742712 = "0,0,0,0,100,0,0,0,0,0,0,0,0,0,0,100,0,0,50,50,0,0,0,0,50,0,0,0,0,50,0,0,100,0,0,0,0,0,0,0,50,50,0,0,0,0,0,0,0,0,0,0,50,50,0,0,0,100,0,0,50,0,0,0,50,50,0,0,0,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,0,50,50,0,0,0,0,0,0,0,50,50,0,0,0,0,50,50,50,0,0,0,0,50,100,0,0,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0"
	bot9742713 = "0,0,0,0,100,0,50,0,0,0,0,50,0,100,0,0,0,0,50,50,0,0,0,0,0,0,0,0,0,100,0,0,50,0,0,0,0,0,0,0,100,0,0,50,50,50,0,0,0,0,0,0,100,0,0,0,0,100,0,0,50,0,0,0,0,50,0,0,0,0,0,0,50,50,50,0,0,0,0,0,0,0,0,100,0,50,50,0,0,0,0,0,0,0,100,0,0,0,0,0,0,50,0,0,0,0,0,100,100,0,0,0,0,0,0,0,0,0,100,0,0,0,50,0,0,0"
	bot9742715 = "0,0,0,0,0,100,20,0,0,0,55,0,0,100,0,0,0,0,55,35,0,0,0,0,0,0,0,0,0,100,0,0,35,0,0,0,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,0,0,0,100,0,100,0,0,0,0,0,0,0,0,100,0,0,0,0,0,55,0,0,0,0,0,0,0,100,0,0,0,0,0,0,0,0,0,0,0,0,0,35,0,0,0"
	
	# transform to array of (N_PLAYERS, N_PLACES+N_PEOPLE+N_WEAPONS) each one
	bot0 = bot9742710.split(',')
	tarjeta = [[int(bot0[i*N_PLAYERS+j]) for j in range(N_PLAYERS)] for i in range(N_PEOPLE+N_PLACES+N_WEAPONS)]
	printCard(tarjeta)

	