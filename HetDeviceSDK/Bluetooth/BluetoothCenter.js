var _Utils = require('../Bluetooth/BluetoothUtils.js')
var _BluetoothProtocol = require('../Bluetooth/BluetoothProtocol.js')
var _Encrypt = require('../Bluetooth/BluetoothEncrypt.js')
var _DeviceProtocolRequest = require('../Networking/DeviceProtocolRequest.js')
var _BluetoothConfig = require('../Config/BluetoothConfig.js')

let _deviceId = ''
let _serviceId_FF12 = '0000FF12-0000-1000-8000-00805F9B34FB'
let _characteristicId_FF01 = '0000FF01-0000-1000-8000-00805F9B34FB' // 特征: 写入设备
let characteristicId_FF03 = '0000FF03-0000-1000-8000-00805F9B34FB'

var CompletedHandler = {success: function (res) { },fail: function (res) { },}
var _ConnectCompletion = null
var _sendCompletion = null
let _mac = ''


module.exports = {
  NotiCenter: NotiCenter, // 消息订阅
  init: init, // 初始化
  connect: connect, // 连接设备
  control: control, // 设备控制
  sendData: sendData, // 发送数据
  getData: getData, // 获取数据
  statusReply: statusReply, // 状态数据回复
  write: write, // 写入数据
  // onBluetoothStatus: onBluetoothStatus, // 监听蓝牙数据状态
  getCurrentTimeData: getCurrentTimeData
}

/********************************************************************************************************************************
 *                                                          初始化
 *********************************************************************************************************************************/
function init(productId) {
  // 根据产品ID获取协议列表
  _DeviceProtocolRequest.send2GetProtocolListByProductId(productId, 0, {
    success: function (res) {
      console.log(res)
      _BluetoothConfig.setConfig(res)
    },
    fail: function (res) {
      console.log('请求错误：', res);
    }
  })
}

/********************************************************************************************************************************
 *                                                          连接蓝牙设备
 *********************************************************************************************************************************/
 // 连接设备
function connect(deviceId, mac, CompletedHandler) {
  if (!deviceId || deviceId.length <= 0 ||
    !mac || mac.length <= 0) {
    console.log('参数错误 BluetoothCenter.js 方法:connect')
  }
  _deviceId = deviceId
  _mac = mac
  _sendCompletion = CompletedHandler
  wx.openBluetoothAdapter({
    success: function (res) {
      connect_createBLEConnection(deviceId)
    }
  })
}

// 连接设备 - 连接
function connect_createBLEConnection(deviceId) {
  wx.createBLEConnection({
    deviceId: deviceId, 
    success: function (res) {
      console.log('成功：连接设备 - 连接')
      connect_getBLEDeviceServices(deviceId)
    },
    fail: function(res) {
      console.log('失败：连接设备 - 连接:', res)
    }
  })
}

// 连接设备 - 获取所有服务
function connect_getBLEDeviceServices(deviceId) {
  wx.getBLEDeviceServices({
    deviceId: deviceId,
    success: function (res) {
      console.log('device services:', res.services)
      connect_getBLEDeviceCharacteristics(deviceId)
    }
  })
}

// 连接设备 - 获取服务中特征值
function connect_getBLEDeviceCharacteristics(deviceId) {
  let serviceId = '0000FF12-0000-1000-8000-00805F9B34FB'
  wx.getBLEDeviceCharacteristics({
    deviceId: deviceId,
    serviceId: serviceId,
    success: function (res) {
      // connect_notify(deviceId, serviceId,'0000FF02-0000-1000-8000-00805F9B34FB')
      connect_notify(deviceId, serviceId, characteristicId_FF03)
      connect_onBLECharacteristicValueChange()
    }
  })
}

// 连接设备 - notify
function connect_notify(deviceId, serviceId, characteristicId) {
  wx.notifyBLECharacteristicValueChange({
    state: true, // 启用 notify 功能
    deviceId: deviceId,
    serviceId: serviceId,
    characteristicId: characteristicId,
    success: function (res) {
      console.log('notify success', res.errMsg)
    }
  })
}

