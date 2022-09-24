# WWW-backend
Sistema de Préstamo en Biblioteca Municipal. Se utiliza NodeJS, GraphQL y Apollo Server

## Pasos previos
1. Instalar dependencias
2. Cambiar credenciales de MongoDB en server.js
3. Correr "npm start"
4. Ir a localhost:8090/graphql

## Duración de los prestamos
* Libros en casa: 15 días
* Libros en sala: 5 horas
* Multimedia en casa: 7 días
* Multimedia en sala: 3 horas

## Sanciones
La sanción del usuario en caso de devolución con atraso corresponde a ** el triple de tiempo del que se atrase **

## Libros

### getLibros
Se muestran todos los libros de la biblioteca junto con su información

### getLibro
Se busca un libro por su ID y se muetra la información de dicho libro

### getLibrosCatalogo
Se busca un libro filtrando segun los siguiente parametros, cada uno es opcional y aceptan información incompleta (nombre incompleto de titulo, autor, etc):
* Título
* Autor
* Categoría
Este retorna parte de la información del libro y además retorna cuantos ejemplares hay disponibles y cuantos hay en sala.

### addLibro
Se agrega un libro con los siguientes parámetros:
* Título
* Autor
* Editorial
* Año
* Edición
* Categoría
* Tipo
* Subtipo

### updateLibro
Se busca un libro por su ID y se actualiza su información. Se puede actualizar cualquier campo incluido en addLibro.

### deleteLibro
Se busca un libro por su ID y se elimina.


## Ejemplares

### addEjemplar
Agrega un ejemplar con los siguientes parámetros, donde por defecto su estado sera Disponible:
* Ubicación: Ubicación dentro de la biblioteca, por ejemplo, estanteria A1.
* Libro: ID del libro al cual corresponde el ejemplar.

### updateEjemplar
Se actualiza un ejemplar con el siguiente parámetro opcional
* Ubicación
Se hace la observación de que el estado de un ejemplar se actualiza solo cuando se crea o se libera un prestamo.

### deleteEjemplar
Elimina un ejemplar por su ID. Se elimina la referencia de este ejemplar dentro de Libro.

### getEjemplar
Se obtiene un ejemplar por su ID.

### getEjemplares
Se obtienen todos los ejemplares.

## Solicitudes

### getSolicitudes
Se muestran todas las solicitudes de libros hechas junto con su información.

### getSolicitud
Se busca una solicitud por su ID y se muetra la información de esta.

### getSolicitudEstado
Se buscan solicitudes de acuerdo a su campo de "Estado solicitud" y se muestran en pantalla, esto para saber que solicitudes estan pendientes por gestionar y cuales no (False si es que aun hay que gestionarla y True si es que no)

### addSolicitud
Se agrega una solicitud con los siguientes parámetros:
* Fecha de creación
* Fecha de actualización
* Estado de la solicitud
* ID del libro solicitado
* ID del usuario solicitador
Donde los parametros entregados son solamente los IDs, puesto que las fechas son generadas automaticamente y el estado, cuando es creada la solicitud, es por defecto False.

### updateSolicitud
Se busca una solicitud por su ID y se actualiza su campo de estado, la fecha de actualización se actualiza automaticamente.

### deleteSolicitud
Se busca una solicitud por su ID y se elimina, ademas dicha solicitud tambien se elimina de la lista de solicitudes del usuario y del libro.

## Prestamos

### addPrestamo
Se agrega un préstamo con los siguientes parámetros obligatorios:
* Fecha del préstamo
* Fecha de devolución
* Lugar a donde se lleva el préstamo (Sala de lectura, sala multimedia o casa)
* ID del ejemplar prestado
* ID del usuario al que se le realiza el préstamo
* ID del bibliotecario que gestiona el préstamo
Al agregar un préstamo, se agrega la referencia del préstamo a Usuario y Bibliotecario (como listas de Préstamos), además, se agrega la referencia a Ejemplar y se actualiza el estado del ejemplar con el valor del lugar donde se lleve el préstamo.
  
### updatePrestamo
Actualiza el préstamo con el parámetro:
* Fecha de devolución real (fecha_devol_real)
Al actualizar, se libera el ejemplar eliminando la referencia de Préstamo dentro de Ejemplar, además de actualizar su estado a Disponible, indicando que el ejemplar se encuentra disponible en biblioteca.

### deletePrestamo
Se elimina el préstamo según ID. Se elimina la referencia de Préstamo en Ejemplar, Usuario y Bibliotecario.

### getPrestamos
Se obtiene todos los préstamos

### getPrestamo
Se obtiene el préstamo según su ID

## Usuarios

### addUsuario
Se agrega un usuario con los siguientes parámetros, donde por defecto no se encuentra activo. Todos los campos son obligatorios a excepción de la ruta de foto de perfil y huella digital.
* Rut
* Nombre
* Apellido
* Dirección
* Teléfono
* Correo
* Contraseña
* Ruta de foto de perfil
* Huella digital

### updateUsuario
Actualiza un usuario según los siguientes parámetros opcionales:
* Rut
* Nombre
* Apellido
* Dirección
* Teléfono
* Correo
* Contraseña
* Si el usuario se encuentra activo o no (true o false)
* Ruta de foto de perfil
* Huella digital

### deleteUsuario
Elimina un usuario según su ID. Elimina la referencia del Usuario en Préstamo y Solicitud. No se aconseja su uso, solo en casos extremos. Para dar de baja un usuario, lo ideal es actualizar su estado de activo.

### getUsuario
Obtiene un usuario según su ID.

### getUsuarios
Obtiene todos los usuarios del sistema.

## Bibliotecario
### addBibliotecario
Agrega un bibliotecario al sistema con los siguientes parámetros, donde por defecto el bibliotecario se encuentra activo:
* Rut
* Correo
* Contraseña
* Ruta de foto de perfil

### updateBibliotecario
Actualiza un bibliotecario según los siguientes parámetros opcionales:
* rut: String
* nombre: String
* apellido: String
* correo: String
* contrasenia: String
* foto: String
* activo: Boolean

### deleteBibliotecario
Elimina un bibliotecario por su ID. En caso de tener préstamos asociados, se elimina la referencia de Bibliotecario en Préstamo. No se aconseja su uso, solo en casos extremos. Para dar de baja un bibliotecario, lo ideal es actualizar su estado de activo.

**Arreglar eso de que se guardan prestamos aunque haya error