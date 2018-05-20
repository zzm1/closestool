//index.js
var _Networking = require('../Networking/BindDeviceRequest.js')
var _Bluetooth = require('../Bluetooth/Bluetooth.js')

var _UserConfig = require('../Config/UserConfig.js')
var _Networking = require('../Networking/HttpRequest.js')

var RequestHandler = {
    success: function(res){},
    fail: function(res) {},
}

module.exports = {
  addDevice: addDevice, // 添加设备(仅绑定 成功 回调)
  accountAuth: accountAuth // 临时授权接口
}

// 临时授权接口
function accountAuth(RequestHandler) {
  var urlString = "https://api.clife.cn/v1/account/login";
  // var urlString = "https://dp.clife.net/v1/account/login";

  var params = {
    "account":"18575501106",
    // "password":"461687f75ab22d1f5d722699dc3246f0"
    // "password":"6e84a0a7bcdeffffe5f1b6e0312729e4"
    // "password":"10fe5d6df0672945c20cdde881a95b77"
    "password": "a87499110b76e0b546b01ec9506b2c93" // 3105

    // "account": "15889635601",
    // "password": "d2be3031d6469f5dc66bc149e9a257e0"
  }
  _Networking.apiRequest_POST(urlString, params, {
    success: function (res) {
      _UserConfig.setConfig(res["accessToken"]);
      RequestHandler.success(res)
    },
    fail: function (res) {
      RequestHandler.fail(res)
    }
  });
}

// 添加设备(仅绑定 成功 回调)
function addDevice(RequestHandler) {

	let path = getRootPath("HetDeviceSDK/pages/BindDevice/HotDevices/index");
	wx.navigateTo({url:path})

	_Bluetooth.bindDevice({
		success: function(res){
             RequestHandler.success(res)
        }
	})
}

// 获取跟目录
function getRootPath(path) {
	var pages = getCurrentPages()
	var currentPage = pages[pages.length-1];
    var urlString = currentPage.route; 

    // 获取符号数量
    let n = (urlString.split('/')).length-1;

    var tempString = "";
    for (var i = 0; i < n; i++) {
    	tempString += "../";
    }
    return tempString + path;
}
