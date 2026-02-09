/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/log', 'N/record', 'N/search', './utils'], (log, record, search, utils) => {
    const handler = {};

    handler.post = (requestBody) => {
        try {
            log.debug('Request Body', requestBody);

            // Validar el JSON de entrada
            utils.validateJSON(requestBody);

            // Verificar si la orden de venta ya existe
            const existingOrderId = utils.findSalesOrder(requestBody.externalId);

            if (existingOrderId) {
                utils.logAudit(requestBody, 'EXISTS', `La orden de venta con External ID ${requestBody.externalId} ya existe con Internal ID ${existingOrderId}`);
                return { status: 'EXISTS', message: 'La orden de venta ya existe', internalId: existingOrderId };
            }

            // Crear nueva orden de venta
            const salesOrder = record.create({ type: record.Type.SALES_ORDER, isDynamic: true });

            salesOrder.setValue({ fieldId: 'externalid', value: requestBody.externalId });
            salesOrder.setValue({ fieldId: 'entity', value: requestBody.customer.entityId });

            requestBody.lines.forEach((line) => {
                salesOrder.selectNewLine({ sublistId: 'item' });
                salesOrder.setCurrentSublistValue({ sublistId: 'item', fieldId: 'item', value: line.itemId });
                salesOrder.setCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity', value: line.quantity });
                salesOrder.setCurrentSublistValue({ sublistId: 'item', fieldId: 'rate', value: line.rate });
                salesOrder.commitLine({ sublistId: 'item' });
            });

            const orderId = salesOrder.save();
            utils.logAudit(requestBody, 'CREATED', `Orden de venta creada con Internal ID ${orderId}`);

            return { status: 'OK', message: 'Orden de venta creada exitosamente', internalId: orderId };
        } catch (error) {
            log.error('Error al procesar la orden de venta', error);
            utils.logAudit(requestBody, 'ERROR', `Error al procesar la orden de venta: ${error.message}`);
            return { status: 'ERROR', externalId: requestBody.externalId, message: error.message };
        }
    }

    return handler;

});
