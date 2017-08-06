var nsRecord = {
  "recType": "itemfulfillment",
  "bodyFields": {
    "shipstatus": "B",
    "internalid": 41787541
  },
  "lineFields": {
    "packageups": [{
      "packageweightups": ".111",
      "packagetrackingnumberups": "1Z10F4X30300264018_TestValue"
    }
    ]
  }
}

var mappings = {
  "recType": "itemfulfillment",
  "recordsPath": "ShipmentConfirmationBatch.ShipmentConfirmation",
  "mappings": {
    "bodyLevel": {
      "path": "",
      "mappings": [{
        "type": "hardCoded",
        "hardCodedValue": "B",
        "nsField": "shipstatus"
      }, {
        "type": "search",
        "search": {
          "rType": "itemfulfillment",
          "filters": [{
            "searchField": "tranid",
            "operator": "is",
            "externalField": "ShipmentNumber"
          }
          ],
          "column": "internalid"
        },
        "nsField": "internalid"
      }
      ]
    },
    "sublists": {
      "packageups": {
        "sublistPath": "Packages.Package",
        "mappings": [{
          "externalField": "Weight",
          "nsField": "packageweightups"
        }, {
          "externalField": "PackageTrackingNo",
          "nsField": "packagetrackingnumberups",
          "isString": true
        }
        ]
      }
    }
  }
}

var exportRecord = {
  "ShipmentNumber": "714187",
  "OrderNumber": "SO5299338",
  "BIBOShipmentReference": "1897903",
  "ShipMethod": "UPS Ground",
  "ShipDate": "07112017-1515",
  "MasterTrackingNo": "1Z10F4X30300264063",
  "ShipCarrier": "UPS",
  "ShipConfTimestamp": "07112017-1515",
  "ShipmentLines": {
    "ShipmentLine": [{
      "ShipmentLineRequestNo": "1",
      "ShipmentLineResponseNo": "1",
      "ProductID": "Test Item 28062017",
      "WHLocation": "LDC East",
      "LineShipMethod": "UPS Ground",
      "LineCarrier": "UPS",
      "ShippedQuantity": "2"
    }, {
      "ShipmentLineRequestNo": "2",
      "ShipmentLineResponseNo": "2",
      "ProductID": "Test Item 28062017",
      "WHLocation": "LDC East",
      "LineShipMethod": "UPS Ground",
      "LineCarrier": "UPS",
      "ShippedQuantity": "2"
    }
    ]
  },
  "Packages": {
    "Package": {
      "PackageID": "YL-1927004/TDX-1",
      "Weight": ".111",
      "PackageTrackingNo": "1Z10F4X30300264018_TestValue",
      "PackageLines": {
        "PackageLine": [{
          "PackageShipmentLineNo": "1",
          "PackageLineResponseNo": "1",
          "PackageProductID": "Test Item 28062017",
          "PackageLineQty": "1"
        }, {
          "PackageShipmentLineNo": "2",
          "PackageLineResponseNo": "2",
          "PackageProductID": "Test Item 28062017",
          "PackageLineQty": "1"
        }
        ]
      }
    }
  }
}


// var customLogic = require('../Infologitech.sm.main.GenerateNSObject')

// var r = customLogic(nsRecord, mappings, exportRecord)
var files = {
	"InventoryAdj4.xml" : ["41791021", "41791022"],
	"POReceipt1.xml" : [],
	"ShipConfirm0729171920.xml" : [],
	"ShipConfirm1.xml" : [],
	"ShipConfirm2.xml" : []
}

var pf = require('../One.ProessedFiles')
var opf = new pf()
opf.handleProcessedFiles('/var/www/ydg_ns/BIBO_TO_YDG', '/var/www/ydg_ns/BIBO_TO_YDG/Processed', 'http://gc.boxinboxout.com/ydg_ns/BIBO_TO_YDG/dirUtil.php', files)
