###############################################
# Author: Grace Hopper
#
#
#
###############################################

import sys
import random
import time

# Constantes para n_players y n_things
N_PLAYERS = 6
N_PLACES = 9
N_WEAPONS = 6
N_PEOPLE = 6

MAX_PROB = 100
MIN_PROB = 0

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

def checkArgs():
	if len(sys.argv) != 10:
		print("Usage: python updateCard.py <me> <lvl> <asker> <holder> <where> <who> <what> <hasSmg> <card>")
		print(len(sys.argv))
		sys.exit(1)

def getCard():
	str_tarjeta = sys.argv[9]
	str_tarjeta = str_tarjeta.split(',')

	# Convertir la lista de tarjetas a una matriz de enteros
	tarjeta = [[int(str_tarjeta[i*N_PLAYERS+j]) for j in range(N_PLAYERS)] for i in range(N_PEOPLE+N_PLACES+N_WEAPONS)]

	return tarjeta

def level1():
	me = int(sys.argv[1])
	asker = int(sys.argv[3])
	tarjeta = getCard()

	if me == asker:
		holder = int(sys.argv[4])
		idx = (asker + 1) % N_PLAYERS
		where = PLACES.index(sys.argv[5])
		who = PEOPLE.index(sys.argv[6])
		what = WEAPONS.index(sys.argv[7])

		while idx != holder:
			# Este player no tiene la tarjeta que se pregunta
			tarjeta[where][idx] = MIN_PROB
			tarjeta[who+N_PLACES][idx] = MIN_PROB
			tarjeta[what+N_PLACES+N_PEOPLE][idx] = MIN_PROB
			idx = (idx + 1) % N_PLAYERS

		if idx != me:
			# Este player tiene la tarjeta que se pregunta
			hasSmg = int(sys.argv[8])
			line = 0

			if hasSmg == 0:
				tarjeta[where][idx] = MAX_PROB
				line = where
			elif hasSmg == 1:
				tarjeta[who+N_PLACES][idx] = MAX_PROB
				line = who+N_PLACES
			elif hasSmg == 2:
				tarjeta[what+N_PLACES+N_PEOPLE][idx] = MAX_PROB
				line = what+N_PLACES+N_PEOPLE
			
			for i in range(N_PLAYERS):
				if i != holder:
					tarjeta[line][i] = MIN_PROB

	return tarjeta

def allInfoFrom(card, holder):

	if card[holder] <= (MIN_PROB + 10):
		# Asumo que tengo la info completa de la carta
		return True
	for i in range(N_PLAYERS):
		if i != holder and card[i] >= (MAX_PROB - 10):
			# Tengo la info completa de la carta
			return True
	return False

def level2():
	me = int(sys.argv[1])
	asker = int(sys.argv[3])
	holder = int(sys.argv[4])
	where = PLACES.index(sys.argv[5])
	who = PEOPLE.index(sys.argv[6])
	what = WEAPONS.index(sys.argv[7])
	line = -1
	all = False

	tarjeta = getCard()
	if me == asker:
		hasSmg = int(sys.argv[8])

		if hasSmg == 0:
			tarjeta[where][holder] = MAX_PROB
			line = where
		elif hasSmg == 1:
			tarjeta[who+N_PLACES][holder] = MAX_PROB
			line = who+N_PLACES
		elif hasSmg == 2:
			tarjeta[what+N_PLACES+N_PEOPLE][holder] = MAX_PROB
			line = what+N_PLACES+N_PEOPLE

		for i in range(N_PLAYERS):
			if i != holder and i != me:
				tarjeta[line][i] = MIN_PROB

	idx = (asker + 1) % N_PLAYERS
	while idx != holder:
		# Este player no tiene la tarjeta que se pregunta
		if idx != me:
			tarjeta[where][idx] = MIN_PROB
			tarjeta[who+N_PLACES][idx] = MIN_PROB
			tarjeta[what+N_PLACES+N_PEOPLE][idx] = MIN_PROB
		idx = (idx + 1) % N_PLAYERS
	
	return tarjeta


