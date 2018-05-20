// var _BluetoothCenter = require('../Bluetooth/BluetoothCenter.js')
var _Utils = require('../Bluetooth/BluetoothUtils.js')
var _Parser = require('../../HetDeviceSDK/utils/xmldom/dom-parser.js')
var _BluetoothConfig = require('../../HetDeviceSDK/Config/BluetoothConfig.js')
var _BluetoothProtocol = require('../Bluetooth/BluetoothProtocol.js')

// AES
var _fun_aes = require('../../HetDeviceSDK/utils/aes.js')
var _keyValue = ''
var _ivValue = ''

module.exports = {
  getAuthData: getAuthData, // 获取授权信息
  addLastData: addLastData, // 追加效验位
  encodeData: encodeData,
  decodeData: decodeData,
  calibrate_crc8: calibrate_crc8,
  aesEncrypt: aesEncrypt,
  aesDecrypt: aesDecrypt
}

/**
 * 获取授权信息
 * mac: 设备mac
 */
function getAuthData(mac) {
  if (!mac || mac.length < 0) {
    return null
  }

  let macBuffer = _Utils.HexStr2Buffer(mac);

  // let HexStr = 'a76aaea732f6ac16a7eb42be38e5d078';
  let HexStr = randomHexStr();
  _keyValue = HexStr
  let randomBuffer = _Utils.HexStr2Buffer(HexStr);

  var keyBuffer = generateCipherKey(macBuffer, randomBuffer, randomBuffer.byteLength);
  // 3a0014010020
  var headValue = _BluetoothProtocol.head() + _BluetoothProtocol.length(keyBuffer, 4) + _BluetoothProtocol.version() + _BluetoothProtocol.cmd_0020()

  var tempBuffer = _Utils.HexStr2Buffer(headValue + _Utils.ab2hex(keyBuffer));
  var subBuffer = tempBuffer.slice(1, tempBuffer.byteLength);

  var calBuffer = calibrate_crc8(subBuffer); // 追加校验位

  var sendBuffer = _Utils.HexStr2Buffer(_Utils.ab2hex(tempBuffer) + _Utils.ab2hex(calBuffer));
  return sendBuffer;
}

/*************************************************************************************************************************
 *                                                      辅助方法
 **************************************************************************************************************************/
 // 追加效验位
function addLastData(buffer) {
  var subBuffer = buffer.slice(1, buffer.byteLength)
  var calBuffer = calibrate_crc8(subBuffer) // 追加校验位
  var sendBuffer = _Utils.HexStr2Buffer(_Utils.ab2hex(buffer) + _Utils.ab2hex(calBuffer))
  return sendBuffer
}

/*************************************************************************************************************************
 *                                                      数据加密
 **************************************************************************************************************************/

/**
 * command 命令
 * params 参数
 */
function encodeData(command, params) {
  // 参数效验
  if(!command || command.length <= 0 ||
    !params || params.length <= 0) {
      return null
  }

  var commandDic = getCommandData(command)
  if (!commandDic) {
    return null
  }
  let xmlStr = commandDic['content']

  // var json = _xml2json(xmlStr);
  // console.log('json === ', json)

  // 解析xml
  var XMLParser = new _Parser.DOMParser()
  var doc = XMLParser.parseFromString(xmlStr)
  var a = doc.getElementsByTagName('definitions')['0']
  var byteDefList = a.getElementsByTagName('byteDef')

  var tempArray = new Array()
  for (var i = 0; i < byteDefList.length; i++) {
    var aa = byteDefList[i]
    var dic = new Array();
    for (var j = 0; j < aa.attributes.length; j++) {
      let key = aa.attributes[j].nodeName;
      let value = aa.attributes[j].nodeValue;
      dic[key] = value;
    }
    tempArray.push(dic);
  }

  // xml 字符串处理
  // var tempArray = new Array();
  // for (var i = 0; i < a.childNodes.length; i ++) {
  //   var aa = a.childNodes[i];
  // var dic = new Array();
  // for (var j = 0; j < aa.attributes.length; j++) {
  //   let key = aa.attributes[j].nodeName;
  //   let value = aa.attributes[j].nodeValue;
  //   dic[key] = value;
  // }
  // tempArray.push(dic);
  // }

  // console.log('tempArray === ', tempArray);


  //--------------------------------------
  var dataStr = '';
  var byteDefs = tempArray;
  
  for (var i = 0; i < byteDefs.length; i++) {
    var obj = byteDefs[i];

    let ignore = obj.ignore;
    if (ignore == 'true') { // ignore 为 true 过滤
      continue;
    }

    let key = obj.property;

    if (!params[key]) { // 效验参数
      dataStr += '00'
      continue
      // break
    }

    let paramsValue = params[key];
    let length = obj.length;
    let bf = getBufferWithValue(length, paramsValue);

    dataStr += _Utils.ab2hex(bf);

  }
  return _Utils.HexStr2Buffer(dataStr);
}

