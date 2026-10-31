# Administración comercial (prueba controlada)

Esta guía corresponde a la rama `comercial-licencias-v1`. No modifica la aplicación ni despliega funciones.

## Precio
En Supabase > Table Editor > `configuracion_ventas`, editar el valor de `precio_ars`. La fila inicial fue creada con 9999. Este valor todavía no se muestra en la aplicación ni procesa pagos.

## Crear una licencia comercial
Hacerlo únicamente desde Supabase > SQL Editor, dentro del proyecto correcto. Ejecutar el bloque siguiente una sola vez por comprador. El código generado aparece en el resultado; copiarlo y enviarlo al comprador por un canal privado. La base guarda únicamente su hash.

```sql
with nueva as (
  select 'OMA-' || upper(encode(extensions.gen_random_bytes(16), 'hex')) as codigo
),
guardada as (
  insert into public.licenses (license_hash, status)
  select encode(extensions.digest(codigo, 'sha256'), 'hex'), 'active'
  from nueva
  returning id
)
select nueva.codigo as clave_para_entregar
from nueva
cross join guardada;
```

Si Supabase indica que no existe el esquema o las funciones `extensions.gen_random_bytes` o `extensions.digest`, detenerse y no probar variantes al azar: verificar primero dónde está instalada la extensión pgcrypto.

## Seguridad y límites actuales
- No incluir claves de servicio ni contraseñas en la app o en GitHub.
- No enviar el hash de licencia al comprador; enviar solo el código generado.
- No ejecutar el bloque dos veces para la misma compra, porque cada ejecución crea otra licencia.
- La activación existente permite un dispositivo por plataforma (web, Android y Windows) por licencia.
- Este procedimiento es manual desde el panel de Supabase. Todavía no existe un panel comercial dentro de la app, cobro automático, comprobante ni envío automático por WhatsApp.
- No publicar ni fusionar esta rama hasta probar la creación de una licencia de prueba y su activación en un dispositivo de prueba.
