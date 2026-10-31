/**
 * ORDENANDO MIS ACTIVIDADES
 * Administración sencilla de ventas en Google Sheets.
 *
 * Hoja requerida: Ventas
 * Columnas: Fecha | Comprador | Correo_Google | Codigo_Licencia | Android | Windows | Estado
 */

const CONFIG = {
  hoja: "Ventas",
  encabezados: ["Fecha", "Comprador", "Correo_Google", "Codigo_Licencia", "Android", "Windows", "Estado"]
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("ORDENANDO MIS ACTIVIDADES")
    .addItem("Preparar hoja", "prepararHoja")
    .addItem("Registrar una venta", "mostrarFormularioVenta")
    .addToUi();
}

function prepararHoja() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let hoja = ss.getSheetByName(CONFIG.hoja);
  if (!hoja) hoja = ss.insertSheet(CONFIG.hoja);

  hoja.getRange(1, 1, 1, CONFIG.encabezados.length).setValues([CONFIG.encabezados]);
  hoja.setFrozenRows(1);
  hoja.getRange(1, 1, 1, CONFIG.encabezados.length)
    .setFontWeight("bold")
    .setBackground("#dceeff");
  hoja.autoResizeColumns(1, CONFIG.encabezados.length);
  SpreadsheetApp.getUi().alert("Listo. La hoja Ventas está preparada.");
}

function mostrarFormularioVenta() {
  const ui = SpreadsheetApp.getUi();
  const comprador = ui.prompt("Nueva venta", "Nombre del comprador:", ui.ButtonSet.OK_CANCEL);
  if (comprador.getSelectedButton() !== ui.Button.OK) return;

  const correo = ui.prompt("Nueva venta", "Correo de Google del comprador:", ui.ButtonSet.OK_CANCEL);
  if (correo.getSelectedButton() !== ui.Button.OK) return;

  const codigo = ui.prompt("Nueva venta", "Código de licencia ya generado en Supabase:", ui.ButtonSet.OK_CANCEL);
  if (codigo.getSelectedButton() !== ui.Button.OK) return;

  const nombre = comprador.getResponseText().trim();
  const email = correo.getResponseText().trim();
  const licencia = codigo.getResponseText().trim();

  if (!nombre || !email || !licencia) {
    ui.alert("Falta completar algún dato. No se registró la venta.");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    ui.alert("El correo no parece válido. No se registró la venta.");
    return;
  }

  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.hoja);
  if (!hoja) {
    ui.alert('Primero elegí "Preparar hoja" en el menú.');
    return;
  }

  hoja.appendRow([new Date(), nombre, email, licencia, "Pendiente", "Pendiente", "Activa"]);
  ui.alert("Venta registrada. La activación en Android y Windows se controla por separado.");
}
