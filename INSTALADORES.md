# Ordenando mis actividades — empaquetado para Android y Windows

La aplicación original continúa en `index.html`. Este repositorio incorpora una primera preparación para generar instaladores sin reescribir su lógica.

## Generar los paquetes

1. Abrí la pestaña **Actions** del repositorio en GitHub.
2. Elegí **Crear instaladores Android y Windows**.
3. Pulsá **Run workflow** sobre la rama `main`.
4. Esperá que terminen los trabajos **Generar APK Android** y **Generar instalador Windows**.
5. Entrá a la ejecución terminada y descargá los artefactos:
   - `Ordenando-mis-actividades-Android-APK`
   - `Ordenando-mis-actividades-Windows-EXE`

Los artefactos de Actions quedan disponibles durante 30 días. Todavía no son un enlace permanente de descarga para compradores.

## Importante antes de vender

- El APK que genera esta primera etapa es de depuración (`debug`) e instalable para pruebas. Para distribución comercial hay que preparar una compilación de lanzamiento firmada con una clave propia y proteger esa clave como secreto; no subirla al repositorio.
- El instalador Windows se genera con Electron Builder. Para evitar advertencias de SmartScreen más adelante puede ser necesario adquirir y configurar firma de código.
- Los datos actuales se guardan en el almacenamiento local de cada instalación. No se sincronizan automáticamente entre Android, Windows ni navegadores.
- Hacé copias de seguridad de los datos de prueba antes de actualizar la aplicación. No se ha cambiado la lógica de almacenamiento del archivo original.
- Antes de cobrar, probar ambos instaladores en dispositivos limpios y verificar creación/edición/eliminación de tareas, materias, calendario, adjuntos y copias de seguridad.

## Archivos agregados

- `package.json`: dependencias y configuración de Windows.
- `electron-main.cjs`: ventana de escritorio con aislamiento de Node.js.
- `capacitor.config.json`: configuración de la app Android.
- `.github/workflows/crear-instaladores.yml`: compilación automatizada de APK y EXE.

## Siguiente etapa recomendada

1. Ejecutar la compilación y corregir cualquier error real del pipeline.
2. Preparar APK de lanzamiento firmado y EXE de distribución.
3. Crear una página de venta/entrega con enlaces permanentes y pasos simples.
4. Definir cómo se entregará la licencia de pago único. Los instaladores por sí solos no implementan cobro ni control de licencias.
