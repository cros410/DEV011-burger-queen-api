# Burger Queen - API con Node.js

## Acerca de la API

La Burger Queen API es una aplicación backend diseñada para gestionar pedidos y productos en un restaurant llamdo Burger Queen. Proporcionar una interfaz de programación de aplicaciones (API) que permite a los clientes realizar pedidos y a los empleados administrar los productos y órdenes de manera eficiente.

Además, ofrece endpoints para agregar, ver, actualizar y eliminar productos, así como para realizar y gestionar órdenes de productos.

### Características Pincipales

1. Autenticación de Usuarios: Utiliza tokens JWT para autenticar y autorizar las solicitudes de los usuarios.

2. Gestión de Productos: Permite a los empleados agregar, ver, actualizar y eliminar productos del menú de Burger Queen. C ada producto tiene un nombre, precio y categoría asociada.

3. Gestión de Órdenes: Los usuarios pueden realizar órdenes de productos disponibles en el menú. Los empleados pueden ver, actualizar y eliminar los órdenes existentes.

## Endpoints

La API ofrece varios endpoints para interactuar con los recursos disponibles.
Principales endpoints y sus funciones:

**Usuarios**

`POST/users`: Crea un nuevo usuario en el sistema. Requiere correo electrónico y una contraseña.

`GET/users`: Obtiene la lista de todos los usuarios registrados. Requiere permisos de administrador.

`GET/users/:uid`: Obtiene detalles de un usuario especifíco identificado por su ID único.

`PUT/users/:uid`: Actualiza información de un usuario. Requiere autenticación y el ID del usuario a modificar.

`DELETE/users/:uid`: Elimina un usuario. Requiere autenticación y permisos de adminitrador.

**Productos**

`POST/products`: Agrega un nuevo productos al menú. Requiere autenticación y permisos de administrador.

`GET/products`: Obtiene la lista de los productos disponibles.

`GET/products/:productid`: Obtiene los detalles de un productos identificado por su ID único.

`PUT/products/:productid`: Actualiza la información de un producto. Requiere autenticación y permisos de administrador.

`DELETE/products/:productid`: Elimina un producto. Requiere autenticación y permisos de administrador.

**Órdenes**

`POST/orders`: Crea una nueva orden con los productos seleccionados. Requiere autenticación.

`GET/orders`: Obtiene la lista de las órdenes realizadas.

`GET/orders/:orderid`: Obtiene los detalles de una órden identificada por su ID único.

`PUT/orders/:orderid`: Actualiza el estado de una orden existente. Requiere autenticación.

`DELETE/orders/:orderid`: Elimina una orden. Requiere autenticación y permisos de administrador.

### Códigos de estados

`400 Bad Request`: Indica que la solicitud es incorrecta o no se pudo procesar.

`401 Unauthorized`: Indica que el cliente debe autenticarse para obtener la respuesta deseada.

`403 Forbidden`: Indica que el servidor entiende la solicitud, pero no se cumple o procesa debido a que el cliente no tiene los permisos necesarios.

`404 Not Found`: Se utiliza cuando el servidor no puede encontrar el recurso solicitado.

`500 Internal Server Error`: Indica que se produjo un error en el servidor y no se puedo completar la solicitud.

_Servidor_: Es un programa informático que proporciona recursos, datos, servicios o funcionalidades a otros programas llamados clientes a través de una red.

_Cliente_: Es un programa informático o una aplicación que solicita y consume recursos o servicios proporcionados por un servidor remoto a través de una red.

## Tecnologías Utilizadas

`JavaScript`: Lenguaje de programación ampliamente urilizado tanto en el lado del cliente como el servidor.

`Node.js`: Entorno de ejecución de JavaScript.

`Express.js`: Framework de aplicación web para Node.js.

`MongoDB`: Base de datos NoSQL orientada a documentos para almacenar datos.

`JSON Web Tokens (JWT)`: Estándar abierto para la transmisión segura de información, utilizado para autenticar y autorizar usuarios.

`Bcrypt`: Biblioteca para el hashing de contraseñas, utilizada para cifrar constraseñas almacenadas.

`Postman`: Herramienta utilizada para probar y documentar los endpoints.

`Jest`: Framework de pruebas de JavaScript, utilizado para pruebas unitarias y de integración para el proyecto.
