/* COTIZADOR. Controla selección, cantidades, subtotales y total. */
(function(){
  "use strict";
  var seleccion={};
  var dinero=new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"});
  function precio(v){
    if(v==null) return null;
    var n=Number(String(v).replace(/[^0-9.,-]/g,"").replace(/,/g,""));
    return Number.isFinite(n)?n:null;
  }
  function id(m,p){return [m,p.Producto,p.Presentacion,p.Precio_Caja].join("|");}
  function agrupar(datos){
    var mapa={};
    datos.marcas.forEach(function(m){var n=(m.Marca||"").trim(); if(n) mapa[n]=[];});
    datos.productos.forEach(function(p){
      var marca=(p.Marca||"").trim(), producto=(p.Producto||"").trim(), costo=precio(p.Precio_Caja);
      if(!marca||!producto||costo===null||costo<0) return;
      if(!mapa[marca]) mapa[marca]=[];
      mapa[marca].push({key:id(marca,p),nombre:producto,presentacion:p.Presentacion||"",precio:costo});
    });
    return Object.keys(mapa).map(function(m){return {nombre:m,productos:mapa[m]};}).filter(function(m){return m.productos.length;});
  }
  function cambiar(key,delta){
    var actual=seleccion[key]?seleccion[key].cantidad:0;
    var cantidad=Math.max(0,actual+delta);
    if(!cantidad) delete seleccion[key];
    else {
      var producto=null;
      window.catalogoMarcas.forEach(function(m){m.productos.forEach(function(p){if(p.key===key) producto=p;});});
      if(producto) seleccion[key]={producto:producto,cantidad:cantidad};
    }
    pintarResumen();
    var control=document.querySelector('[data-cantidad="'+CSS.escape(key)+'"]');
    if(control) control.textContent=cantidad;
  }
  function pintarMarcas(filtro){
    var raiz=document.getElementById("marcas"); raiz.innerHTML="";
    var termino=(filtro||"").toLocaleLowerCase("es");
    window.catalogoMarcas.forEach(function(m){
      var lista=m.productos.filter(function(p){return (m.nombre+" "+p.nombre+" "+p.presentacion).toLocaleLowerCase("es").includes(termino);});
      if(!lista.length) return;
      var seccion=document.createElement("section"); seccion.className="marca-seccion";
      var h=document.createElement("h2"); h.textContent=m.nombre; seccion.appendChild(h);
      var grid=document.createElement("div"); grid.className="productos";
      lista.forEach(function(p){
        var item=document.createElement("article"); item.className="producto";
        var info=document.createElement("div"); info.className="producto-info";
        var nombre=document.createElement("strong"); nombre.textContent=p.nombre; info.appendChild(nombre);
        if(p.presentacion){var pres=document.createElement("small");pres.textContent=p.presentacion;info.appendChild(pres);}
        var precioEl=document.createElement("span");precioEl.className="precio";precioEl.textContent=dinero.format(p.precio)+" / caja";info.appendChild(precioEl);
        var acciones=document.createElement("div");acciones.className="cantidad";
        var menos=document.createElement("button");menos.type="button";menos.textContent="−";menos.setAttribute("aria-label","Quitar una caja");menos.addEventListener("click",function(){cambiar(p.key,-1);});
        var num=document.createElement("b");num.setAttribute("data-cantidad",p.key);num.textContent=seleccion[p.key]?seleccion[p.key].cantidad:0;
        var mas=document.createElement("button");mas.type="button";mas.textContent="+";mas.setAttribute("aria-label","Agregar una caja");mas.addEventListener("click",function(){cambiar(p.key,1);});
        acciones.append(menos,num,mas);item.append(info,acciones);grid.appendChild(item);
      });
      seccion.appendChild(grid);raiz.appendChild(seccion);
    });
    if(!raiz.children.length) raiz.innerHTML='<p class="vacio">No hay coincidencias.</p>';
  }
  function pintarResumen(){
    var caja=document.getElementById("seleccionados");caja.innerHTML="";
    var claves=Object.keys(seleccion),total=0,cajas=0;
    claves.forEach(function(k){
      var s=seleccion[k],subtotal=s.producto.precio*s.cantidad;total+=subtotal;cajas+=s.cantidad;
      var fila=document.createElement("div");fila.className="resumen-fila";
      var nombre=document.createElement("span");nombre.textContent=s.producto.nombre+" · "+s.cantidad+" caja(s)";
      var importe=document.createElement("strong");importe.textContent=dinero.format(subtotal);
      fila.append(nombre,importe);caja.appendChild(fila);
    });
    if(!claves.length)caja.innerHTML='<p class="muted">Aún no agregas productos.</p>';
    document.getElementById("total").textContent=dinero.format(total);
    document.getElementById("cuenta").textContent=cajas+" cajas";
    document.getElementById("enviar").disabled=!claves.length;
    window.cotizacionActual={seleccion:seleccion,total:total,cajas:cajas};
  }
  function iniciar(datos){
    window.catalogoMarcas=agrupar(datos);
    pintarMarcas("");
    pintarResumen();
  }
  window.Cotizador={iniciar:iniciar,buscar:pintarMarcas};
})();