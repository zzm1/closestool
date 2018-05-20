
// 获取wifi信息
function getWifiInfo() {
  wx.startWifi({
    success: function (res) {
      console.log(res.errMsg)
      getWifiInfo_getConnectedWifi()
    }
  })
}

function getWifiInfo_getConnectedWifi() {
  wx.getConnectedWifi({
    success: function (res) {
      console.log('1111===', res)
    }
  })
}

// 发送已连接路由器密码等信息给Wi-Fi模组
function send2WifiDevice(SSID, password, bindCode, environment) {
  wx.request({
    url: 'https://www.gamezhp.com/het/wechat',
    // url: 'https://clife.cn/het/wechat',
    data: {
      SSID: SSID,
      password: password,
      bindCode: bindCode,
      environment: environment
    },
    method: "POST",
    header: {
      'content-type': 'text/html' // 默认值
    },
    success: function (res) {
      console.log('成功：', res.data)
    },
    fail: function (res) {
      console.log('失败：', res.data)
    }
  })
}



