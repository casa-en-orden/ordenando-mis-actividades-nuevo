# Administración sencilla de ventas

## Qué hace
Este Apps Script agrega un menú a tu Google Sheet para preparar la pestaña **Ventas** y registrar una venta con tres datos: comprador, correo y código de licencia.

## Preparación (una sola vez)
1. Abrí tu Google Sheet **ORDENANDO MIS ACTIVIDADES**.
2. Entrá en **Extensiones → Apps Script**.
3. Reemplazá el contenido de `Código.gs` por el contenido de `Code.gs` de esta carpeta.
4. Guardá el proyecto.
5. Volvé a la hoja y actualizá la página.
6. En el menú nuevo **ORDENANDO MIS ACTIVIDADES**, elegí **Preparar hoja** y autorizá el script.

## Registrar una venta
1. En el menú **ORDENANDO MIS ACTIVIDADES**, elegí **Registrar una venta**.
2. Ingresá nombre, correo y código de licencia.
3. La venta aparecerá en la pestaña **Ventas**.

## Importante
- Este script es solo un registro administrativo. No genera códigos ni activa dispositivos.
- Generá primero el código en Supabase con el procedimiento ya probado y luego registralo aquí.
- Android y Windows se activan al ingresar el mismo código en cada plataforma; Supabase controla el límite de un dispositivo por plataforma.
- No pegues claves secretas de Supabase en este archivo ni en la hoja.
- La hoja contiene datos de compradores: mantenela privada y no compartas el acceso con clientes.
