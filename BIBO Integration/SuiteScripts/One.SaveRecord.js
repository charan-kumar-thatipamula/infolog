
var One = {}

One.SaveRecord = function () {
  this.saveRecord = function (nsRecord) {
    var recType = nsRecord.recType
    var bodyFields = nsRecord.bodyFields
    var record
    try {
      if (recType === 'itemreceipt') {
        nlapiLogExecution('DEBUG', 'transforming record', recType)
        if (!bodyFields || !bodyFields.createdfrom) {
          throw new Error('Purchase order details are not found')
        }
        record = nlapiTransformRecord('purchaseorder', bodyFields.createdfrom, 'itemreceipt')
      } else if (recType === 'itemfulfillment') { // nsRecord && nsRecord.bodyFields && nsRecord.bodyFields.internalid) {
        if (!bodyFields || !bodyFields.internalid) {
          throw new Error('Item Fulfillment is not found')
        }
        record = nlapiLoadRecord(recType, nsRecord.bodyFields.internalid)
      } else {
        record = nlapiCreateRecord(recType)
      }
      for (var f in bodyFields) {
        if (bodyFields.hasOwnProperty(f)) {
          record.setFieldValue(f, bodyFields[f])
        }
      }

      var sublists = nsRecord.lineFields
      for (var sublistName in sublists) {
        if (sublists.hasOwnProperty(sublistName)) {
          if (recType === 'itemreceipt' && sublistName === 'item') {
            var lineNumbers = {}
            var lines = sublists[sublistName]
            for (var ind = 0; ind < lines.length; ind++) {
              var line = lines[ind]
              lineNumbers[line.line] = ind
            }
            nlapiLogExecution('DEBUG', 'record.getLineItemCount(sublistName)', record.getLineItemCount(sublistName))
            nlapiLogExecution('DEBUG', 'exported lineNumbers', JSON.stringify(lineNumbers))
            for (var j = 1; j <= record.getLineItemCount(sublistName); j++) {
              nlapiLogExecution('DEBUG', 'j and record.getLineItemValue(sublistName, \'line\', j)', j + ' and ' + (!lineNumbers.hasOwnProperty(record.getLineItemValue(sublistName, 'line', j))))
              // if (!lineNumbers.hasOwnProperty(j)) {
              if (!lineNumbers.hasOwnProperty(record.getLineItemValue(sublistName, 'line', j))) {
                nlapiLogExecution('DEBUG', 'unsetting itemreceive value', 'lineNumber: ' + j)
                record.setLineItemValue(sublistName, 'itemreceive', j, 'F')
                nlapiLogExecution('DEBUG', 'unsetting done', 'lineNumber: ' + j)
              } else {
                var line = lines[lineNumbers[record.getLineItemValue(sublistName, 'line', j)]]
                for (var fld in line) {
                  if (line.hasOwnProperty(fld)) {
                    nlapiLogExecution('DEBUG', 'sublistName, fld, line[fld]', sublistName + ':' + fld + ':' + line[fld])
                    record.setLineItemValue(sublistName, fld, j, line[fld])
                  }
                }
              }
            }
          } else {
            var lines = sublists[sublistName]
            for (var ind = 0; ind < lines.length; ind++) {
              var line = lines[ind]
              record.selectNewLineItem(sublistName)
              for (var fld in line) {
                if (line.hasOwnProperty(fld)) {
                  nlapiLogExecution('DEBUG', 'sublistName, fld, line[fld]', sublistName + ':' + fld + ':' + line[fld])
                  record.setCurrentLineItemValue(sublistName, fld, line[fld])
                }
              }
              record.commitLineItem(sublistName)
              // nlapiLogExecution('DEBUG', 'committed line item', '****')
            }
          }
        }
      }
      nlapiLogExecution('DEBUG', 'submitting record', '')
      var recordId = nlapiSubmitRecord(record)
      nlapiLogExecution('DEBUG', 'record saved', recType + ': ' + recordId)
      return recordId
    } catch (e) {
      nlapiLogExecution('ERROR', 'exception before while saving', e)// JSON.stringify(e))
    }
  }
}
