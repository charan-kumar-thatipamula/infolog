var locationMappings = {
  "Annex": 4,
  "Bulk Returns": 13,
  "Display - 2020 L Street": 12,
  "Display - Showroom": 3,
  "Drop Ship": 1,
  "LDC East": 9,
  "LDC East - Receiving": 16,
  "LDC West": 15,
  "Literature": 7,
  "New Jersey": 6,
  "Non-Sell - Inspection": 14,
  "Non-Sell - Showroom": 11,
  "Non-Sell - Warehouse": 10,
  "Open Box": 2,
  "Showroom": 8,
  "WiseCo Inventory": 5
}

var shipmentMappings = {
  "recType": "itemfulfillment",
  "recordsPath": "ShipmentConfirmationBatch.ShipmentConfirmation",
  "mappings": {
    "bodyLevel": {
      "path": "",
      "mappings": [
        {
          "type": "hardCoded",
          "hardCodedValue": "C",
          "nsField": "shipstatus"
        },
        {
          "type": "search",
          "search": {
            "rType": "itemfulfillment",
            "filters": [{
              "searchField": "tranid",
              "operator": "is",
              "externalField": "ShipmentNumber"
            }],
            "column": "internalid"
          },
          "nsField": "internalid"
        }
      ]
    },
    "sublists": {
      "packageups": {
        "sublistPath": "Packages.Package",
        "mappings": [
          {
            "externalField": "PackageWeight",
            "nsField": "packageweightups"
          },
          {
            "externalField": "PackageTrackingNo",
            "nsField": "packagetrackingnumberups",
            "isString": true
          }
        ]
      }
    }
  }
}


var inventoryAdjustmentMappings = {
  "recType": "inventoryadjustment",
  "recordsPath": "InventoryAdjustmentBatch.InventoryAdjustment",
  "mappings": {
    "bodyLevel": {
      "path": "",
      "mappings": [{
        "externalField": "AdjustmentReason",
        "nsField": "memo"
      },
      {
        "type": "hardCoded",
        "nsField": "account",
        "hardCodedValue": "1"
      }
      ]
    },
    "sublists": {
      "inventory": {
        "sublistPath": "",
        "mappings": [{
          "externalField": "InternalProductID",
          "nsField": "item"
        },
        {
          "externalField": "Quantity",
          "nsField": "adjustqtyby"
        }, {
          "externalField": "ToWHLocation",
          "nsField": "location",
          "type": "oneToOne",
          "mapObj": locationMappings
        }
        ]
      }
    }
  }
}

var inventoryTransferMappings = {
  "recType": "inventorytransfer",
  "recordsPath": "InventoryAdjustmentBatch.InventoryAdjustment",
  "mappings": {
    "bodyLevel": {
      "path": "",
      "mappings": [{
        "externalField": "AdjustmentReason",
        "nsField": "memo"
      }, {
        "type": "hardCoded",
        "nsField": "account",
        "hardCodedValue": "1"
      }, {
        "externalField": "FrWHLocation",
        "nsField": "location",
        "type": "oneToOne",
        "mapObj": locationMappings
      }, {
        "externalField": "ToWHLocation",
        "nsField": "transferlocation",
        "type": "oneToOne",
        "mapObj": locationMappings
      }
      ]
    },
    "sublists": {
      "inventory": {
        "sublistPath": "",
        "mappings": [{
          "externalField": "InternalProductID",
          "nsField": "item"
        },
        {
          "externalField": "Quantity",
          "nsField": "adjustqtyby"
        }
        ]
      }
    }
  }
}


var poRecieptMappings = {
  "recType": "itemreceipt",
  "recordsPath": "PurchaseOrderReceiptBatch.POReceipt",
  "mappings": {
    "bodyLevel": {
      "path": "",
      "mappings": [{
        "externalField": "POReceiptNumber",
        "nsField": "custbody_bibo_unique_tran_id"
      }, {
        "externalField": "POShipMethod",
        "nsField": "shipmethod"
      },
      {
        "type": "search",
        "search": {
          "rType": "purchaseorder",
          "filters": [{
            "searchField": "tranid",
            "operator": "is",
            "externalField": "PONumber"
          }],
          "column": "internalid"
        },
        "nsField": "createdfrom"
      }
      ]
    },
    "sublists": {
      "item": {
        "sublistPath": "POReceiptLines.ReceiptLine",
        "mappings": [{
          "externalField": "InternalProductID",
          "nsField": "item"
        }, {
          "externalField": "QuantityReceived",
          "nsField": "quantity",
          "isString": true
        }, {
          "externalField": "WHLocation",
          "nsField": "location",
          "type": "oneToOne",
          "mapObj": locationMappings
        },
        {
          "externalField": "POLineNo",
          "nsField": "line"
        }]
      }
    }
  }
}
