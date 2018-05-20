//index.js

function setConfig(accessToken) {

  if (!accessToken || accessToken.length <= 0) {
      console.log('参数错误')
      return;
  }

  wx.setStorage({
    key:"kUserConfig",
    data:{
      "accessToken" : accessToken
    }
  })
}

function getConfig() {
    try {
      var value = wx.getStorageSync('kUserConfig')
      if (!value || value.length <= 0) {
          console.log('读取 kUserConfig 为空')
          return null;
      }
      return value;

    } catch (e) {
      console.log('读取 kUserConfig 错误')
      return null;
    }
}

module.exports = {
  setConfig: setConfig,
  getConfig: getConfig
}