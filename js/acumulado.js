/* ACUMULADO DE VENTAS + CONVERTIDOR DE CAJA UNIDAD
   Módulo independiente: no modifica cotizador, tickets ni sus datos. */
(function(){
"use strict";
var KEY="penafiel_acumulado_ventas_v1";
var CU_ML=8520;
var PRESENTACIONES=[{id:"m600",label:"600 ml",ml:600,piezas:12},{id:"m1l",label:"1 litro",ml:1000,piezas:12},{id:"m2l",label:"2 litros",ml:2000,piezas:8}];
var hoy=new Date(), mesActual=hoy.getFullYear()+"-"+String(hoy.getMonth()+1).padStart(2,"0");
var db=leerDB(), mes=mesActual, datos=cargarMes(mes);
function leerDB(){try{return JSON.parse(localStorage.getItem(KEY)||"{}");}catch(e){return {};}}
function guardar(){db[mes]=datos;try{localStorage.setItem(KEY,JSON.stringify(db));}catch(e){}}
function nuevoMes(m){return {days:24,elapsedDays:1,salesQuota:"",cuQuota:"",sales:[],brands:[1,2,3].map(function(n){return {name:"Marca "+n,quota:"",entries:[]};})};}
function cargarMes(m){var x=db[m];if(!x)return nuevoMes(m);x.days=Number(x.days)||24;x.elapsedDays=Math.max(1,Math.min(x.days,Math.floor(Number(x.elapsedDays)||1)));x.sales=x.sales||[];x.brands=x.brands||[];while(x.brands.length<3)x.brands.push({name:"Marca "+(x.brands.length+1),quota:"",entries:[]});x.brands=x.brands.slice(0,3);x.brands.forEach(function(b){b.entries=b.entries||[];});return x;}
function n(v){var x=Number(String(v==null?"":v).replace(",","."));return Number.isFinite(x)?x:0;}
function money(v){return new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:2}).format(v||0);}
function qty(v){return new Intl.NumberFormat("es-MX",{minimumFractionDigits:0,maximumFractionDigits:2}).format(v||0);}
function safe(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function arrGet(a,i){return a[i]||{};}
function cuDia(b,i){var e=arrGet(b.entries,i);return PRESENTACIONES.reduce(function(s,p){return s+n(e[p.id])*p.ml*p.piezas/CU_ML;},0);}
function sumaMarca(b,i){var s=0;for(var j=0;j<=i;j++)s+=cuDia(b,j);return s;}
function sumaCU(i){return datos.brands.reduce(function(s,b){return s+cuDia(b,i);},0);}
function acumCU(i){var s=0;for(var j=0;j<=i;j++)s+=sumaCU(j);return s;}
function ventaDia(i){return n(arrGet(datos.sales,i).value);}
function acumVenta(i){var s=0;for(var j=0;j<=i;j++)s+=ventaDia(j);return s;}
function objetivo(cuota,dia){return n(cuota)/Math.max(1,n(datos.days))*dia;}
function diffClass(v){return v>=-0.000001?"av-pos":"av-neg";}
function diffText(v,esDinero){return (v>=0?"+":"−")+(esDinero?money(Math.abs(v)):qty(Math.abs(v)));}
function styles(){if(document.getElementById("av-estilos"))return;var l=document.createElement("link");l.id="av-estilos";l.rel="stylesheet";l.href="css/acumulado.css?v=20261124-1";document.head.appendChild(l);}
function render(){
var main=document.querySelector("main.contenedor")||document.querySelector("main");if(!main)return;
var sec=document.getElementById("acumulado-ventas");if(!sec){sec=document.createElement("section");sec.id="acumulado-ventas";sec.className="av-panel";main.appendChild(sec);}
var days=Math.max(1,Math.min(31,Math.floor(n(datos.days)||24)));
var brandConfig=datos.brands.map(function(b,i){return '<div class="av-brand-config"><label>Nombre de marca '+(i+1)+'<input data-config="brandName" data-brand="'+i+'" value="'+safe(b.name)+'" placeholder="Ej. Mineral"></label><label>Cuota mensual (CU)<input data-config="brandQuota" data-brand="'+i+'" type="number" min="0" step="0.01" inputmode="decimal" value="'+safe(b.quota)+'" placeholder="Opcional"></label></div>';}).join("");
sec.innerHTML='<div class="av-head"><div><p class="av-kicker">CONTROL COMERCIAL · MÓDULO INDEPENDIENTE</p><h2>Acumulado de ventas</h2><p>Captura tu venta al terminar cada ruta. Los acumulados y las diferencias se calculan solos.</p></div><button type="button" class="av-print" data-action="print">Imprimir</button></div>'+
'<div class="av-config"><label>Mes de trabajo<input type="month" data-config="month" value="'+mes+'"></label><label>Días laborables del mes<input type="number" min="1" max="31" step="1" data-config="days" value="'+days+'"></label><label>Días transcurridos<input type="number" min="1" max="'+days+'" step="1" data-config="elapsedDays" value="'+datos.elapsedDays+'"></label><label>Cuota mensual de venta ($)<input type="number" min="0" step="0.01" inputmode="decimal" data-config="salesQuota" value="'+safe(datos.salesQuota)+'" placeholder="Ej. 100000"></label><label>Cuota mensual total de Caja Unidad (CU)<input type="number" min="0" step="0.01" inputmode="decimal" data-config="cuQuota" value="'+safe(datos.cuQuota)+'" placeholder="Opcional"></label></div>'+
'<div class="av-brand-configs">'+brandConfig+'</div>'+
'<div class="av-note"><strong>Conversión oficial del control:</strong> 1 CU = 8,520 ml (355 ml × 24). 600 ml × 12 = 0.8451 CU; 1 L × 12 = 1.4085 CU; 2 L × 8 = 1.8779 CU. Se calcula con precisión completa y solo se redondea al mostrar.</div>'+
'<div class="av-summary" id="av-summary"></div>'+
'<section class="av-block"><div class="av-block-title"><div><span>01 · VENTA EN PESOS</span><h3>Acumulado de venta diaria</h3></div><small>Cuota proporcional según días laborables</small></div><div class="av-table-wrap"><table class="av-table"><thead><tr><th>Día</th><th>Objetivo acumulado</th><th>Venta del día ($)</th><th>Venta acumulada</th><th>Diferencia</th></tr></thead><tbody>'+Array.from({length:days},function(_,i){return '<tr><td>'+(i+1)+'</td><td data-sales-target="'+i+'">—</td><td><input class="av-entry" type="number" min="0" step="0.01" inputmode="decimal" placeholder="$ del día" data-sales-day="'+i+'" value="'+safe(arrGet(datos.sales,i).value)+'"></td><td data-sales-total="'+i+'">—</td><td data-sales-diff="'+i+'">—</td></tr>';}).join("")+'</tbody></table></div></section>'+
'<section class="av-block"><div class="av-block-title"><div><span>02 · CAJA UNIDAD TOTAL</span><h3>Avance general de CU</h3></div><small>Se suma automáticamente lo capturado en las tres marcas</small></div><div class="av-table-wrap"><table class="av-table"><thead><tr><th>Día</th><th>Objetivo acumulado CU</th><th>CU del día</th><th>CU acumuladas</th><th>Diferencia</th></tr></thead><tbody>'+Array.from({length:days},function(_,i){return '<tr><td>'+(i+1)+'</td><td data-cu-target="'+i+'">—</td><td data-cu-day="'+i+'">—</td><td data-cu-total="'+i+'">—</td><td data-cu-diff="'+i+'">—</td></tr>';}).join("")+'</tbody></table></div></section>'+
datos.brands.map(function(b,bi){return '<section class="av-block av-brand-block"><div class="av-block-title"><div><span>0'+(bi+3)+' · CONVERTIDOR POR MARCA</span><h3>'+safe(b.name||("Marca "+(bi+1)))+'</h3></div><small>Cuota mensual: '+(b.quota!==""?qty(n(b.quota))+" CU":"Sin cuota configurada")+'</small></div><div class="av-conversion-help">Anota cajas físicas vendidas durante el día. El módulo las convierte a CU automáticamente.</div><div class="av-table-wrap"><table class="av-table av-brand-table"><thead><tr><th>Día</th><th>600 ml<br><small>12 pzas/caja</small></th><th>1 litro<br><small>12 pzas/caja</small></th><th>2 litros<br><small>8 pzas/caja</small></th><th>CU del día</th><th>CU acumuladas</th><th>Objetivo acumulado</th><th>Diferencia</th></tr></thead><tbody>'+Array.from({length:days},function(_,i){var e=arrGet(b.entries,i);return '<tr><td>'+(i+1)+'</td>'+PRESENTACIONES.map(function(p){return '<td><input class="av-entry av-boxes" type="number" min="0" step="1" inputmode="numeric" placeholder="0" data-brand-day="'+bi+'" data-day="'+i+'" data-pres="'+p.id+'" value="'+safe(e[p.id])+'"></td>';}).join("")+'<td data-brand-cu="'+bi+'-'+i+'">—</td><td data-brand-total="'+bi+'-'+i+'">—</td><td data-brand-target="'+bi+'-'+i+'">—</td><td data-brand-diff="'+bi+'-'+i+'">—</td></tr>';}).join("")+'</tbody></table></div></section>';}).join("")+
'<div class="av-footer-actions"><button type="button" class="av-reset" data-action="clear">Borrar datos de este mes</button><span>Los datos se guardan automáticamente en este teléfono.</span></div>';
actualizar();
}
function celda(el,text,clase){if(!el)return;el.textContent=text;el.classList.remove("av-pos","av-neg");if(clase)el.classList.add(clase);}
function actualizar(){
var days=Math.max(1,Math.min(31,Math.floor(n(datos.days)||24))),sums={sales:0,cu:0};
for(var i=0;i<days;i++){
var objV=objetivo(datos.salesQuota,i+1),v=acumVenta(i),dv=v-objV;
celda(document.querySelector('[data-sales-target="'+i+'"]'),money(objV));
celda(document.querySelector('[data-sales-total="'+i+'"]'),money(v));
celda(document.querySelector('[data-sales-diff="'+i+'"]'),diffText(dv,true),diffClass(dv));
var cday=sumaCU(i),ctotal=acumCU(i),cobj=objetivo(datos.cuQuota,i+1),cdiff=ctotal-cobj;
celda(document.querySelector('[data-cu-target="'+i+'"]'),qty(cobj)+" CU");
celda(document.querySelector('[data-cu-day="'+i+'"]'),qty(cday)+" CU");
celda(document.querySelector('[data-cu-total="'+i+'"]'),qty(ctotal)+" CU");
celda(document.querySelector('[data-cu-diff="'+i+'"]'),diffText(cdiff,false)+" CU",diffClass(cdiff));
datos.brands.forEach(function(b,bi){var day=cuDia(b,i),total=sumaMarca(b,i),target=objetivo(b.quota,i+1),d=total-target,key=bi+"-"+i;
celda(document.querySelector('[data-brand-cu="'+key+'"]'),qty(day));
celda(document.querySelector('[data-brand-total="'+key+'"]'),qty(total));
celda(document.querySelector('[data-brand-target="'+key+'"]'),qty(target));
celda(document.querySelector('[data-brand-diff="'+key+'"]'),diffText(d,false),diffClass(d));});
sums.sales=v;sums.cu=ctotal;
}
var elapsed=Math.max(1,Math.min(days,Math.floor(n(datos.elapsedDays)||1))),last=elapsed-1,sv=acumVenta(last),sc=objetivo(datos.salesQuota,elapsed),cv=acumCU(last),cc=objetivo(datos.cuQuota,elapsed);
var summary=document.getElementById("av-summary");if(summary)summary.innerHTML='<div><small>VENTA ACUMULADA</small><strong>'+money(sv)+'</strong><em class="'+diffClass(sv-sc)+'">'+diffText(sv-sc,true)+' vs. cuota</em></div><div><small>CAJA UNIDAD ACUMULADA</small><strong>'+qty(cv)+' CU</strong><em class="'+diffClass(cv-cc)+'">'+diffText(cv-cc,false)+' CU vs. cuota</em></div><div><small>CUOTA DIARIA DE VENTA</small><strong>'+money(n(datos.salesQuota)/days)+'</strong><em>Cuota mensual ÷ días laborables</em></div><div><small>CUOTA DIARIA DE CU</small><strong>'+qty(n(datos.cuQuota)/days)+' CU</strong><em>Cuota mensual ÷ días laborables</em></div>';
}
function guardarEntrada(el){
if(el.hasAttribute("data-sales-day")){var i=Number(el.dataset.salesDay);datos.sales[i]=datos.sales[i]||{};datos.sales[i].value=el.value;}
if(el.hasAttribute("data-brand-day")){var bi=Number(el.dataset.brandDay),di=Number(el.dataset.day),p=el.dataset.pres;datos.brands[bi].entries[di]=datos.brands[bi].entries[di]||{};datos.brands[bi].entries[di][p]=el.value;}
guardar();actualizar();
}
function config(el){
var k=el.dataset.config;
if(k==="month"){var m=el.value;if(!m)return;guardar();mes=m;datos=cargarMes(m);render();return;}
if(k==="days"){datos.days=Math.max(1,Math.min(31,Math.floor(n(el.value)||1)));datos.elapsedDays=Math.min(datos.elapsedDays,datos.days);el.value=datos.days;guardar();render();return;}
if(k==="elapsedDays"){datos.elapsedDays=Math.max(1,Math.min(datos.days,Math.floor(n(el.value)||1)));el.value=datos.elapsedDays;guardar();actualizar();return;}
if(k==="salesQuota"||k==="cuQuota"){datos[k]=el.value;guardar();actualizar();return;}
var bi=Number(el.dataset.brand);
if(k==="brandName"){datos.brands[bi].name=el.value;guardar();var title=document.querySelectorAll(".av-brand-block .av-block-title h3")[bi];if(title)title.textContent=el.value||("Marca "+(bi+1));return;}
if(k==="brandQuota"){datos.brands[bi].quota=el.value;guardar();render();return;}
}
function eventos(sec){
sec.addEventListener("input",function(e){var el=e.target;if(el.matches("[data-sales-day],[data-brand-day]"))guardarEntrada(el);});
sec.addEventListener("change",function(e){var el=e.target;if(el.matches("[data-config]"))config(el);});
sec.addEventListener("click",function(e){var b=e.target.closest("[data-action]");if(!b)return;if(b.dataset.action==="print"){window.print();}if(b.dataset.action==="clear"){if(window.confirm("¿Borrar todas las capturas y cuotas de "+mes+"?")){datos=nuevoMes(mes);guardar();render();}}});
}
function iniciar(){styles();render();eventos(document.getElementById("acumulado-ventas"));}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",iniciar);else iniciar();
})();