def level3():
	me = int(sys.argv[1])
	asker = int(sys.argv[3])
	holder = int(sys.argv[4])
	where = PLACES.index(sys.argv[5])
	who = PEOPLE.index(sys.argv[6])
	what = WEAPONS.index(sys.argv[7])
	line = -1
	all = False
	tarjeta = getCard()

	with open('log.txt', 'a') as f:
		f.write(f"\n\tME: {me}, ASKER: {asker}, HOLDER: {holder}, WHERE: {where}:{PLACES[where]}, WHO: {who}:{PEOPLE[who]}, WHAT: {what}:{WEAPONS[what]}, obj: {sys.argv[8]}\n")
		printCard(tarjeta, f)

	if me == asker:
		hasSmg = int(sys.argv[8])

		if hasSmg == 0:
			tarjeta[where][holder] = MAX_PROB
			line = where
		elif hasSmg == 1:
			tarjeta[who+N_PLACES][holder] = MAX_PROB
			line = who+N_PLACES
		elif hasSmg == 2:
			tarjeta[what+N_PLACES+N_PEOPLE][holder] = MAX_PROB
			line = what+N_PLACES+N_PEOPLE
		else:
			print("Invalid hasSmg value")
			sys.exit(1)

		for i in range(N_PLAYERS):
			if i != holder:
				tarjeta[line][i] = MIN_PROB
	else:
		if holder != me:
			all_place = allInfoFrom(tarjeta[where], holder)
			all_who = allInfoFrom(tarjeta[who+N_PLACES], holder)
			all_what = allInfoFrom(tarjeta[what+N_PLACES+N_PEOPLE], holder)
			increase = 5
			decrease = 15
			# Si tengo toda la info de una carta aumento la probabilidad de las demás
			# No sé nada -> aumento 5, sé 1 -> aumento 10, sé 2 -> aumento MAX_PROB
			if all_place or all_who or all_what:
				# Si sé 1 carta aumento 10
				increase = 10
				# Si sé 2 cartas aumento MAX_PROB
				if (all_place and all_who) or (all_place and all_what) or (all_who and all_what):
					increase = MAX_PROB
			
			if increase == MAX_PROB:
				if not all_place:
					tarjeta[where][holder] = MAX_PROB
					line = where
				elif not all_who:
					tarjeta[who+N_PLACES][holder] = MAX_PROB
					line = who+N_PLACES
				elif not all_what:
					tarjeta[what+N_PLACES+N_PEOPLE][holder] = MAX_PROB
					line = what+N_PLACES+N_PEOPLE
				else:
					# El jugador no podía tener las cartas que se han enseñado, reinicio las probabilidades
					all = True
					tarjeta[where][holder] = 50
					tarjeta[who+N_PLACES][holder] = 50
					tarjeta[what+N_PLACES+N_PEOPLE][holder] = 50
				if not all:
					for i in range(N_PLAYERS):
						if i != holder and i != me:
							tarjeta[line][i] = MIN_PROB
			else:
				# sé 1 carta o no sé nada
				if not all_place:
					tarjeta[where][holder] = min(tarjeta[where][holder] + increase, MAX_PROB)
				if not all_who:
					tarjeta[who+N_PLACES][holder] = min(tarjeta[who+N_PLACES][holder] + increase, MAX_PROB)
				if not all_what:
					tarjeta[what+N_PLACES+N_PEOPLE][holder] = min(tarjeta[what+N_PLACES+N_PEOPLE][holder] + increase, MAX_PROB)

		tarjeta[where][asker] = max(tarjeta[where][asker] - decrease, MIN_PROB)
		tarjeta[who+N_PLACES][asker] = max(tarjeta[who+N_PLACES][asker] - decrease, MIN_PROB)
		tarjeta[what+N_PLACES+N_PEOPLE][asker] = max(tarjeta[what+N_PLACES+N_PEOPLE][asker] - decrease, MIN_PROB)

	idx = (asker + 1) % N_PLAYERS
	while idx != holder:
		if idx != me:
			# Este player no tiene la tarjeta que se pregunta
			tarjeta[where][idx] = MIN_PROB
			tarjeta[who+N_PLACES][idx] = MIN_PROB
			tarjeta[what+N_PLACES+N_PEOPLE][idx] = MIN_PROB

		idx = (idx + 1) % N_PLAYERS

	with open('log.txt', 'a') as f:
		f.write("\n\tTARJETA ACTUALIZADA\n")
		printCard(tarjeta, f)
	return tarjeta

def printCard(tarjeta, f):
	f.write("\nTarjeta:")
	f.write("Lugares:")
	f.write("\n")
	for i in range(N_PLACES):
		f.write(f"{PLACES[i]}: {tarjeta[i]}")
		f.write("\n")
	f.write("Personas:")
	f.write("\n")
	for i in range(N_PLACES, N_PLACES+N_PEOPLE):
		f.write(f"{PEOPLE[i-N_PLACES]}: {tarjeta[i]}")
		f.write("\n")
	f.write("Armas:")
	f.write("\n")
	for i in range(N_PLACES+N_PEOPLE, N_PLACES+N_PEOPLE+N_WEAPONS):
		f.write(f"{WEAPONS[i-N_PLACES-N_PEOPLE]}: {tarjeta[i]}")
		f.write("\n")

def printRes(tarjeta):
	for i in range(len(tarjeta)):
		for j in range(len(tarjeta[i])):
			print(tarjeta[i][j], end=',') if (j != (len(tarjeta[i]) - 1) or i != (len(tarjeta) - 1)) else print(tarjeta[i][j])

if __name__ == '__main__':

	checkArgs()
	lvl = int(sys.argv[2])

	if lvl == 1:
		res = level1()
	elif lvl == 2:
		res = level2()
	elif lvl == 3:
		res = level3()
	else:
		print("Invalid level")
		sys.exit(1)
	# printCard(res)   
	printRes(res)