// 连接设备 - 监听
function connect_onBLECharacteristicValueChange() {

  wx.onBLECharacteristicValueChange(function (res) {

    if (res.characteristicId == characteristicId_FF03) {

      var receiveBuffer = getData(res.value);
      if (receiveBuffer && receiveBuffer.byteLength > 0) {
        // 接受数据完成
        console.log('Recv:', _Utils.ab2hex(receiveBuffer))
        // 获取命令
        var cmd = _Utils.ab2hex(_BluetoothProtocol.getCommand(receiveBuffer));

        // 认证请求指令
        if (cmd == _BluetoothProtocol.cmd_A020()) {
          // let mac = '00025b000002'
          sendData(_Encrypt.getAuthData(_mac))
        }
        else if (cmd == _BluetoothProtocol.cmd_A041()) {
          var dic = _Encrypt.decodeData(_BluetoothProtocol.cmd_A041(), receiveBuffer)

          // console.log('状态:', dic)
          statusReply() // 状态回复
          // notiSend(dic) // 发送消息
          NotiCenter().trigger('kOnBluetoothStatus', JSON.stringify(dic));
        }
        else if (cmd == _BluetoothProtocol.cmd_A037()){
          // var dic = _Encrypt.decodeData(_BluetoothProtocol.cmd_A037(), receiveBuffer)
          var dic = _Encrypt.decodeData(_BluetoothProtocol.cmd_A041(), receiveBuffer)
          // notiSend(dic) // 发送消息
          NotiCenter().trigger('kOnBluetoothStatus', JSON.stringify(dic));
        }
      }
    }
  })
}

// 监听蓝牙设备状态
// function onBluetoothStatus(key, CompletedHandler) {
//   // 订阅消息
//   notiListen(key, CompletedHandler)

// }

/********************************************************************************************************************************
 *                                                          消息订阅
 *********************************************************************************************************************************/

function NotiCenter() {
   return Noti
 }

var Noti = (function () {
  var list = {},
    listen,
    trigger,
    remove;
  listen = function (key, fn) { //监听事件函数
    if (!list[key]) {
      list[key] = []; //如果事件列表中还没有key值命名空间，创建
    }
    list[key].push(fn); //将回调函数推入对象的“键”对应的“值”回调数组
  };
  trigger = function () { //触发事件函数
    var key = Array.prototype.shift.call(arguments); //第一个参数指定“键”
    var msg = list[key];
    
    if (!msg || msg.length === 0) {
      return false; //如果回调数组不存在或为空则返回false
    }
    for (var i = 0; i < msg.length; i++) {
      msg[i].apply(this, arguments); //循环回调数组执行回调函数
    }
  };
  remove = function (key, fn) { //移除事件函数
    var msg = list[key];
    if (!msg) {
      return false; //事件不存在直接返回false
    }
    if (!fn) {
      delete list[key]; //如果没有后续参数，则删除整个回调数组
    } else {
      for (var i = 0; i < msg.length; i++) {
        if (fn === msg[i]) {
          msg.splice(i, 1); //删除特定回调数组中的回调函数
        }
      }
    }
  };
  return {
    listen: listen,
    trigger: trigger,
    remove: remove
  }
})();

/*
var _notiObj = {} // 定义发布者
_notiObj.dic = [] // 缓存列表

// 订阅
function notiListen(key, fn) {
  let array = _notiObj.dic
  console.log('array === ', array)
  for (var i = 0; i <= array.length; i++) {
    var com = array[i]
   
    if (key === com) {
      console.log('存在')
    } else {
      console.log('不存在')
    }
  }
  
  _notiObj.dic.push(key)

  // _notiObj.dic[key] = Completed
}

// 移除订阅
function notiRemove(key) {
  // let array = _notiObj.dic
  // for (var i = 0; i < array.length; i++) {
  //   let obj = array[i]
  //   if (obj.key == key) {
  //     arr.splice(i, 1)
  //   }
  // }
  let dic = _notiObj.dic
  delete dic[key]
}

// 发送
function notiSend(value) {
  let dic = _notiObj.dic
  for (var key in dic) {
    var completed = dic[key]
    completed.success(value)
  }
}
*/

/********************************************************************************************************************************
 *                                                          设备控制
 *********************************************************************************************************************************/
// 设备控制
function control(sendDic, CompletedHandler) {
  _sendCompletion = CompletedHandler
  
  // body
  var body = _Encrypt.encodeData(_BluetoothProtocol.cmd_0040(), sendDic)

  var realBody = getBody(body)

  // var enRBodyStr = _Encrypt.aesEncrypt(_Utils.ab2hex(realBody)) // 加密
  var enRBodyStr = _Utils.ab2hex(realBody)

  let bodyBuffer = _Utils.HexStr2Buffer(enRBodyStr)
  // head
  var headValue = _BluetoothProtocol.head() + _BluetoothProtocol.length(bodyBuffer, 4) + _BluetoothProtocol.version() + _BluetoothProtocol.cmd_0040()

  var tempBuffer = _Utils.HexStr2Buffer(headValue + enRBodyStr);

  var sendBuffer = _Encrypt.addLastData(tempBuffer) // 追加校验位
  sendData(sendBuffer)
}

