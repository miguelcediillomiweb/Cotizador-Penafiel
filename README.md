# Cotizador Peñafiel

Cotizador independiente que consulta las pestañas **Marcas** y **Productos** del Google Sheets usado por el catálogo. No modifica el repositorio ni los archivos de la web original.

## Estructura
- `index.html`: estructura de la pantalla.
- `css/estilos.css`: únicamente estilos.
- `js/config.js`: ID de hoja, pestañas y WhatsApp.
- `js/hoja.js`: lectura y análisis CSV de Google Sheets.
- `js/cotizador.js`: agrupación por marca, cantidades y totales.
- `js/whatsapp.js`: armado del mensaje de WhatsApp.
- `js/app.js`: arranque y eventos de pantalla.

## Publicar
En GitHub: Settings → Pages → Deploy from a branch → main → /(root). La web quedará en:
https://miguelcediillomiweb.github.io/Cotizador-Penafiel/

## Importante
La hoja debe permitir lectura pública mediante enlace para que GitHub Pages pueda consultarla directamente. No pongas datos privados en esas pestañas: los precios que el navegador consulta pueden ser vistos por quien tenga acceso al sitio. Los cambios se reflejan al actualizar el cotizador.


## Tickets de reparto
- Sección independiente para crear varios tickets desde la selección actual del catálogo.
- Ruta fija `T1371`, vendedor `MIGUEL ANGEL`, fecha editable y hora local automática.
- Número de pedido consecutivo desde `1001`, guardado en el almacenamiento local del navegador para evitar reutilizar números al borrar tickets.
- Cada ticket conserva productos, cantidad de cajas, precio de Sheets e importe por producto; no incluye códigos, impuestos ni descuentos.
- Permite borrar tickets individuales, reiniciar el lote y preparar todos los tickets en un solo mensaje de WhatsApp.
- El lote de tickets y el consecutivo se conservan en el almacenamiento local del navegador, incluso si se recarga la página. El botón Reiniciar borra el lote, pero no reutiliza consecutivos.

## Cotización sencilla por tickets
- `js/sencilla.js`: ticket en curso (fecha y hora del teléfono, Total 1, Total 2, observaciones), lista de tickets guardados en el teléfono y envío de todos en un solo mensaje de WhatsApp.
- Cada ticket guarda su fecha y hora al agregarlo. En la lista se pueden editar Total 1, Total 2 y observaciones, y borrar el ticket.
- Total cliente nuevo de cada ticket = Total 1 − Total 2. Solo aparece si se usó Total 1 o Total 2.
- WhatsApp: no envía Total 1 ni Total 2; envía el Total cliente nuevo de cada ticket (sin sumarlos) y las observaciones que se escriban.
- Se corrigió la limpieza de acentos en `js/cotizador.js`.
