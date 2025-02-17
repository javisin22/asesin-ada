# DEFINICIÓN DE LA API

## 1) Peticiones HTTP

### POST

#### <u>/createAccount:</u>

- **Descripción:** Crea una nueva cuenta de usuario si el nombre de usuario no existe.
- **Body:**
  - username: nombre de usuario.
  - password: contraseña.
- **Respuesta:**
  - success: true si se ha creado la cuenta, false si no se ha podido crear la cuenta.
  - message: mensaje de si ha podido o no crear la cuenta.  


#### <u>/login: </u>

- **Descripción:** Inicia sesión en una cuenta de usuario si el nombre de usuario y la contraseña son correctos.
- **Body:**
  - username: nombre de usuario.
  - password: contraseña.
- **Respuesta:**
  - si exito es true:
    - exito: true, se ha iniciado sesion correctamente.
    - id_partida_actual: id de la partida en la que se encuentra el usuario.
    - tipo_partida: tipo de partida en la que se encuentra el usuario.
    - msg: mensaje de inicio de sesión.
  - si no:
    - exito: false, no se ha iniciado sesion correctamente.
    - msg: mensaje de error.

#### <u>/createGame:</u>

- **Descripción:** Crea una nueva partida.
- **Body:**
  - type: tipo de partida creada 'l' si es una partida local, 'o' si es online.
- **Respuesta:**
  - success: true si se ha creado la partida, false si no se ha podido crear la partida.
  - si exito es true:
    - exito: true, se ha creado la partida correctamente.
    - id_partida: id de la partida creada.
    - asesino: nombre del asesino.
    - arma: nombre del arma.
    - lugar: nombre de la habitación.
  - si no:
    - exito: false, no se ha creado la partida correctamente.
    - msg: mensaje de error.

### GET

#### <u>/obtainXP:</u>

- **Descripción:** Obtiene la experiencia de un usuario.
- **Query**:
  - username: nombre de usuario.
- **Respuesta:**
  - si success es true:
    - success: true si se ha obtenido la experiencia.
    - XP: experiencia del usuario.
  - si no:
    - success: false si no se ha podido obtener la experiencia.
    - message: mensaje explicativo del resultado de la petición.

#### <u>/playerInformation:</u>

- **Descripción:** Obtiene la información de un usuario.
- **Query:**
  - username: Nombre de usuario.
- **Respuesta:**
  - si exito es true:
    - exito: true si existe el usuario y se ha obtenido la información
    - character: personaje seleccionado por el usuario.
    - partida_actual: id de la partida en la que se encuentra el usuario.
    - sospechas: tarejta de sospechas realizadas por el usuario.
    - posicion: posición en la que se encuentra el usuario.
    - estado_player: estado del usuario.
    - partidas_jugadas: número de partidas jugadas por el usuario.
    - partidas_ganadas_local: número de partidas ganadas por el usuario en modo local.
    - partidas_ganadas_online: número de partidas ganadas por el usuario en modo online.
    - estado_partida: estado de la partida en la que se encuentra el usuario.
    - tipo_partida: tipo de partida en la que se encuentra el usuario.
  - si no:
    - exito: false si no existe el usuario.
    - message: mensaje explicativo del resultado de la petición.

#### <u>/getGame:</u>

- **Descripción:** Obtiene la información de una partida.
- **Query:**
  - idGame: id de la partida.
- **Respuesta:**
  - si exito es true:
    - exito: true si se ha obtenido la información de la partida.
    - estado: estado de la partida.
    - fecha_ini: fecha de inicio de la partida.
    - tipo: tipo de la partida.
    - turno: nombre de usuario del jugador que sea su turno
    - areAvailable: lista de nombres de usuarios, donde la posicion 1 corresponde al usuario que ha elegido mr SOPER, posicion 2 corresponde a miss REDES, ... cadena vacia si nadie ha elegido ese personaje
  - si no:
    - exito: false si no se ha podido obtener la información de la partida.
    - msg: mensaje explicativo del resultado de la petición.
  

### PUT

#### <u>/changePassword:</u>

- **Descripción:** Cambia la contraseña de un usuario.
- **Body:**
  - username: nombre de usuario.
  - oldPassword: contraseña actual.
  - newPassword: nueva contraseña.
- **Respuesta:**
  - success: true si se ha cambiado la contraseña, false si no se ha podido cambiar la contraseña (oldPassword erróneo).
  - message: mensaje de si ha podido o no cambiar la contraseña.
