// if (typeof module.exports !== 'undefined' && module.exports) {
//     var ns = require('../util/ns.js')
//     console.log(JSON.stringify(Infologitech))
// }
// ns('Infologitech.sm.main')

var Infologitech = { 'sm': { 'main': {} } }

Infologitech.sm.main.GenerateNSObject = function () {
  this.generateNSObject = function (mapConfig, exportRecord) {
    nlapiLogExecution('DEBUG', 'mapConfig', JSON.stringify(mapConfig))
    nlapiLogExecution('DEBUG', 'exportRecord', JSON.stringify(exportRecord))
    if (!mapConfig || !exportRecord) {
      return {}
    }
    var nsRecord = {}
    if (!mapConfig.recType) {
      throw new Error('mapping configuration is missing recordType')
    }
    nsRecord.recType = mapConfig.recType
    nsRecord.bodyFields = {}
    nsRecord.lineFields = {}
    var mappings = mapConfig.mappings

    if (!mappings) {
      throw new Error('no mappings in mapping configuration')
    }

    try {
      updateBodyFields(nsRecord.bodyFields, mappings.bodyLevel.mappings, mappings.bodyLevel.path, exportRecord)
      // console.log(JSON.stringify(nsRecord))
      updateLineFields(nsRecord.lineFields, mappings.sublists, exportRecord)
      customLogic(nsRecord, mappings, exportRecord)
      return nsRecord
      // nlapiLogExecution('DEBUG', 'nsRecord', JSON.stringify(nsRecord))
      // var sr = new One.SaveRecord()
      // sr.saveRecord(nsRecord)
    } catch (e) {
      throw new Error('Exception while mapping: ' + JSON.stringify(e))
    }
  }

  function updateBodyFields(nsBodyFieldsObj, bodyMap, path, exportRecord) {
    for (var i = 0; bodyMap && i < bodyMap.length; i++) {
      var curMap = bodyMap[i]
      var value = One.getValue.getValue(curMap, exportRecord, path, false)
      nsBodyFieldsObj[curMap.nsField] = value
    }
  }

  function updateLineFields(nsSublistFieldsObj, sublistMap, exportRecord) {
    for (var sublistName in sublistMap) {
      if (sublistMap.hasOwnProperty(sublistName)) {
        var sublistPath = sublistMap[sublistName].sublistPath || ''
        // "PurchaseOrderReceiptBatch.POReceipt.POReceiptLines.ReceiptLine"
        var exportSublist = jsonPath(exportRecord, '$.' + sublistPath) || ['']
        exportSublist = exportSublist[0]
        if (!exportSublist || exportSublist.length === 0) {
          throw new Error('sublistPath: [' + sublistPath + '] is not found in exportRecord')
        }
        // Create an entry for the sublist
        nsSublistFieldsObj[sublistName] = []
        var sublistMappings = sublistMap[sublistName].mappings
        for (var i = 0; sublistMappings && i < sublistMappings.length; i++) {
          var curMap = sublistMappings[i]
          var values = One.getValue.getValue(curMap, exportRecord, sublistPath, true)
          for (var j = 0; j < values.length; j++) {
            if (nsSublistFieldsObj[sublistName].length < j + 1) {
              nsSublistFieldsObj[sublistName].push({})
            }
            var v = values[j]
            nsSublistFieldsObj[sublistName][j][curMap.nsField] = v
          }
        }
      }
    }
  }
}

