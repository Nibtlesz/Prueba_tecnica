/**
 * @NApiVersion 2.1
 */
define(['N/search', 'N/record'], (search, record) => {
    const utils = {};

    utils.validateJSON = (json) => {

        if (!json.externalId) {
            throw new Error('Id es requerido');
        }

        if (!json.customer.entityId) {
            throw new Error('Id de cliente es requerido');
        }

        if(!json.lines || json.lines.length === 0) {
            throw new Error('Es necesario agregar al menos una linea a la orden');
        }
    }

    utils.findSalesOrder = (externalId) => {
        const salesOrderSearch = search.create({
            type: search.Type.SALES_ORDER,
            filters: [
                ['externalid', 'is', externalId]
            ],
            columns: ['internalid']
        });

        const result = salesOrderSearch.run().getRange({ start: 0, end: 1 });

        return result.length > 0 ? result[0].getValue('internalid') : false;
    }

    // Función para registrar auditoría en producción
    utils.logAudit = (json, status, message) => {

        let auditRecord = record.create({ type: 'customrecord_audit_log'});
        
        auditRecord.setValue({ fieldId: 'custrecord_audit_external_id', value: json.externalId });
        auditRecord.setValue({ fieldId: 'custrecord_audit_timestamp', value: new Date() });
        auditRecord.setValue({ fieldId: 'custrecord_audit_status', value: status });
        auditRecord.setValue({ fieldId: 'custrecord_audit_message', value: message });
        auditRecord.setValue({ fieldId: 'custrecord_audit_payload_size', value: json.lines.length || 0 });

        auditRecord.save();
    }

    return utils;

});