function getBody(buffer) {
  var bufferStr = _Utils.ab2hex(buffer);
  var last = 32 - bufferStr.length;
  var tempStr = '';
  for (var i = 0; i < last; i++) {
    tempStr += '0';
  }

  var resultStr = bufferStr + tempStr;
  var bf = _Utils.HexStr2Buffer(resultStr);
  return bf;
}

// ------------------------------------------------------------------------------------------------------------------------
// 状态数据回复
function statusReply() {
  var headValue = _BluetoothProtocol.head() + _BluetoothProtocol.length(null, 4) + _BluetoothProtocol.version() + _BluetoothProtocol.cmd_0041()
  var tempBuffer = _Utils.HexStr2Buffer(headValue);
  var sendBuffer = _Encrypt.addLastData(tempBuffer) // 追加校验位
  sendData(sendBuffer)
}

// 获取实时数据
function getCurrentTimeData(CompletedHandler) {
  _sendCompletion = CompletedHandler
  var headValue = _BluetoothProtocol.head() + _BluetoothProtocol.length(null, 4) + _BluetoothProtocol.version() + _BluetoothProtocol.cmd_0037()
  var tempBuffer = _Utils.HexStr2Buffer(headValue);
  var sendBuffer = _Encrypt.addLastData(tempBuffer) // 追加校验位
  sendData(sendBuffer)
}

// ------------------------------------------------------------------------------------------------------------------------

// 发送数据
var islog = true
function sendData(buffer) {
  if (!buffer || buffer.byteLength <= 0) {
    return;
  }
  if (islog) {
    console.log('send:', _Utils.ab2hex(buffer))
  }

  let length = buffer.byteLength;
  if (length > 20) {
    const newBf = buffer.slice(0, 20);

    islog = false

    write(newBf, {
      success: function (res) {
        // 发送剩余数据
        var tempBuffer = buffer.slice(20, buffer.byteLength);
        sendData(tempBuffer);
      },
      fail: function (res) {
        console.log('写入数据错误: ', res);
        if (_sendCompletion) {
          _sendCompletion.fail(res)
          _sendCompletion = null
        }
      }
    })

  } else {
    islog = true

    // 直接写入
   write(buffer, {
      success: function (res) {
        // console.log('写入完成');
        if (_sendCompletion) {
          _sendCompletion.success(res)
          _sendCompletion = null
        }
      },
      fail: function (res) {
        console.log('写入数据错误: ', res);
        if (_sendCompletion) {
          _sendCompletion.fail(res)
          _sendCompletion = null
        }
      }
    })
  }
}

var _tempAllLength = 0;
var _tempDataBufferStr = null;
// 获取数据
function getData(buffer) {
  // 已有数据长度，追加数据。没有为新数据
  if (!_tempAllLength || _tempAllLength <= 0) {
    var dataView = new DataView(buffer);
    var a = dataView.getUint8(1);
    var b = dataView.getUint8(2);
    _tempAllLength = a * 256 + b;

    _tempDataBufferStr = ''
  }

  _tempDataBufferStr += _Utils.ab2hex(buffer); // 追加数据

  // console.log('_tempDataBufferStr: ', _tempDataBufferStr);

  var currentLength = (_tempDataBufferStr.length - 6) / 2; //去掉，起始标志（1字节） 和 数据长度（2字节）
  // 数据未接收完整
  if (currentLength < _tempAllLength) {
    // console.log('接受未完成：', _tempDataBufferStr);
    return null;
  }
  else if (currentLength > _tempAllLength) {
    // console.log('数据长度超出范围');
    _tempAllLength = 0;
    return null;
  }
  else if (currentLength == _tempAllLength) {
    // console.log('接受完成');
    _tempAllLength = 0;
    return _Utils.HexStr2Buffer(_tempDataBufferStr);
  }

  // console.log('数据有误');
  _tempAllLength = 0;
  return null;
}

// ------------------------------------------------------------------------------------------------------------------------

// 写入数据
function write(buffer, CompletedHandler) {
  // 参数效验
  if (!_deviceId || _deviceId.length <= 0 ||
    !buffer || buffer.byteLength <= 0) {
    console.log('参数错误 BluetoothCenter.js 方法:write')
    return
  }

  wx.writeBLECharacteristicValue({
    deviceId: _deviceId,
    serviceId: _serviceId_FF12,
    characteristicId: _characteristicId_FF01,
    value: buffer,
    success: function (res) {
      CompletedHandler.success(res);
    },
    fail: function (res) {
      CompletedHandler.fail(res);
    }
  })
}
