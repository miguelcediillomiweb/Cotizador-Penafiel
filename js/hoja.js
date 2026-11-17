/* LECTURA DE GOOGLE SHEETS. No contiene diseño ni lógica de cantidades. */
(function () {
  "use strict";
  var C = window.COTIZADOR_CONFIG;
  function url(hoja) {
    return "https://docs.google.com/spreadsheets/d/" + C.sheetId +
      "/gviz/tq?tqx=out:csv&sheet=" + encodeURIComponent(hoja);
  }
  function csv(texto) {
    var filas=[], fila=[], celda="", comillas=false;
    for (var i=0;i<texto.length;i++) {
      var c=texto[i];
      if (comillas) {
        if (c === '"' && texto[i+1] === '"') { celda+='"'; i++; }
        else if (c === '"') comillas=false;
        else celda+=c;
      } else if (c === '"') comillas=true;
      else if (c === ',') { fila.push(celda); celda=""; }
      else if (c === '\n' || c === '\r') {
        if (c==='\r' && texto[i+1]==='\n') i++;
        fila.push(celda); filas.push(fila); fila=[]; celda="";
      } else celda+=c;
    }
    if (celda!=="" || fila.length) { fila.push(celda); filas.push(fila); }
    return filas;
  }
  function leer(hoja) {
    return fetch(url(hoja), {cache:"no-store"}).then(function(r) {
      if (!r.ok) throw new Error("No se pudo consultar la pestaña " + hoja);
      return r.text();
    }).then(function(t) {
      var filas=csv(t);
      if (!filas.length) return [];
      var cab=filas.shift().map(function(x){return x.trim();});
      return filas.filter(function(f){return f.some(function(x){return String(x).trim()!=="";});})
        .map(function(f){var o={}; cab.forEach(function(k,i){o[k]=String(f[i]||"").trim();}); return o;});
    });
  }
  function cargar() {
    return Promise.all([leer(C.hojaMarcas),leer(C.hojaProductos)]).then(function(r){
      if (!r[1].length) throw new Error("La pestaña Productos no contiene filas.");
      return {marcas:r[0],productos:r[1],actualizado:new Date()};
    });
  }
  window.HojaPeñafiel={cargar:cargar};
})();