// 获取命令数据
function getCommandData(command) {
  var dataDic = _BluetoothConfig.getConfig()
  if (dataDic) {
    let commondList = dataDic['list']
    for (var i = 0; i < commondList.length; i++) {
      var dic = commondList[i]
      var cmd = dic['command']
      if (command == cmd.toLowerCase()) {
        return dic
      }
    }
  }
  return null
}

/**
 * length 字节
 * value 参数
 */
function getBufferWithValue(length, value) {

  var hexStr = value.toString(16);
  var last = length * 2 - hexStr.length;
  var tempStr = '';
  for (var i = 0; i < last; i++) {
    tempStr += '0';
  }
  var resultStr = tempStr + hexStr;
  var bf = _Utils.HexStr2Buffer(resultStr);
  return bf;
}

/*************************************************************************************************************************
 *                                                      数据解密
 **************************************************************************************************************************/

/**
 * command 命令
 * buffer 数据
 */
function decodeData(command, buffer) {
  // buffer = _Utils.HexStr2Buffer('3a001401a0412ee4b0178621310e9462f7ef122ea496b4')
  // let newBf = buffer.slice(6, 22) bug
  let newBf = buffer.slice(6, buffer.byteLength-1)
  let newBfStr = _Utils.ab2hex(newBf)

  // let decryptStr = aesDecrypt(newBfStr) // 加密
  let decryptStr = newBfStr

  let decryptBuffer = _Utils.HexStr2Buffer(decryptStr)

  var commandDic = getCommandData(command)
  if (!commandDic) {
    return null
  }
  let xmlStr = commandDic['content']

  var XMLParser = new _Parser.DOMParser()
  var doc = XMLParser.parseFromString(xmlStr)
  var a = doc.getElementsByTagName('definitions')['0'];
  var byteDefList = a.getElementsByTagName('byteDef')

  var tempArray = new Array()
  for (var i = 0; i < byteDefList.length; i++) {
    var aa = byteDefList[i]
    var dic = new Array();
    for (var j = 0; j < aa.attributes.length; j++) {
      let key = aa.attributes[j].nodeName;
      let value = aa.attributes[j].nodeValue;
      dic[key] = value;
    }
    tempArray.push(dic);
  }

  // console.log('tempArray === ', tempArray);

  var dic = {};
  var tempStr = decryptStr;
  for (var i = 0; i < tempArray.length; i++) {
    let obj = tempArray[i]
    let key = obj['property']
    let length = obj['length']

    let value = tempStr.substring(0, length * 2)
    tempStr = tempStr.substring(length * 2, tempStr.length)

    dic[key] = parseInt(value, 16)
  }
  return dic;
}

// 随机16进制字符串
function randomHexStr() {
  var num = '';
  for (var i = 0; i <= 31; i++) {
    var tmp = Math.ceil(Math.random() * 15);
    if (tmp > 9) {
      switch (tmp) {
        case (10):
          num += 'a';
          break;
        case (11):
          num += 'b';
          break;
        case (12):
          num += 'c';
          break;
        case (13):
          num += 'd';
          break;
        case (14):
          num += 'e';
          break;
        case (15):
          num += 'f';
          break;
      }
    } else {
      num += tmp;
    }
  }
  return num;
}

// 获取 key
function generateCipherKey(ptrMac, ptrRandom, randomLen) {
  var tempbuf = new ArrayBuffer(70);

  var tempbufDataView = new DataView(tempbuf);
  var ptrMacDataView = new DataView(ptrMac);

  for (var i = 0; i < 6; i++) {
    var a = ptrMacDataView.getUint8(i, 1);
    tempbufDataView.setUint8(i, a)
  }

  for (var i = 0; i < 6; i++) {
    var a = tempbufDataView.getUint8(i, 1);
    a >>= 2;
    tempbufDataView.setUint8(i, a)
  }

  insertSort(tempbuf, tempbuf.byteLength);
  rc4_skip(tempbuf, 16, 0, ptrRandom, randomLen);

  return ptrRandom;
}