function customLogic(nsRecord, mappings, exportRecord) {
  nlapiLogExecution('DEBUG', 'In custom logic', 'nsRecord.recType: ' + nsRecord.recType)
  try {
    if (nsRecord.recType === 'itemfulfillment') {
      var puLines = nsRecord.lineFields.packageups || []
      if (!puLines || puLines.length === 0) {
        return
      }
      var sublistMap = mappings.sublists
      for (var puLineId in puLines) {
        var puLine = puLines[puLineId]
        var sublistPath = sublistMap['packageups'].sublistPath || ''
        var mid = puLines.length > 1 ? '[' + puLineId + ']' : ''
        sublistPath = sublistPath + mid + '.PackageLines'
        var packageLines = jsonPath(exportRecord, '$.' + sublistPath) || ['']
        packageLines = packageLines[0]
        if (!packageLines || packageLines.length === 0) {
          return
        }
        nlapiLogExecution('DEBUG', 'packageLines', JSON.stringify(packageLines))
        packageLines = packageLines.PackageLine
        if (!Array.isArray(packageLines)) {
          packageLines = [packageLines]
        }
        var pdValue = ''
        for (var i in packageLines) {
          var p = packageLines[i]
          if (pdValue.length > 0) {
            pdValue = pdValue + ', '
          }
          nlapiLogExecution('DEBUG', 'p', JSON.stringify(p))
          // var itemId = getItemId(p, 'PackageProductID')
          var itemId = p.PackageProductID
          pdValue = pdValue + itemId
        }
        puLine['packagedescrups'] = pdValue
      }

      setStatus(nsRecord, mappings, exportRecord)
    }
  } catch (e) {
    nlapiLogExecution('ERROR', 'Exception while searching for item in item fulfillment', e)
  }
}

function setStatus(nsRecord, mappings, exportRecord) {
  if (!nsRecord.bodyFields.internalid) {
    return
  }
  var shipmentLine = exportRecord && exportRecord.ShipmentLines && exportRecord.ShipmentLines.ShipmentLine ? exportRecord.ShipmentLines.ShipmentLine : []
  if (!shipmentLine.length) {
    return
  }
  var r = nlapiLoadRecord(nsRecord.recType, nsRecord.bodyFields.internalid)
  var flag = true
  var exprtLineQuantity = {}
  for (var i in shipmentLine) {
    var sl = shipmentLine[i]
    var ln = sl.ShipmentLineResponseNo
    exprtLineQuantity[ln] = sl.ShippedQuantity || ''
  }
  if (shipmentLine.length !== r.getLineItemCount('item')) {
    throw new Error('Line item count differs between NetSuite fulfillment record and the record coming from FTP')
  }
  for (i = 1; i <= r.getLineItemCount('item'); i++) {
    var quantityOnFulfillment = r.getLineItemValue('item', 'quantity', i)
    if (exprtLineQuantity[i] !== quantityOnFulfillment) {
      flag = false
      break
    }
  }
  // for (var i in shipmentLine) {
  //   var sl = shipmentLine[i]
  //   var ln = sl.ShipmentLineRequestNo
  //   var quantityOnFulfillment = r.getLineItemValue('item', 'quantity', ln)
  //   var incomingQuantity = sl.ShippedQuantity
  //   if (quantityOnFulfillment !== incomingQuantity) {
  //     flag = false
  //     break
  //   }
  // }

  if (flag) {
    nlapiLogExecution('DEBUG', 'All quantities are shipped', 'setting status to \'Shipped\'')
    nsRecord.shipstatus = 'C'
  } else {
    nlapiLogExecution('DEBUG', 'Some quantities are not shipped', 'setting status to \'Packed\'')
    nsRecord.shipstatus = 'B'
  }
}

function getItemId(packageLine, f) {
  var curMap = {
    "type": "search",
    "search": {
      "rType": "item",
      "filters": [{
        "searchField": "nameinternal",
        "operator": "is",
        "externalField": f
      }],
      "column": "internalid"
    },
    "nsField": "item"
  }

  var value = One.getValue.searchWrapper(curMap, packageLine)
  return value || ''
}
function trigger(dataIn) {
  nlapiLogExecution('DEBUG', 'in trigger', JSON.stringify(dataIn))
  var c = new Infologitech.sm.main.GenerateNSObject()
  c.generateNSObject(dataIn.mappings, dataIn.data)
}

// if (typeof module.exports !== 'undefined' && module.exports) {
//   // module.exports = Infologitech.sm.main.GenerateNSObject
//   var jsonPath = require('./jsonpath-0.8')

//   module.exports = customLogic
//   function nlapiLogExecution(one, two, three) {
//     console.log(two + ' : ' + three)
//   }
// }
