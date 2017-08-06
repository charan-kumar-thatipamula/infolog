function runFlow() {
  var postData = []
  var homePath = '/var/www'
  var filesPath = '/ydg_ns/BIBO_TO_YDG'
  var scriptName = '/dirUtil.php'
  var scriptPath = '/ydg_ns/BIBO_TO_YDG' // '/box_test/YDG_Export_files'
  var uri = 'http://gc.boxinboxout.com'
  var testFileName = ''
  scriptPath = uri + scriptPath + scriptName
  var sourceFolderPath = homePath + filesPath
  var destinationFolderPath = '/ydg_ns/BIBO_TO_YDG/Processed'
  try {
    postData['dirPath'] = homePath + filesPath
    postData['method'] = 'fetchFiles'
    var res = nlapiRequestURL(scriptPath, postData, null, null, 'POST')
    var resBody = res.getBody()
    // nlapiLogExecution('DEBUG', 'resBody', resBody)
    var fileNames = resBody.split('|')
    var processedFiles = {}
    nlapiLogExecution('DEBUG', 'fileNames', JSON.stringify(fileNames))
    for (var i in fileNames) {
      var fileName = fileNames[i]
      if (testFileName && testFileName.length && fileName !== testFileName) {
        continue
      }
      // nlapiLogExecution('DEBUG', 'fileName', fileName)
      if (fileName && fileName.length && fileName.indexOf('.xml') !== -1) {
        try {
          nlapiLogExecution('DEBUG', 'BEGIN', 'Flow starts - Importing file: ' + fileName)
          res = nlapiRequestURL(uri + filesPath + '/' + fileName, null, null, null, 'POST')
          var xmlString = res.getBody()
          xmlString = xmlString.substring(xmlString.indexOf('<'), xmlString.length)
          var xToJS = new X2JS()
          var xmlAsJson = xToJS.xml_str2json(xmlString)
          nlapiLogExecution('DEBUG', 'xml converted to json', JSON.stringify(xmlAsJson))
          var rId = passRecordJson(xmlAsJson, fileName)
          if (rId) {
            processedFiles[fileName] = rId
          }
          nlapiLogExecution('DEBUG', 'END', 'Flow completed. Input fileName: ' + fileName)
        } catch (e) {
          nlapiLogExecution('ERROR', 'exception while processing the file: ' + fileName, JSON.stringify(e))
        }
      }
    }
    nlapiLogExecution('DEBUG', 'Imported Files', JSON.stringify(processedFiles))
    var pf = new One.ProcessedFiles()
    pf.handleProcessedFiles(homePath + filesPath, homePath + destinationFolderPath, scriptPath, processedFiles)
  } catch (e) {
    nlapiLogExecution('ERROR', 'e', JSON.stringify(e))
  }
}


function passRecordJson(recordsJson, fileName) {
  var c = new Infologitech.sm.main.GenerateNSObject()
  var mappings
  if (fileName.indexOf('ShipConfirm') === 0) {
    mappings = shipmentMappings
  } else if (fileName.indexOf('InventoryAdj') === 0) {
    mappings = inventoryAdjustmentMappings
  } else if (fileName.indexOf('POReceipt') === 0) {
    mappings = poRecieptMappings
  }

  recordsJson = jsonPath(recordsJson, '$.' + mappings.recordsPath) || ['']
  recordsJson = recordsJson[0]
  if (!Array.isArray(recordsJson)) {
    recordsJson = [recordsJson]
  }
  nlapiLogExecution('DEBUG', 'recordsJson', JSON.stringify(recordsJson))
  if (!recordsJson || recordsJson.length === 0) {
    nlapiLogExecution('ERROR', 'recordsJson is empty', 'Exported data is not complete')
    return ''
  }
  var savedRecords = []
  for (var i = 0; i < recordsJson.length; i++) {
    // nlapiLogExecution('DEBUG', 'recordsJson', recordsJson[i]['AdjustmentReason'])
    if (fileName.indexOf('InventoryAdj') === 0 && recordsJson[i]['AdjustmentReason'] === 'Put-Away') {
      mappings = inventoryTransferMappings
    }
    var nsRecord = c.generateNSObject(mappings, recordsJson[i])
    nlapiLogExecution('DEBUG', 'nsRecord', JSON.stringify(nsRecord))
    if (!nsRecord) {
      nlapiLogExecution('DEBUG', 'mapped object is empty', 'Flow did not complete...')
      return ''
    }
    var sr = new One.SaveRecord()
    var rId = sr.saveRecord(nsRecord)
    if (rId) {
      savedRecords.push(rId)
    } else {
      savedRecords.push('NOT_PROCESSED_SUCCESSFULLY')
    }
  }
  return savedRecords // savedRecords.length === 1 ? savedRecords[0] : savedRecords
}
