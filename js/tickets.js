/* TICKETS DE REPARTO · Ruta T1371 */
(function(){
"use strict";
var RUTA="T1371",VENDEDOR="MIGUEL ANGEL",CLAVE="cotizador_penafiel_consecutivo",CLAVE_TICKETS="cotizador_penafiel_lote_tickets",tickets=[],dinero=new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"});
try{tickets=JSON.parse(localStorage.getItem(CLAVE_TICKETS)||"[]");if(!Array.isArray(tickets))tickets=[];}catch(e){tickets=[];}
var $=function(id){return document.getElementById(id);};
function guardarLote(){try{localStorage.setItem(CLAVE_TICKETS,JSON.stringify(tickets));}catch(e){console.warn("No se pudo guardar el lote de tickets en este dispositivo.",e);}}
function fechaLocal(d){d=d||new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function fechaVisible(s){var p=String(s||"").split("-");return p.length===3?p[2]+"/"+p[1]+"/"+p[0]:s;}
function hora(){return new Intl.DateTimeFormat("es-MX",{hour:"2-digit",minute:"2-digit",hour12:false}).format(new Date());}
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function numeroPedido(fecha){var n=parseInt(localStorage.getItem(CLAVE)||"1001",10);if(!Number.isFinite(n)||n<1001)n=1001;localStorage.setItem(CLAVE,String(n+1));var p=(fecha||fechaLocal()).split("-");return RUTA+p[2]+p[1]+p[0].slice(2)+n;}
function nombreTicket(nombre,presentacion){var s=String(nombre||"")+" "+String(presentacion||"");s=s.replace(/\b(?:ISP|PET|VIDRIO|LATA|ALUMINIO|CAN|BOTELLA)\b/gi," ").replace(/\s{2,}/g," ").trim();return s;}
function seleccionActual(){var c=window.cotizacionActual;if(!c||!c.seleccion)return[];return Object.keys(c.seleccion).map(function(k){var s=c.seleccion[k],p=s.producto;return{marca:p.marca,nombre:nombreTicket(p.nombre,p.presentacion),presentacion:"",cantidad:s.cantidad,precio:p.precio,importe:p.precio*s.cantidad};});}
function agregar(){
 var items=seleccionActual();if(!items.length){alert("Primero selecciona los productos y las cajas del ticket.");return;}
 var fecha=$("ticket-fecha").value||fechaLocal(),total=items.reduce(function(a,p){return a+p.importe;},0),cajas=items.reduce(function(a,p){return a+p.cantidad;},0);
 tickets.push({numero:numeroPedido(fecha),cliente:$("ticket-cliente").value.trim(),vendedor:VENDEDOR,ruta:RUTA,fecha:fecha,hora:hora(),items:items,cajas:cajas,total:total,total1:0,total2:0,observaciones:""});
 guardarLote();
 $("ticket-cliente").value="";$("ticket-fecha").value=fechaLocal();window.Cotizador.limpiar();pintar();
}
function diferenciaCliente(t){return (Number(t.total1)||0)-(Number(t.total2)||0);}
function htmlTicket(t,i){
 var filas=t.items.map(function(p){return '<div class="ticket-linea"><span class="ticket-cantidad">'+p.cantidad+'</span><span class="ticket-producto">'+esc(p.nombre)+(p.presentacion?" · "+esc(p.presentacion):"")+'</span><span class="ticket-precio">'+dinero.format(p.importe)+'</span></div><div class="ticket-unitario">Precio por caja: '+dinero.format(p.precio)+'</div>';}).join("");
 return '<article class="ticket-fisico"><header class="ticket-fisico-cab"><strong>PEÑAFIEL BEBIDAS</strong><span>TICKET · '+(i+1)+'</span></header><div class="ticket-meta"><div><span>Cliente</span><strong>'+(esc(t.cliente)||"________________")+'</strong></div><div><span>Número de pedido</span><strong>'+esc(t.numero)+'</strong></div><div><span>Fecha</span><strong>'+fechaVisible(t.fecha)+'</strong></div><div><span>Hora</span><strong>'+esc(t.hora)+'</strong></div></div><div class="ticket-tabla"><div class="ticket-encabezado-linea"><span>Cant.</span><span>Producto</span><span>Importe</span></div>'+filas+'</div><div class="ticket-suma"><span>Total de cajas</span><strong>'+t.cajas+'</strong></div><div class="ticket-suma ticket-total"><span>TOTAL A PAGAR</span><strong>'+dinero.format(t.total)+'</strong></div><div class="ticket-control-privado"><div class="ticket-totales-privados"><label>Total 1<input type="number" inputmode="decimal" step="0.01" min="0" value="'+(Number(t.total1)||0)+'" data-total1="'+i+'"></label><label>Total 2<input type="number" inputmode="decimal" step="0.01" min="0" value="'+(Number(t.total2)||0)+'" data-total2="'+i+'"></label></div><div class="ticket-nota-cliente">Nota cliente nuevo: <strong data-diferencia="'+i+'">'+dinero.format(diferenciaCliente(t))+'</strong></div></div><footer class="ticket-firmas"><span>Cliente · Conforme</span></footer><button type="button" class="ticket-borrar" data-borrar="'+i+'">Borrar este ticket</button></article>';
}
function pintar(){
 var lista=$("tickets-lista");lista.innerHTML=tickets.length?tickets.map(htmlTicket).join(""):'<p class="muted">Todavía no has agregado tickets. Selecciona productos arriba y prepara el primero.</p>';
 $("tickets-cantidad").textContent=tickets.length+" ticket"+(tickets.length===1?"":"s");
 $("tickets-total").textContent=dinero.format(tickets.reduce(function(a,t){return a+t.total;},0));
 $("tickets-enviar").disabled=!tickets.length;$("tickets-reiniciar").disabled=!tickets.length;
 Array.prototype.forEach.call(lista.querySelectorAll("[data-observaciones]"),function(input){input.addEventListener("input",function(){var indice=Number(input.getAttribute("data-observaciones"));tickets[indice].observaciones=input.value;guardarLote();});});
 Array.prototype.forEach.call(lista.querySelectorAll("[data-total1],[data-total2]"),function(input){input.addEventListener("input",function(){var a=input.getAttribute("data-total1"),indice=Number(a!==null?a:input.getAttribute("data-total2")),campo=a!==null?"total1":"total2",valor=Number(input.value);tickets[indice][campo]=Number.isFinite(valor)?valor:0;guardarLote();var salida=lista.querySelector("[data-diferencia=\""+indice+"\"]");if(salida)salida.textContent=dinero.format(diferenciaCliente(tickets[indice]));});});
 Array.prototype.forEach.call(lista.querySelectorAll("[data-borrar]"),function(b){b.addEventListener("click",function(){tickets.splice(Number(b.getAttribute("data-borrar")),1);guardarLote();pintar();});});
}
function textoWhatsApp(){
 var lineas=["🧾 *TICKETS*",""];
 tickets.forEach(function(t,i){
  lineas.push("━━━━━━━━━━━━━━━━━━","🧾 *TICKET "+(i+1)+"*","Cliente: "+(t.cliente||"________________"),"Pedido: "+t.numero,"Fecha: "+fechaVisible(t.fecha)+" · Hora: "+t.hora,"","*Cantidad | Producto | Precio | Importe*");
  t.items.forEach(function(p){lineas.push(p.cantidad+" caja(s) | "+p.nombre+(p.presentacion?" "+p.presentacion:"")+" | "+dinero.format(p.precio)+" | "+dinero.format(p.importe));});
  lineas.push("Total de cajas: "+t.cajas,"*TOTAL: "+dinero.format(t.total)+"*","*CLIENTE NUEVO: "+dinero.format(diferenciaCliente(t))+"*");
  if(String(t.observaciones||"").trim())lineas.push("Observaciones: "+String(t.observaciones).trim());
  lineas.push("");
 });
 lineas.push("━━━━━━━━━━━━━━━━━━","*TOTAL GENERAL: "+dinero.format(tickets.reduce(function(a,t){return a+t.total;},0))+"*");
 return lineas.join("\n");
}
function enviar(){if(!tickets.length)return;var url="https://wa.me/"+window.COTIZADOR_CONFIG.whatsapp+"?text="+encodeURIComponent(textoWhatsApp());window.open(url,"_blank","noopener");}
function reiniciar(){if(!tickets.length)return;if(!confirm("¿Borrar todos los tickets preparados? El consecutivo no se reiniciará para evitar repetir números."))return;tickets=[];guardarLote();pintar();}
$("ticket-fecha").value=fechaLocal();$("guardar-ticket").addEventListener("click",agregar);$("tickets-enviar").addEventListener("click",enviar);$("tickets-reiniciar").addEventListener("click",reiniciar);pintar();
window.TicketsReparto={agregar:agregar,enviar:enviar};
})();