//index.js

function setConfig(appId, appSecret) {

  if (!appId || appId.length <= 0 ||
      !appSecret || appSecret.length <= 0) {

      console.log('参数错误')
      return;
  }

  wx.setStorage({
    key:"kAppConfig",
    data:{
      "appId" : appId,
      "appSecret" : appSecret
    }
  })
}

function getConfig() {
    try {
      var value = wx.getStorageSync('kAppConfig')
      console.log(value);
      if (!value || value.length <= 0) {
          console.log('读取 kAppConfig 为空')
          return nil;
      }
      return value;

    } catch (e) {
      console.log('读取 kAppConfig 错误')
      return nil;
    }
}

module.exports = {
  setConfig: setConfig,
  getConfig: getConfig
}