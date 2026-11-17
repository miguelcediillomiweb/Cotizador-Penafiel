/* WHATSAPP. Convierte el resumen en un mensaje listo para revisar y enviar. */
(function(){
  "use strict";
  function enviar(){
    var c=window.cotizacionActual;
    if(!c||!c.cajas)return;
    var formato=new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"});
    var lineas=["Hola Miguel 👋, quiero cotizar estos productos:",""];
    Object.keys(c.seleccion).forEach(function(k){
      var s=c.seleccion[k],p=s.producto;
      lineas.push("• "+p.nombre+(p.presentacion?" ("+p.presentacion+")":""));
      lineas.push("  "+s.cantidad+" caja(s) × "+formato.format(p.precio)+" = "+formato.format(s.cantidad*p.precio));
    });
    lineas.push("","TOTAL ESTIMADO: "+formato.format(c.total),"","Quedo pendiente, gracias. 😊");
    var url="https://wa.me/"+window.COTIZADOR_CONFIG.whatsapp+"?text="+encodeURIComponent(lineas.join("\n"));
    window.open(url,"_blank","noopener");
  }
  window.WhatsAppCotizador={enviar:enviar};
})();