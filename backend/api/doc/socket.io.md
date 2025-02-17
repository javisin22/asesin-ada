## Mensajes SOCKET.IO

---

### start-game():

- **Descripción:** Un usuario solicita que se inicie la partida.
- **Emitido por:** Cliente.
- **Recibido por:** Servidor.
- **Datos:** No recibe datos.
- **Funcionamiento:** El servidor envia la lista de personajes disponibles.
- **Se responde con:** `start-game-response(names, available, guns, rooms)`

---

### leave-game():

- **Descripción:** Un usuario abandona la partida.
- **Emitido por:** Cliente.
- **Recibido por:** Servidor.
- **Datos:** No recibe datos.
- **Funcionamiento:** El servidor elimina al usuario de la partida.

---

### character-selected(charcter):

- **Descripción:** Un usuario selecciona un personaje.
- **Emitido por:** Cliente.
- **Recibido por:** Servidor.
- **Datos:**
  - `character`: nombre del personaje seleccionado por el cliente.
- **Funcionamiento:** El servidor envia la lista de personajes disponibles.
- **Se responde con:** `game-info(names, available, guns, rooms, cards, sospechas, posiciones, turnoOwner)`

---

### chat-message(msg):

- **Descripción:** Mensaje de chat.
- **Emitido por:** Cliente.
- **Recibido por:** Servidor.
- **Datos:**
  - `msg`: contenido del mensaje de chat.
- **Funcionamiento:** El servidor reenvia el mensaje a todos los clientes.
- **Se responde con:** `chat-response(msg, emisor, currentTimestamp, date)`

---

### request-resume-game():

- **Descripción:** Un usuario solicita reanudar la partida.
- **Emitido por:** Cliente.
- **Recibido por:** Servidor.
- **Datos:** No recibe datos.
- **Funcionamiento:** El servidor reanuda la partida.
- **Se responde con:** `game-resumed-response()`

---

### request-pause-game():

- **Descripción:** Un usuario solicita pausar la partida al final del turno actual.
- **Emitido por:** Cliente.
- **Recibido por:** Servidor.
- **Datos:** No recibe datos.
- **Funcionamiento:** El servidor pausa la partida al final del turno actual.
- **Se responde con:** `game-paused-response()`

---

### turno-moves-to(username, position, fin):

- **Descripción:** Un usuario se mueve a una posicion.
- **Emitido por:** Cliente.
- **Recibido por:** Servidor.
- **Datos:**
  - `username`: nombre del usuario que se ha movido.
  - `position`: posicion a la que se ha movido.
  - `fin`: false si ha entrado en una habitacion, true si no.
- **Funcionamiento:** El servidor actualiza la posicion del usuario en el tablero.
- **Se responde con:** `turno-moves-to-response(username, position)`

---

### turno-asks-for(username, character, gun, room, is_final):

- **Descripción:** Un usuario realiza una sospecha.
- **Emitido por:** Cliente.
- **Recibido por:** Servidor.
- **Datos:**
  - `username`: nombre del usuario que ha realizado la sospecha.
  - `character`: personaje preguntado.
  - `gun`: arma preguntada.
  - `room`: habitacion preguntada.
  - `is_final`: true si es una acusacion final, false si es una sospecha.
- **Funcionamiento:** El servidor envia la sospecha a todos los usuarios.
- **Se responde con:** `turno-asks-for-response(username, character, gun, room)`

---

### turno-card-selected(username_asking, username_shower, card):

- **Descripción:** Un usuario ha seleccionado una carta para enseñar a otro jugador.
- **Emitido por:** Cliente.
- **Recibido por:** Servidor.
- **Datos:**
  - `username_asking`: nombre del usuario que ha pedido la carta.
  - `username_shower`: nombre del usuario que ha enseñado la carta.
  - `card`: carta seleccionada.
- **Funcionamiento:** El servidor envia la carta seleccionada al usuario que ha pedido la carta.
- **Se responde con:** `turno-show-cards(username_asking, username_shower, card, character_asked, gun_asked, room_asked)`

---

### response-sospechas(sospechas):

- **Descripción:** Un usuario envia la informacion de las sospechas actuales.
- **Emitido por:** Cliente.
- **Recibido por:** Servidor.
- **Datos:**
  - `sospechas`: lista de sospechas realizadas.
- **Funcionamiento:** El servidor actualiza la informacion de las sospechas actuales.

---

### chat-response(username, message, serverOffset, timeStamp, character):

- **Descripción:** Se ha recibido un mensaje.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:**
  - `username`: nombre del usuario que envio el mensaje.
  - `message`: contenido del mensaje de chat.
  - `serverOffset`: timestamp del mensaje, para actualizar offset del cliente.
  - `timeStamp`: timestamp del mensaje.
  - `character`: personaje del usuario que envio el mensaje.
- **Funcionamiento:** El cliente muestra el mensaje en el chat.

---

### turno-owner(username):

- **Descripción:** Es el turno de un usuario.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:**
  - `username`: nombre del usuario al que le toca el turno.
- **Funcionamiento:** El cliente muestra en pantalla que es el turno de un usuario. Si el usuario que recibe el mensaje es el mismo que el nombre de usuario, se le habilitan los controles para jugar.

