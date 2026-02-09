<h4>Prueba Técnica - Desarrollador Netsuite</h4>

Postulante: Luis Emmanuel García Ostria <br/>
Fecha: Febrero 2026 <br/>

<h4>1. Descripción general</h4>
<p>
    Esta solución implementa un RESTlet en Suitescript 2.1 que permite crear ordenes de venta o muestra un mensaje en caso de que exista en Netsuite a partir de un JSON externo.
    El enfoque principal es demostrar idempotencia, validación de datos, manejo de errores y criterio real para integraciones.
</p>

<h4>2. Alcance</h4>
<p>
    La solución cubre:<br/>
        - RESTlet.
        - Creación de ordenes de venta.
        - Muestra mensaje en caso de existir.
        - Validación de campos obligatorios.
        - Idempotencia basada en externalId.
        - Registro de auditoría.
        - Respuestas en formato JSON.
</p>

<h4>3. Supuestos</h4>
<p>
    - El cliente y los items ya existen en Netsuite.
    - Si existe una orden de venta se muestra un mensaje (esto se puede reemplazar para que haga un update).
    - En un ambiente productivo se utilizará un Custom Record para auditoria; en esta prueba simulamos un registro personalizado.
</p>

<h4>4. Estructura del proyecto</h4>
<p>
    /src
        /FileCabinet
            /SuiteScripts
                /Prueba_tecnica
                    tk_prueba_tecnica.js
                    utils.js
    /README.md
</p>

<h4>5. Endpoint RESTlet</h4>
<p>
    Método: POST.<br/>
    JSON de ejemplo:<br/>
    {
        "externalId": "SO-EXT-100045",
        "customer": { "entityId": "CUST-001" },
        "trandate": "2026-01-27",
        "memo": "Pedido desde ecommerce",
        "lines": [
            { "item": "SKU-001", "quantity": 2, "rate": 10.5 },
            { "item": "SKU-002", "quantity": 1, "rate": 99.0 }
        ]
    }
</p>

<h4>6. Idempotencia</h4>
<p>
    La idempotencia se maneja buscando una órden de venta existente por externalId.<br/>
        - Si no existe, se crea una nueva órden.
        - Si existe, se manda un mensaje de órden existente.<br/>
    Esta decisión permite soportar escenarios reales como: <br/>
        - Reintentos.
        - Correcciones de líneas o precios.
</p>

<h4>7. Validaciones</h4>
<p>
    Se validan los siguientes campos obligatorios:<br/>
        - externalId
        - customer.entityId
        - lines (al menos una línea).<br/>
    Si falta algún campo, el RESTlet responde con:<br/>
    {
        "status": "ERROR",
        "externalId": "SO-EXT-100045",
        "message": "Id es requerido'"
    }
</p>

<h4>8. Manejo de errores</h4>
<p>
    - Uso de try/catch en el script principal
    - Registro de errores con log.error
    - Respuestas consistentes en formato JSON
    - Registro de auditorias incluso en errores
</p>

<h4>9. Registro de auditoria</h4>
<p>
    Por cada request (exitosa o fallida) se registra un log de auditoría con:<br/>
        - externalId
        - timestamp
        - status (OK / ERROR)
        - message resumido
        - payloadSize (número de líneas)<br/>
    En ambiente productivo se recomienda un custom record con los campos anteriormente mencionados.<br/>
    En esta prueba se simuló el registro de auditoria a un custom record fictició, ya que no cuento con una instancia de pruebas.
</p>

<h4>10. Cómo probar</h4>
<p>
    En este caso el SDF no cuenta con un xml de despliegue para el RESTlet y tampoco con el objeto del custom Record para el registro de auditoria.<br/>
    1.- Crear Custom Record para registros de auditoria
    2.- Desplegar el SDF en la instancia.
    3.- Desplegar el RESTlet en Netsuite.
    4.- Publicar el script y obtener la URL del endpoint.
    5.- Desde Postman o un software similar, enviar un POST con el JSON de prueba.
    6.- Validar:
        - Creación de orden.
        - Mensaje de ordenes existentes.
        - Logs de auditoria y errores.
</p>

<h4>11. Nota de performance y operación </h4>
<p>
    1.- ¿Qué harías para escalar 10,000 órdenes al día?
        Separaría la validación del procesamiento pesado. El RESTlet validaría el JSON y registraría los mensajes de auditoría y delegaría la creación y/o actualización de registros a un Map/Reduce.
    
    2.- ¿Dónde pegan limites de governance y cómo los mitigas?
        Los impactos de governance se encuentran en: Búsquedas, carga y/o creación de registros y manejo de multiples lineas. 
        Estos se mitigan: pasando el proceso a un Map/reduce, reducción de record.load y uso eficiente de busquedas paginadas.

    3.- ¿Cuándo usar cada tipo de script?
        Map/reduce: procesos masivos o de alto volumen.
        User Event: validaciones o lógica interna.
        RESTlet: Integración con aplicaciones externas.
</p>

<h4>12. Notas finales </h4>
<p>
    A pesar de no contar con una instancia de pruebas, considero que la solución prioriza claridad, mantenibilidad y operación real sobre complejidad innecesaria. Esta diseñada para evolucionar a escenarios
    de mayor volumen y robustez.
</p>


