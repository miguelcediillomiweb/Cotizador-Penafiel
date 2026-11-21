/* Generador de resultado + QR. No usa productos, marcas ni precios del cotizador. */
(function(){
  "use strict";
  var entrada=document.getElementById("numero-qr");
  var salida=document.getElementById("resultado-qr");
  if(!entrada||!salida)return;
  entrada.addEventListener("input",function(){
    var valor=entrada.value.trim();
    if(valor===""){
      salida.innerHTML='<p class="muted">Escribe un número para generar tu resultado y QR.</p>';
      return;
    }
    var numero=Number(valor);
    if(!Number.isFinite(numero)){
      salida.innerHTML='<p class="muted">Ingresa un número válido.</p>';
      return;
    }
    var resultado=numero+633;
    var texto=String(resultado);
    var url="https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data="+encodeURIComponent(texto);
    salida.innerHTML='<div class="operacion-qr">'+valor+' + 633 =</div><div class="numero-resultado">'+texto+'</div><img alt="Código QR del resultado '+texto+'" src="'+url+'"><div class="qr-etiqueta">Escanea para leer el resultado: '+texto+'</div>';
  });
})();
