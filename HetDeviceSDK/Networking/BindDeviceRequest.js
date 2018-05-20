
//index.js
var _Networking = require('/HttpRequest.js')
var _UserConfig = require('../Config/UserConfig.js')
var _HttpMacro = require('/HttpMacro.js')

var RequestHandler = {
    success: function(res){},
    fail: function(res) {},
}

module.exports = {
  send2GetDeviceType: send2GetDeviceType, // 获取设备分类
  send2Devicebind: send2Devicebind,	// 设备绑定
  send2SetBleVersion: send2SetBleVersion, // 设置蓝牙版本信息
  send2GetHotDevice: send2GetHotDevice // 获取热门设备
}

// 获取热门设备
function send2GetHotDevice(RequestHandler) {
    let urlString = _HttpMacro.HTTP_HOST + "/v1/device/hotDevice";

    let userInfo = _UserConfig.getConfig();
    let accessToken = userInfo["accessToken"];

    var params = {
      "accessToken":accessToken,
      "appType":"2"
    }
    _Networking.apiRequest_GET(urlString, params, RequestHandler);
}

// 获取设备分类
function send2GetDeviceType(RequestHandler) {
  	let urlString = _HttpMacro.HTTP_HOST + "/v1/device/getDeviceType";

  	var userInfo = _UserConfig.getConfig();
  	var accessToken = userInfo["accessToken"];

	var params = {
  		"accessToken":accessToken,
      "appType":"2",
      "dataVersion":"0"
    }
  _Networking.apiRequest_POST(urlString, params, RequestHandler);
}

// 设备绑定
function send2Devicebind(mac, productId, RequestHandler) {
  let urlString = _HttpMacro.HTTP_HOST + "/v1/device/bind";
  let timeZone = (new Date().getTimezoneOffset())*(-1);
  let version = "1.1";

  var userInfo = _UserConfig.getConfig();
  var accessToken = userInfo["accessToken"];

  var params = {
    "mac": mac,
    "productId": productId,
    "timeZone": timeZone,
    "version": version,
    "accessToken": accessToken
  }
  _Networking.apiRequest_POST(urlString, params, RequestHandler);
}

// 设置蓝牙版本信息
function send2SetBleVersion(deviceId, deviceBrandId, extVersion, mainVersion, RequestHandler) {
	let urlString = _HttpMacro.HTTP_HOST + "/v1/device/setBleVersion";

	var userInfo = _UserConfig.getConfig();
  	var accessToken = userInfo["accessToken"];

  	var params = {
  		"deviceId": deviceId,
        "deviceBrandId": deviceBrandId,
        "extVersion": extVersion,
        "mainVersion": mainVersion,
        "accessToken": accessToken
    }

    _Networking.apiRequest_POST(urlString, params, RequestHandler);
}

// 查询设备绑定状态
function send2GetBindState(deviceIdm, RequestHandler) {
  let urlString = _HttpMacro.HTTP_HOST + "/v1/device/getBindState";
  let version = "1.1";

  var userInfo = _UserConfig.getConfig();
  var accessToken = userInfo["accessToken"];

  var params = {
    "deviceId": deviceId,
    "version": version,
    "accessToken": accessToken
  }
  _Networking.apiRequest_GET(urlString, params, RequestHandler);
}