---

### turno-moves-to-response(username, position):

- **Descripción:** Un usuario se ha movido a una posicion.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:**
  - `username`: nombre del usuario que se ha movido.
  - `position`: posicion a la que se ha movido.
- **Funcionamiento:** El cliente actualiza la posicion del usuario en el tablero.

---

### turno-show-cards(username_asking, username_shower, card, character_asked, gun_asked, room_asked):

- **Descripción:** Un usuario ha enseñado una carta a otro jugador.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:**
  - `username_asking`: nombre del usuario que ha pedido la carta.
  - `username_shower`: nombre del usuario que ha enseñado la carta.
  - `card`: carta enseñada.
  - `character_asked`: personaje preguntado.
  - `gun_asked`: arma preguntada.
  - `room_asked`: habitacion preguntada.
- **Funcionamiento:** El cliente muestra la carta enseñada si el usuario que recibe el mensaje es el mismo que `username-asking`, si no muestra el dorso de la carta.

---

### turno-select-to-show(username_asking, username_shower, character, gun, room):

- **Descripción:** Un usuario debe seleccionar una carta para enseñar a otro jugador.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:**
  - `username_asking`: nombre del usuario que ha pedido la carta.
  - `username_shower`: nombre del usuario que debe enseñar la carta.
  - `character`: personaje preguntado.
  - `gun`: arma preguntada.
  - `room`: habitacion preguntada.
- **Funcionamiento:** El cliente muestra las cartas del usuario que debe enseñar y le permite seleccionar una.
- **Se responde con:** `turno-card-selected(username_asking, username_shower, card)`

---

### turno-asks-for-response(username_asking, character, gun, room):

- **Descripción:** Un usuario ha realizado una sospecha.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:**
  - `username_asking`: nombre del usuario que ha realizado la sospecha.
  - `character`: personaje preguntado.
  - `gun`: arma preguntada.
  - `room`: habitacion preguntada.
- **Funcionamiento:** El cliente muestra la sospecha realizada y el usuario que ha realizado la sospecha.

---

### game-over(username_asking, win):

- **Descripción:** Un usuario ha acabado la partida. Win indica si ha ganado o perdido.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:**
  - `username_asking`: nombre del usuario que ha acabado la partida.
  - `win`: true si ha ganado, false si ha perdido.
- **Funcionamiento:** El cliente muestra un mensaje indicando si el usuario ha ganado o perdido.

---

### close-connection():

- **Descripción:** Se ha cerrado la sesion, al iniciar sesion en otro dispositivo.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:** No recibe datos.
- **Funcionamiento:** El cliente muestra un mensaje indicando que un usuario ha cerrado la conexion.

---

### cards([cards]):

- **Descripción:** Un usuario recibe que cartas tendrá en la partida.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:**
  - `cards`: lista de cartas que tendrá el usuario.
- **Funcionamiento:** El cliente crea el modal que muestra las cartas que tendrá el usuario en la partida.

---

### game-info(names, available, guns, rooms, cards, sospechas, posiciones, turnoOwner):

- **Descripción:** Un usuario recibe la informacion de la partida.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:**
  - `names`: lista de nombres de personajes.
  - `available`: para cada personaje dice que username lo ha seleccionado ya, cadena vacia si no esta seleccionado aun.
  - `guns`: lista de nombres de armas.
  - `rooms`: lista de nombres de habitaciones.
  - `cards`: lista de cartas que tendrá el usuario. [puede ser null]
  - `sospechas`: lista de sospechas realizadas. [puede ser null]
  - `posiciones`: lista de posiciones de los usuarios en el tablero. [puede ser null]
  - `turnoOwner`: nombre del usuario al que le toca el turno. [puede ser null]
- **Funcionamiento:** El cliente actualiza la informacion de la partida y muestra los cambios.

### start-game-response(names, available, guns, rooms):

- **Descripción:** Ha comenzado la partida.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:**
  - `names`: lista de nombres de personajes.
  - `available`: para cada personaje dice que username lo ha seleccionado ya, cadena vacia si no esta seleccionado aun.
  - `guns`: lista de nombres de armas.
  - `rooms`: lista de nombres de habitaciones.
- **Funcionamiento:** El cliente actualiza la informacion de la partida y muestra los cambios.

---

### game-paused-response():

- **Descripción:** La partida ha sido pausada por algun usuario.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:** No recibe datos.
- **Funcionamiento:** El cliente muestra un mensaje indicando que la partida ha sido pausada.

---

### game-resumed-response():

- **Descripción:** La partida ha sido reanudada por algun usuario.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:** No recibe datos.
- **Funcionamiento:** El cliente muestra un mensaje indicando que la partida ha sido reanudada.

---

### request-sospechas():

- **Descripción:** Se solicita la informacion de las sospechas actuales de un usuario.
- **Emitido por:** Servidor.
- **Recibido por:** Cliente.
- **Datos:** No recibe datos.
- **Funcionamiento:** El cliente envia automaticamente la informacion de las sospechas actuales.
- **Se responde con:** `response-sospechas(sospechas)`
