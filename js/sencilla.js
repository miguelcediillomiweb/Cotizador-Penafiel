/* COTIZACIÓN SENCILLA POR TICKETS.
   Ticket en curso (fecha y hora del teléfono, Total 1, Total 2, observaciones),
   lista de tickets guardados en el teléfono y envío de todos en un solo WhatsApp.
   CLIENTE NUEVO global = suma de Total 1 − suma de Total 2 de todos los tickets. */
(function(){
"use strict";
var CLAVE="cotizador_penafiel_tickets_sencillos",tickets=[],
    dinero=new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"});
var $=function(id){return document.getElementById(id);};
try{tickets=JSON.parse(localStorage.getItem(CLAVE)||"[]");if(!Array.isArray(tickets))tickets=[];}catch(e){tickets=[];}
function guardar(){try{localStorage.setItem(CLAVE,JSON.stringify(tickets));}catch(e){console.warn("No se pudieron guardar los tickets en este dispositivo.",e);}}
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function dos(n){return String(n).padStart(2,"0");}
function fecha(d){return dos(d.getDate())+"/"+dos(d.getMonth()+1)+"/"+d.getFullYear();}
function hora(d){return dos(d.getHours())+":"+dos(d.getMinutes());}
function num(v){var n=parseFloat(v);return isFinite(n)?n:0;}
function usa(a,b){return String(a==null?"":a).trim()!==""||String(b==null?"":b).trim()!=="";}
function resta(a,b){return Math.round((num(a)-num(b))*100)/100;}
function totalClienteNuevo(){return Math.round((tickets.reduce(function(a,t){return a+num(t.total1);},0)-tickets.reduce(function(a,t){return a+num(t.total2);},0))*100)/100;}
function pintarReloj(){var d=new Date();$("simple-fecha").textContent=fecha(d);$("simple-hora").textContent=hora(d);}
function pintarClienteNuevoGlobal(){var el=$("simple-cliente-nuevo-global");if(el)el.textContent=dinero.format(totalClienteNuevo());}
function actualizar(){var c=window.cotizacionActual;$("simple-agregar").disabled=!(c&&c.cajas>0);}
function fotoItems(){
  var c=window.cotizacionActual,mapa={},orden=[];
  Object.keys(c.seleccion).forEach(function(k){var it=window.WhatsAppCotizador.itemSimple(c.seleccion[k]);if(!mapa[it.marca]){mapa[it.marca]=[];orden.push(it.marca);}mapa[it.marca].push(it);});
  var lista=[];orden.forEach(function(m){mapa[m].forEach(function(it){lista.push(it);});});return lista;
}
function agregar(){
  var c=window.cotizacionActual;if(!c||!c.cajas)return;
  var d=new Date();
  tickets.push({fecha:fecha(d),hora:hora(d),items:fotoItems(),cajas:c.cajas,total:c.total,total1:$("simple-total1").value.trim(),total2:$("simple-total2").value.trim(),observaciones:$("simple-observaciones").value.trim(),cliente:$("simple-cliente").value.trim()});
  guardar();limpiarActual(true);pintarLista();
  var l=$("simple-lista");if(l&&l.lastElementChild&&l.lastElementChild.scrollIntoView)l.lastElementChild.scrollIntoView({behavior:"smooth",block:"nearest"});
}
function limpiarActual(sinConfirmar){
  var c=window.cotizacionActual,hay=(c&&c.cajas>0)||usa($("simple-total1").value,$("simple-total2").value)||$("simple-observaciones").value.trim()||$("simple-cliente").value.trim();
  if(!sinConfirmar&&hay&&!confirm("¿Limpiar el ticket en curso? Se borrarán productos, Total 1, Total 2 y observaciones."))return;
  $("simple-total1").value="";$("simple-total2").value="";$("simple-observaciones").value="";$("simple-cliente").value="";
  if(window.Cotizador&&window.Cotizador.limpiar)window.Cotizador.limpiar();
  pintarReloj();
}
function htmlTicket(t,i){
  var filas=t.items.map(function(p){return '<div class="simple-item-fila"><span><b>'+esc(p.marca)+'</b> · '+esc(p.descripcion)+(p.piezas?' · '+esc(p.piezas)+' por caja':'')+'<small>Cajas: '+p.cajas+'</small></span><strong>'+dinero.format(p.importe)+'</strong></div>';}).join("");
  return '<article class="simple-item"><header class="simple-item-cab"><strong>Ticket '+(i+1)+'</strong><span>'+esc(t.fecha)+' · '+esc(t.hora)+'</span></header>'+filas+
  '<div class="simple-item-total"><span>Total a pagar ('+t.cajas+' cajas)</span><strong>'+dinero.format(t.total)+'</strong></div>'+(t.cliente?'<div class="simple-cliente-ticket">Cliente: '+esc(t.cliente)+'</div>':'')+
  '<div class="simple-privados"><label>Total 1<input type="number" inputmode="decimal" step="0.01" placeholder="0.00" value="'+esc(t.total1)+'" data-t1="'+i+'"></label><label>Total 2<input type="number" inputmode="decimal" step="0.01" placeholder="0.00" value="'+esc(t.total2)+'" data-t2="'+i+'"></label></div>'+
  '<label class="simple-observaciones">Observaciones<textarea rows="2" data-obs="'+i+'" placeholder="Observaciones de este ticket">'+esc(t.observaciones)+'</textarea></label>'+
  '<button type="button" class="ticket-borrar-simple" data-borrar="'+i+'">Borrar ticket</button></article>';
}
function pintarResumenLista(){
  $("simple-cantidad").textContent=tickets.length+" ticket"+(tickets.length===1?"":"s");
  pintarClienteNuevoGlobal();
  $("simple-enviar-todos").disabled=!tickets.length;$("simple-reiniciar-todo").disabled=!tickets.length;
}
function pintarLista(){
  $("simple-lista").innerHTML=tickets.length?tickets.map(htmlTicket).join(""):'<p class="muted">Todavía no has agregado tickets.</p>';
  pintarResumenLista();
}
function alEscribir(e){
  var el=e.target,a=el.getAttribute("data-t1"),b=el.getAttribute("data-t2"),o=el.getAttribute("data-obs");
  if(o!==null){tickets[Number(o)].observaciones=el.value;guardar();return;}
  if(a===null&&b===null)return;
  var i=Number(a!==null?a:b);tickets[i][a!==null?"total1":"total2"]=el.value.trim();guardar();
  pintarResumenLista();
}
function alPulsar(e){
  var b=e.target.closest?e.target.closest("[data-borrar]"):null;if(!b)return;
  var i=Number(b.getAttribute("data-borrar"));if(!confirm("¿Borrar el ticket "+(i+1)+"?"))return;
  tickets.splice(i,1);guardar();pintarLista();
}
function enviar(){
  if(!tickets.length)return;
  var lista=tickets.map(function(t){return{fecha:t.fecha,hora:t.hora,items:t.items,cajas:t.cajas,total:t.total,observaciones:String(t.observaciones||"").trim()};});
  window.WhatsAppCotizador.enviarTickets(lista,totalClienteNuevo());
}
function reiniciarTodo(){
  if(!tickets.length)return;
  if(!confirm("¿Borrar todos los tickets de la lista? No se puede deshacer."))return;
  tickets=[];guardar();pintarLista();
}
$("simple-agregar").addEventListener("click",agregar);
$("simple-limpiar").addEventListener("click",function(){limpiarActual(false);});
$("simple-lista").addEventListener("input",alEscribir);
$("simple-lista").addEventListener("click",alPulsar);
$("simple-enviar-todos").addEventListener("click",enviar);
$("simple-reiniciar-todo").addEventListener("click",reiniciarTodo);
document.addEventListener("visibilitychange",function(){if(!document.hidden)pintarReloj();});
window.addEventListener("focus",pintarReloj);
setInterval(pintarReloj,15000);
pintarReloj();pintarLista();
function datos(){
  var d=new Date();
  return {fecha:fecha(d),hora:hora(d),cliente:$("simple-cliente").value.trim(),observaciones:$("simple-observaciones").value.trim()};
}
window.TicketSencillo={actualizar:actualizar,agregar:agregar,enviar:enviar,datos:datos};
})();