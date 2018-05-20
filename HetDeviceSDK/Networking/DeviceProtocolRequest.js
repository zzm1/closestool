var _Networking = require('/HttpRequest.js')
var _UserConfig = require('../Config/UserConfig.js')
var _HttpMacro = require('/HttpMacro.js')

var RequestHandler = {
  success: function (res) { },
  fail: function (res) { },
}

// 根据产品ID获取协议列表
function send2GetProtocolListByProductId(productId, protocolDate, RequestHandler) {
  let urlString = _HttpMacro.HTTP_HOST + "/v1/app/open/protoManage/getProtocolListByProductId";

  let userInfo = _UserConfig.getConfig();
  let accessToken = userInfo["accessToken"];

  var params = {
    "accessToken": accessToken,
    "productId": productId,
    "appType": 2,
    "protocolDate": protocolDate,
    "type": 0
  }
  _Networking.apiRequest_POST(urlString, params, RequestHandler);
}

module.exports = {
  send2GetProtocolListByProductId: send2GetProtocolListByProductId // 根据产品ID获取协议列表
}