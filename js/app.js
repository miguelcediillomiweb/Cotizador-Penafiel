/* ARRANQUE. Une los módulos sin mezclar sus responsabilidades. */
(function(){
  "use strict";
  var estado=document.getElementById("estado");
  function cargar(){
    estado.textContent="Consultando Google Sheets…";
    estado.className="estado";
    document.getElementById("recargar").disabled=true;
    window.HojaPeñafiel.cargar().then(function(datos){
      window.Cotizador.iniciar(datos);
      estado.textContent="Productos y precios actualizados · "+datos.actualizado.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"});
      estado.className="estado correcto";
    }).catch(function(error){
      estado.textContent="No se pudo leer la hoja. Verifica que esté compartida para lectura mediante enlace. "+error.message;
      estado.className="estado error";
    }).finally(function(){document.getElementById("recargar").disabled=false;});
  }
  document.getElementById("recargar").addEventListener("click",cargar);
  document.getElementById("buscar").addEventListener("input",function(e){window.Cotizador.buscar(e.target.value);});
  document.getElementById("enviar").addEventListener("click",window.WhatsAppCotizador.enviar);
  document.getElementById("enviar-simple").addEventListener("click",window.WhatsAppCotizador.enviarSimple);
  document.getElementById("ver-pedido").addEventListener("click",function(){
    document.getElementById("resumen").scrollIntoView({behavior:"smooth",block:"start"});
  });
  cargar();
})();