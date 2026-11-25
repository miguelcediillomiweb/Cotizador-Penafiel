/* COTIZADOR: productos por marca, controles +/- y totales. */
(function(){
"use strict";var seleccion={},seleccionSencilla={},dinero=new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"});
function precio(v){if(v==null)return null;var n=Number(String(v).replace(/[^0-9.,-]/g,"").replace(/,/g,""));return Number.isFinite(n)?n:null;}
function campo(p,nombres){var claves=Object.keys(p),normal=function(x){return String(x||"").toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,"");};for(var i=0;i<nombres.length;i++){var buscado=normal(nombres[i]);for(var j=0;j<claves.length;j++){if(normal(claves[j])===buscado&&String(p[claves[j]]||"").trim())return String(p[claves[j]]).trim();}}for(var a=0;a<nombres.length;a++){var parte=normal(nombres[a]);for(var b=0;b<claves.length;b++){if(normal(claves[b]).includes(parte)&&String(p[claves[b]]||"").trim())return String(p[claves[b]]).trim();}}return "";}
function piezas(p){return campo(p,["Piezas por caja","Piezas caja","Piezas","Unidades por caja","Unidades caja","Contenido por caja","Pack"]);}
function id(m,p){return [m,p.Producto,p.Presentacion,p.Precio_Caja].join("|");}
function agrupar(datos){var mapa={};datos.marcas.forEach(function(m){var n=(m.Marca||"").trim();if(n)mapa[n]=[];});datos.productos.forEach(function(p){var marca=(p.Marca||"").trim(),producto=(p.Producto||"").trim(),costo=precio(p.Precio_Caja);if(!marca||!producto||costo===null||costo<0)return;if(!mapa[marca])mapa[marca]=[];mapa[marca].push({key:id(marca,p),marca:marca,nombre:producto,sabor:campo(p,["Sabor","Sabor del producto","Variedad"]),piezasCaja:piezas(p),presentacion:campo(p,["Presentacion","Tamaño","Tamano","Contenido","Mililitros","Medida","Volumen"]),precio:costo});});return Object.keys(mapa).map(function(m){return{nombre:m,productos:mapa[m]};}).filter(function(m){return m.productos.length;});}
function cambiar(key,delta,tipo){var bolsa=tipo==="sencilla"?seleccionSencilla:seleccion,actual=bolsa[key]?bolsa[key].cantidad:0,cantidad=Math.max(0,actual+delta);if(!cantidad)delete bolsa[key];else{var producto=null;window.catalogoMarcas.forEach(function(m){m.productos.forEach(function(p){if(p.key===key)producto=p;});});if(producto)bolsa[key]={producto:producto,cantidad:cantidad};}if(tipo==="sencilla")pintarResumenSencilla();else pintarResumen();document.querySelectorAll("[data-cantidad]").forEach(function(el){if(el.getAttribute("data-cantidad")===key)el.textContent=cantidad;});}
function controlCantidad(key,cantidad,tipo){var caja=document.createElement("div");caja.className="cantidad";var menos=document.createElement("button");menos.type="button";menos.textContent="−";menos.setAttribute("aria-label","Quitar una caja");menos.addEventListener("click",function(){cambiar(key,-1,tipo);});var num=document.createElement("b");num.textContent=cantidad;num.setAttribute("data-cantidad",key);var mas=document.createElement("button");mas.type="button";mas.textContent="+";mas.setAttribute("aria-label","Agregar una caja");mas.addEventListener("click",function(){cambiar(key,1,tipo);});caja.append(menos,num,mas);return caja;}
function pintarMarcas(filtro){var raiz=document.getElementById("marcas");raiz.innerHTML="";var termino=(filtro||"").toLocaleLowerCase("es");window.catalogoMarcas.forEach(function(m){var lista=m.productos.filter(function(p){return(m.nombre+" "+p.nombre+" "+p.presentacion).toLocaleLowerCase("es").includes(termino);});if(!lista.length)return;var seccion=document.createElement("section");seccion.className="marca-seccion";var h=document.createElement("h2");h.textContent=m.nombre;seccion.appendChild(h);var grid=document.createElement("div");grid.className="productos";lista.forEach(function(p){var item=document.createElement("article");item.className="producto";var info=document.createElement("div");info.className="producto-info";var nombre=document.createElement("strong");nombre.textContent=p.nombre;info.appendChild(nombre);if(p.presentacion){var pres=document.createElement("small");pres.textContent=p.presentacion;info.appendChild(pres);}var precioEl=document.createElement("span");precioEl.className="precio";precioEl.textContent=dinero.format(p.precio)+" / caja";info.appendChild(precioEl);item.append(info,controlCantidad(p.key,seleccion[p.key]?seleccion[p.key].cantidad:0));grid.appendChild(item);});seccion.appendChild(grid);raiz.appendChild(seccion);});if(!raiz.children.length)raiz.innerHTML='<p class="vacio">No hay coincidencias.</p>';}
function resumenDatos(bolsa){var claves=Object.keys(bolsa),total=0,cajas=0,porMarca={};claves.forEach(function(k){var s=bolsa[k],p=s.producto,subtotal=p.precio*s.cantidad;total+=subtotal;cajas+=s.cantidad;if(!porMarca[p.marca])porMarca[p.marca]={cajas:0,total:0,productos:[]};porMarca[p.marca].cajas+=s.cantidad;porMarca[p.marca].total+=subtotal;porMarca[p.marca].productos.push({key:k,producto:p,cantidad:s.cantidad,subtotal:subtotal});});return{claves:claves,total:total,cajas:cajas,porMarca:porMarca};}
function pintarResumen(){
 var d=resumenDatos(seleccion),caja=document.getElementById("seleccionados"),visible=document.getElementById("completo-seleccionados");caja.innerHTML="";if(visible)visible.innerHTML="";
 Object.keys(d.porMarca).forEach(function(marca){var grupo=document.createElement("section");grupo.className="grupo-resumen";var titulo=document.createElement("h3");titulo.textContent=marca;grupo.appendChild(titulo);d.porMarca[marca].productos.forEach(function(item){var fila=document.createElement("div");fila.className="resumen-fila";var info=document.createElement("div");info.className="resumen-producto";var nombre=document.createElement("strong");nombre.textContent=item.producto.nombre;var detalle=document.createElement("small");detalle.textContent=item.cantidad+" × "+dinero.format(item.producto.precio)+" = "+dinero.format(item.subtotal)+" · "+(item.producto.presentacion||"");info.append(nombre,detalle);fila.append(info,controlCantidad(item.key,item.cantidad,"completo"));grupo.appendChild(fila);});caja.appendChild(grupo);if(visible)visible.appendChild(grupo.cloneNode(true));});
 if(!d.claves.length){caja.innerHTML='<p class="muted">Aún no agregas productos.</p>';if(visible)visible.innerHTML='<p class="muted">Busca y agrega productos para armar el ticket.</p>';}
 document.getElementById("total").textContent=dinero.format(d.total);document.getElementById("cuenta").textContent=d.cajas+" cajas";document.getElementById("enviar").disabled=!d.claves.length;document.getElementById("barra-cajas").textContent=d.cajas+" cajas";document.getElementById("barra-total").textContent=dinero.format(d.total);document.getElementById("barra-pedido").classList.toggle("hay-pedido",d.claves.length>0);
 window.cotizacionActual={seleccion:seleccion,total:d.total,cajas:d.cajas,porMarca:d.porMarca};if(window.TicketsReparto)window.TicketsReparto.actualizar();
}
function pintarResumenSencilla(){
 var d=resumenDatos(seleccionSencilla),raiz=document.getElementById("seleccionados-simple");raiz.innerHTML="";
 Object.keys(d.porMarca).forEach(function(marca){var grupo=document.createElement("section");grupo.className="grupo-resumen";var titulo=document.createElement("h3");titulo.textContent=marca;grupo.appendChild(titulo);d.porMarca[marca].productos.forEach(function(item){var fila=document.createElement("div");fila.className="resumen-fila";var info=document.createElement("div");info.className="resumen-producto";var nombre=document.createElement("strong");nombre.textContent=item.producto.nombre;var detalle=document.createElement("small");detalle.textContent="Cajas: "+item.cantidad+" · "+dinero.format(item.producto.precio)+" por caja · "+dinero.format(item.subtotal)+" · "+item.producto.presentacion;info.append(nombre,detalle);fila.append(info,controlCantidad(item.key,item.cantidad,"sencilla"));grupo.appendChild(fila);});raiz.appendChild(grupo);});
 if(!d.claves.length)raiz.innerHTML='<p class="muted">Aún no agregas productos.</p>';
 document.getElementById("total-simple").textContent=dinero.format(d.total);
 window.cotizacionSencillaActual={seleccion:seleccionSencilla,total:d.total,cajas:d.cajas,porMarca:d.porMarca};
 if(window.TicketSencillo)window.TicketSencillo.actualizar();
}
function buscadoresLocales(){
  ["buscador-simple","buscador-tickets"].forEach(function(idBuscador){
    var raiz=document.getElementById(idBuscador);if(!raiz)return;
    var input=raiz.querySelector("input"),salida=raiz.querySelector(".buscador-local-resultados");
    function render(){
      var q=input.value.trim().toLocaleLowerCase("es");salida.innerHTML="";
      if(!q){return;}
      var hallados=[];window.catalogoMarcas.forEach(function(m){m.productos.forEach(function(p){var texto=(m.nombre+" "+p.nombre+" "+p.sabor+" "+p.presentacion).toLocaleLowerCase("es");if(texto.includes(q)&&hallados.length<10)hallados.push(p);});});
      if(!hallados.length){var vacio=document.createElement("p");vacio.className="vacio";vacio.textContent="No se encontraron productos.";salida.appendChild(vacio);return;}
      hallados.forEach(function(p){
        var fila=document.createElement("div");fila.className="buscador-local-item";
        var info=document.createElement("div");info.className="buscador-local-info";
        var nombre=document.createElement("strong");nombre.textContent=p.nombre;
        var detalle=document.createElement("small");detalle.textContent=p.marca+" · "+[p.sabor,p.presentacion].filter(Boolean).join(" · ")+" · "+dinero.format(p.precio)+"/caja";
        info.append(nombre,detalle);
        var boton=document.createElement("button");boton.type="button";boton.textContent="＋ Agregar";var tipo=idBuscador==="buscador-simple"?"sencilla":"completo";boton.addEventListener("click",function(){cambiar(p.key,1,tipo);});
        fila.append(info,boton);salida.appendChild(fila);
      });
    }
    input.addEventListener("input",render);
  });
}
function iniciar(datos){window.catalogoMarcas=agrupar(datos);pintarMarcas("");pintarResumen();buscadoresLocales();}
function limpiar(){Object.keys(seleccion).forEach(function(k){delete seleccion[k];});pintarMarcas(document.getElementById("buscar").value);pintarResumen();}function limpiarSencilla(){Object.keys(seleccionSencilla).forEach(function(k){delete seleccionSencilla[k];});pintarResumenSencilla();}
window.Cotizador={iniciar:iniciar,buscar:pintarMarcas,limpiar:limpiar,limpiarSencilla:limpiarSencilla};
})();