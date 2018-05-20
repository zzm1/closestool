//index.js
var _Networking = require('../Networking/BindDeviceRequest.js')

let _deviceInfoServiceId  = "0000180A-0000-1000-8000-00805F9B34FB" // 服务

let _firmwareRevisionUUID = "00002A26-0000-1000-8000-00805F9B34FB" // 特征
let _softwareRevisionUUID = "00002A28-0000-1000-8000-00805F9B34FB"

var _productId = ""
var _deviceMac = ""

var RequestHandler = {
    success: function(res){},
    fail: function(res) {},
}

var _TempRequestHandler = null;

module.exports = {
  scanBluetoothDevice: scanBluetoothDevice, // 扫描设备
  createBLEConnection: createBLEConnection, // 连接设备
  bindDevice: bindDevice // 绑定设备
}

// 绑定设备
function bindDevice(RequestHandler) {
  _TempRequestHandler = RequestHandler;
}

// 扫描设备
function scanBluetoothDevice(productId, deviceTypeId, deviceSubtypeId, productName, productIcon, RequestHandler) {
  _productId = productId;

  // 初始化蓝牙设备
    wx.openBluetoothAdapter({
      success: function (res) {
        // 开启蓝牙扫描
        wx.startBluetoothDevicesDiscovery({
          // services: ['FEE7'],
          success: function (res) {
            console.log(res)

            setTimeout(function(){
                // 获取扫描到的设备
                wx.getBluetoothDevices({
                    success: function (res) {
                      console.log(res)
                      var devies = res["devices"];
                      var datas = getHetDevies(devies,deviceTypeId,deviceSubtypeId,productName,productIcon)

                      RequestHandler.success(datas)
                    },
                    fail: function (res) {
                      console.log('失败',res)
                      RequestHandler.fail(res)
                    },
                    complete: function (res) {
                      // 关闭蓝牙扫描
                        wx.stopBluetoothDevicesDiscovery({
                          success: function (res) {
                            console.log('蓝牙扫描,已关闭')
                          }
                        })
                    }
                }) 
            },5000)
            

          }
        })
      }
    })
}

// 获取het设备
function getHetDevies(devies, deviceTypeId, deviceSubtypeId, productName, productIcon,) {
  var tempArray = new Array();
  for (var i = 0; i < devies.length; i++) {
    let dic = devies[i];
    let localName = dic["localName"];

    let arrayBuffer = dic["advertisData"];
    if (arrayBuffer && arrayBuffer.byteLength > 18) {
        let value = ab2hex(dic["advertisData"]);
        // console.log("xxxxx = ",value);

        let dataView = new DataView(arrayBuffer)
        let aValue = dataView.getInt8(6, 1)
        let bValue = dataView.getInt8(7, 1)

        let deviceTypeIdTemp = aValue*256 + bValue;
        let deviceSubtypeTemp = dataView.getInt8(8, 1)
        // console.log('aValue = ',aValue)
        // console.log('bValue = ',bValue)
        // console.log('deviceSubtypeTemp = ',deviceSubtypeTemp)

        if (deviceTypeIdTemp == deviceTypeId &&
            deviceSubtypeTemp == deviceSubtypeId) {

            dic["mac"] = getDeviceMac(value);
            dic["productName"] = productName;
            dic["productIcon"] = productIcon;
            tempArray.push(dic);
        }
    }

    // if (localName && localName.length > 0) {
    //     let tempLocalName = localName.slice(0,4) + localName.slice(localName.length-3);
    //     let tempName = "het-" + deviceTypeId + "-" + deviceSubtypeId;

    //     if (tempLocalName == tempName) {
    //         let value = ab2hex(dic["advertisData"]);

    //       // console.log("mac = ",getDeviceMac(value));


            // dic["mac"] = getDeviceMac(value);
            // dic["productName"] = productName;
            // dic["productIcon"] = productIcon;
            // tempArray.push(dic);
    //     }
    // }
    
  }
  return tempArray;
}

// 连接蓝牙设备
function createBLEConnection(deviceId, mac, RequestHandler) {
    _deviceMac = mac;

    wx.createBLEConnection({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
      deviceId: deviceId,
      success: function (res) {
        console.log('连接成功',res)
        getBLEDeviceServices(deviceId, RequestHandler)
      },
      fail: function (res) {
        console.log('连接失败',res)
        RequestHandler.fail(res)
      }
    })
}

