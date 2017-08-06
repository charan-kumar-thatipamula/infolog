// var One = {}
One.getValue = (function () {
  return {}
})()

One.getValue.getValue = function (curMap, exportRecord, path, isSublist) {
  if (isSublist) {
    return getSublistValue(curMap, exportRecord, path)
  } else {
    return getBodyValue(curMap, exportRecord, path)
  }
}

One.getValue.searchWrapper = function (curMap, obj) {
  return searchForValue(curMap, obj)
}
function getSublistValue(curMap, exportRecord, sublistPath) {
  var sublists = jsonPath(exportRecord, '$.' + sublistPath) || ['']
  sublists = sublists[0]
  if (!Array.isArray(sublists)) {
    sublists = [sublists]
  }
  var values = []
  for (var i = 0; i < sublists.length; i++) {
    var curSublistExported = sublists[i]
    var v = extractValueBasedOnType(curSublistExported, curMap)
    values.push(v)
    // values.push(curSublistExported[curMap.externalField])
  }
  return values
}

function getBodyValue(curMap, exportRecord, path) {
  var r = jsonPath(exportRecord, '$.' + path) || []
  if (r.length === 0) {
    return ''
  } else {
    r = r[0]
  }

  var v = extractValueBasedOnType(r, curMap)
  return v
}

function extractValueBasedOnType(obj, curMap) {
  var v
  var mapType = curMap.type || ''
  // log('curMap', JSON.stringify(curMap))
  switch (mapType) {
    case 'oneToOne':
      // log('OneToOne', '')
      v = getFieldOneToOne(curMap, obj)
      break
    case 'hardCoded':
      // log('hardCoded', '')
      v = curMap.hardCodedValue
      break
    case 'search':
      v = searchForValue(curMap, obj)
      break
    default:
      // log('default mapping type', '')
      v = obj[curMap.externalField] || ''
      break
  }
  v = (!curMap.isString && parseInt(v)) ? parseInt(v) : v
  return v
}
function getFieldOneToOne(curMap, exportRecord) {
  var valueMapObj = curMap.mapObj || {}
  var exportedValue = exportRecord[curMap.externalField] || ''
  return valueMapObj[exportedValue] || valueMapObj.default || ''
}

function searchForValue(curMap, obj) {
  // {
  //   "type": "search",
  //     "search": {
  //     "rType": "itemfulfillment",
  //       "filters": [{
  //         "searchField": "tranid",
  //         "operator": "is",
  //         "externalField": "ShipmentNumber"
  //       }],
  //       "column": "internalid"
  //   },
  //   "nsField": "internalid"
  // }
  if (!curMap.search) {
    throw new Error('Mapping of type: search should have "search" object')
  }
  var filters = []
  var sObj = curMap.search
  var rType = sObj.rType
  if (!rType) {
    throw new Error('"rType" should be present in "search" object')
  }

  for (var i = 0; i < sObj.filters.length; i++) {
    var filter = sObj.filters[i]
    if (!filter.searchField || !filter.operator || !filter.externalField) {
      throw new Error('"searchField", "operator" and "externalField" are mandatory for search based mapping')
    }
    filters.push(new nlobjSearchFilter(filter.searchField, null, filter.operator, obj[filter.externalField]))
  }

  if (rType === 'itemfulfillment') {
    filters.push(new nlobjSearchFilter('mainline', null, 'is', true))
  }
  if (!curMap.nsField) {
    throw new Error ('nsField is mandatory for search mapping')
  }

  var column = new nlobjSearchColumn(curMap.search.column)

  var result = nlapiSearchRecord(rType, null, filters, column)
  if (!result || !result.length) {
    return ''
  }

  var v = result[0].getValue(curMap.search.column)
  nlapiLogExecution('DEBUG', 'result from search', v)
  return v
}

// if (typeof module.exports !== 'undefined' && module.exports) {
//    module.exports.searchWrapper = One.getValue.searchWrapper
// }
