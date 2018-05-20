//index.js
var _md5 = require('../utils/md5.js')
var _AppConfig = require('../Config/AppConfig.js')

var RequestHandler = {
    success: function(res){},
    fail: function(res) {},
}

// GET请求
function apiRequest_GET(urlString, params, RequestHandler) {
    // 获取配置的 appId 和 appSecret

    var value = _AppConfig.getConfig();
    if (!value || value.length <= 0) {
        return;
    }
    let appId = value['appId'];
    let currentTimeStamp = String(new Date().getTime());

    params["appId"] = appId;
    params["timestamp"] = currentTimeStamp;

    console.log ("请求地址",urlString)
    console.log ("传递参数：",params)

    wx.request( {

      url: urlString,

      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "GET",
      data: params,

      success: function(res) {
          console.log('请求成功：',res)
          var code = res.data["code"];
          if (code == 0) {
              RequestHandler.success(res.data["data"])
          } else {
              RequestHandler.fail(res.data)
          }
      },
      fail: function(res) {
          console.log('请求失败：',res)
          RequestHandler.fail(res.data)
      }

    });
}

// POST请求
function apiRequest_POST(urlString, params, RequestHandler) {
  // 组装参数
  var tempParams = commonParams(urlString, params, 'POST')

  console.log ("请求地址",urlString)
  console.log ("传递参数：",tempParams)

	wx.request( {

      url: urlString,

      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      data: tempParams,

      success: function(res) {
          console.log('请求成功：',res)
          var code = res.data["code"];
          if (code == 0) {
              RequestHandler.success(res.data["data"])
          } else {
              RequestHandler.fail(res.data)
          }
      },
      fail: function(res) {
          console.log('请求失败：',res)
          RequestHandler.fail(res.data)
      }

    });
}

// 通用参数处理
function commonParams(urlString, params, method) {
    var appId = ""
    var appSecret = "";

    // 获取配置的 appId 和 appSecret
    var value = _AppConfig.getConfig();
    if (!value || value.length <= 0) {
        return;
    }
    appId = value['appId'];
    appSecret = value['appSecret'];

    
	  var urlString = urlString;
	  var signSeed = "";
    var currentTimeStamp = String(new Date().getTime());
    params["appId"] = appId;
    params["timestamp"] = currentTimeStamp;

    // 签名处理
    signSeed += method;
    signSeed += urlString;
    signSeed += dictionaryToString(params);
    signSeed += "&" + appSecret;

    var sign = _md5.hex_md5(signSeed)

    params["sign"] = sign;

    return params;
}

// 组装参数
function dictionaryToString(params) {
  var tempString = "";
  var tempParams = {};

  // 参数排序
  var sdic = Object.keys(params).sort();
  for(var ki in sdic){ 
      var key =  sdic[ki];
      var value =  params[sdic[ki]];

      tempParams[key] = value;
  }

  for(var key in tempParams) {
		  tempString += key+"="+tempParams[key]+"&";
	}

	tempString=tempString.substring(0,tempString.length-1);
  return tempString;
} 

module.exports = {
  apiRequest_POST: apiRequest_POST,
  apiRequest_GET: apiRequest_GET
}