// 获取蓝牙设备所有 service（服务）
function getBLEDeviceServices(deviceId, RequestHandler) {
    wx.getBLEDeviceServices({
      // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
      deviceId: deviceId,
      success: function (res) {
        console.log('device services:', res.services)
        getBLEDeviceCharacteristics(deviceId, RequestHandler)
      },
      fail: function (res) {
        console.log('获取蓝牙服务失败:',res)
        RequestHandler.fail(res)
      }
    })
}

// 获取服务中特征值
function getBLEDeviceCharacteristics(deviceId, RequestHandler) {
      wx.getBLEDeviceCharacteristics({
        deviceId: deviceId,
        serviceId: _deviceInfoServiceId,        
        success: function (res) {
          console.log('device getBLEDeviceCharacteristics:', res.characteristics)
          readBLECharacteristicValue(deviceId, RequestHandler)
        },
        fail: function (res) {
          console.log('获取服务中特征值失败:',res)
          RequestHandler.fail(res)
        }
      })
  }

// 读取特征值
function readBLECharacteristicValue(deviceId, RequestHandler) {
    // firmwareRevisionUUID
    wx.readBLECharacteristicValue({
      deviceId: deviceId,
      serviceId: _deviceInfoServiceId,
      characteristicId: _firmwareRevisionUUID,
      success: function (res) {
        console.log('readBLECharacteristicValue:', res.errCode)
      },
      fail: function (res) {
          console.log('读取特征值失败:',res)
          RequestHandler.fail(res)
      }
    }),

    // softwareRevisionUUID
    // wx.readBLECharacteristicValue({
    //   deviceId: deviceId,
    //   serviceId: _deviceInfoServiceId,
    //   characteristicId: _softwareRevisionUUID,
    //   success: function (res) {
    //     console.log('readBLECharacteristicValue:', res.errCode)
    //   }
    // }),

    wx.onBLECharacteristicValueChange(function(res) {
      var fVersion = 
      console.log('监听低功耗蓝牙设备的特征值变化')
      console.log(`characteristic ${res.characteristicId} has changed, now is ${res.value}`)
      console.log('***************')
      console.log(ab2hex(res.value))
      console.log(hexCharCodeToStr(ab2hex(res.value)))

      let version = hexCharCodeToStr(ab2hex(res.value));
      console.log('version:',version)
      let extVersion = getExtVersion(version);
      let mainVersion = getMainVersion(version);


      console.log(getExtVersion(version))
      console.log(getMainVersion(version))

      console.log('***************')

      if (_firmwareRevisionUUID == res.characteristicId) {
        // 设备绑定
          _Networking.send2Devicebind(_deviceMac, _productId, {
              success: function(res){
                  console.log('成功:',res)
                  let deviceId = res.deviceId;

                  // 设置蓝牙版本信息
                  _Networking.send2SetBleVersion(deviceId, "1", extVersion, mainVersion, {
                      success: function(res){
                          console.log('绑定成功:',res)
                          RequestHandler.success(res)
                          _TempRequestHandler.success(res)
                      },
                      fail: function (res) {
                          console.log('绑定失败:',res)
                          RequestHandler.fail(res)
                      }
                  })
              },
              fail: function (res) {
                  console.log('失败:',res)
                  RequestHandler.fail(res)
              }
          })
      }
    })
}

// 获取 外部版本 1.0.1
function getExtVersion(version) {
    let index = version.length;

    if (isContains(version,"-")) {
        index = version.match("-").index;
    }
    
    let extVersion = version.slice(1,index);

    return extVersion;
}

// 获取 内部版本 101
function getMainVersion(version) {
    let extVersion = getExtVersion(version);
    let mainVersion = extVersion.replace(/\./g,"");
    return mainVersion;
}

// 获取 设备mac
function getDeviceMac(valueStr) {
    return valueStr.slice(valueStr.length-12,valueStr.length);
}

function ab2hex(buffer) {

  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function(bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

// 16进制转字符串
function hexCharCodeToStr(hexCharCodeStr) {
　　var trimedStr = hexCharCodeStr.trim();
　　var rawStr = 
　　trimedStr.substr(0,2).toLowerCase() === "0x"
　　? 
　　trimedStr.substr(2) 
　　: 
　　trimedStr;
　　var len = rawStr.length;
　　if(len % 2 !== 0) {
　　　　alert("Illegal Format ASCII Code!");
　　　　return "";
　　}
　　var curCharCode;
　　var resultStr = [];
　　for(var i = 0; i < len;i = i + 2) {
　　　　curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
　　　　resultStr.push(String.fromCharCode(curCharCode));
　　}
　　return resultStr.join("");
}

// 判断字符串包含
function isContains(str, substr) {
    return str.indexOf(substr) >= 0;
}