// 从大到小排列
function insertSort(buffer, n) {
  var i, j, target;
  var dataView = new DataView(buffer);
  for (var i = 1; i < n; i++) {
    target = dataView.getUint8(i, 1);

    for (var j = i; j > 0 && dataView.getUint8(j - 1, 1) < target; j--) {
      dataView.setUint8(j, dataView.getUint8(j - 1, 1));     //移动元素的位置.供要插入元素使用
    }
    dataView.setUint8(j, target); //插入需要插入的元素
  }
}

// rc4
function rc4_skip(keyBuffer, keylen, skip, dataBuffer, data_len) {
  var i, j, k;
  var SBuffer = new ArrayBuffer(256);
  var pos = new ArrayBuffer();
  var kpos;
  var key = new DataView(keyBuffer);

  var S = new DataView(SBuffer);

  /* Setup RC4 state */
  for (var i = 0; i < 256; i++) {
    S.setUint8(i, i);
  }
  j = 0;
  kpos = 0;
  for (var i = 0; i < 256; i++) {
    j = (j + S.getUint8(i, 1) + key.getUint8(kpos, 1)) & 0xff;
    kpos++;
    if (kpos >= keylen) {
      kpos = 0;
    }

    S_SWAP(SBuffer, i, j);
  }

  /* Skip the start of the stream */
  i = j = 0;
  for (var k = 0; k < skip; k++) {
    i = (i + 1) & 0xff;
    j = (j + S.getUint8(i, 1)) & 0xff;

    S_SWAP(SBuffer, i, j);
  }
  // /* Apply RC4 to data */
  pos = dataBuffer;
  var posData = new DataView(pos);
  for (var k = 0; k < data_len; k++) {
    i = (i + 1) & 0xff;
    j = (j + S.getUint8(i, 1)) & 0xff;

    S_SWAP(SBuffer, i, j);
    var t = (S.getUint8(i, 1) + S.getUint8(j, 1)) & 0xff
    var p = posData.getUint8(k, 1) ^ S.getUint8(t, 1);
    posData.setUint8(k, p);
  }

  return 0;
}

// rc4_S_SWAP
function S_SWAP(SBuffer, a, b) {
  do {
    var S = new DataView(SBuffer);
    var t = S.getUint8(a, 1);
    S.setUint8(a, S.getUint8(b, 1));
    S.setUint8(b, t);
  } while (0)
}

// 追加校验位
function calibrate_crc8(buffer) {
  var crc;
  var crcbuff;
  var i;

  crc = 0;
  const data = new DataView(buffer);
  var length = buffer.byteLength;
  var d = 0;

  while (length--) {

    crcbuff = data.getUint8(d++, 1);

    for (var i = 0; i < 8; i++) {
      if ((crc ^ crcbuff) & 0x01) {
        crc ^= 0x18;
        crc >>= 1;
        crc |= 0x80;
      }
      else {
        crc >>= 1;
      }
      crcbuff >>= 1;
    }
  }

  var tempBuffer = new ArrayBuffer(1);
  var tempDataView = new DataView(tempBuffer);
  tempDataView.setUint8(0, crc);
  return tempBuffer;
}

/*************************************************************************************************************************
 *                                                      AES
 **************************************************************************************************************************/
 // 公有
function aesEncrypt(word) {
  var enStr = Encrypt(word)
  return enStr.substring(0, 32)
}

function aesDecrypt(word) {
  return Decrypt(word)
}

// 私有
function Decrypt(word) {
  var key = _fun_aes.CryptoJS.enc.Hex.parse(_keyValue);
  var iv = _fun_aes.CryptoJS.enc.Hex.parse(_ivValue);

  var encryptedHexStr = _fun_aes.CryptoJS.enc.Hex.parse(word);
  var srcs = _fun_aes.CryptoJS.enc.Base64.stringify(encryptedHexStr);
  var decrypt = _fun_aes.CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: _fun_aes.CryptoJS.mode.CBC, padding: _fun_aes.CryptoJS.pad.Pkcs7 });
  var decryptedStr = decrypt.toString(_fun_aes.CryptoJS.enc.Hex);
  return decryptedStr.toString();
}

function Encrypt(word) {
  var key = _fun_aes.CryptoJS.enc.Hex.parse(_keyValue);
  var iv = _fun_aes.CryptoJS.enc.Hex.parse(_ivValue);

  var srcs = _fun_aes.CryptoJS.enc.Hex.parse(word);
  var encrypted = _fun_aes.CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: _fun_aes.CryptoJS.mode.CBC, padding: _fun_aes.CryptoJS.pad.Pkcs7 });
  return encrypted.ciphertext.toString().toUpperCase();
}