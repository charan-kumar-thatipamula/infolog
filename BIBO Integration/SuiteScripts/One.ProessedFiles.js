// var http = require('http')
// var One = {}
One.ProcessedFiles = function () {
  this.handleProcessedFiles = function (sourcePath, destinationPath, scriptPath, fList) {
    // for (var i in fList) {
    // var fn = fList[i]
    try {
      // var fp = source + '/' + fn
      var fl = []
      for (var f in fList) {
        if (fList.hasOwnProperty(f)) {
          if (fList[f] && fList[f].length) {
            if (f.indexOf('InventoryAdj') !== -1 || f.indexOf('ShipConfirm') !== -1) {
              for (var i in fList[f]) {
                if (fList[f][i] !== 'NOT_PROCESSED_SUCCESSFULLY') {
                  fl.push(f)
                  break
                }
              }
            } else {
              var flag = true
              for (var i in fList[f]) {
                if (fList[f][i] === 'NOT_PROCESSED_SUCCESSFULLY') {
                  flag = false
                  break
                }
              }
              if (flag) {
                fl.push(f)
              }
            }
            // fl.push(f)
          }
        }
      }
      nlapiLogExecution('DEBUG', 'Files to be moved to \'Processed\'', JSON.stringify(fl))
      var postData = {
        "sourcePath": sourcePath,
        "destinationPath": destinationPath,
        "method": "moveFiles",
        "fList": fl
      }
      // http.post(scriptPath, postData).then(function (res) {
      //   console.log(res.getBody())
      // })
      for (var i in fl) {
        // var res = nlapiRequestURL(scriptPath, postData, null, null, 'POST')
        postData.fList = [fl[i]]
        var res = nlapiRequestURL(scriptPath, postData, null, null, 'POST')
        nlapiLogExecution('DEBUG', 'Files moved', res.getBody())
      }
    } catch (e) {
      nlapiLogExecution('ERROR', 'Error moving the files: ', JSON.stringify(e))
    }
    // }
  }
}

// if (typeof module.exports !== 'undefined' && module.exports) {
//    module.exports = One.ProcessedFiles
// }
