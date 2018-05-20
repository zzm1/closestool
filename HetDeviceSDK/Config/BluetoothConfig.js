module.exports = {
  setConfig: setConfig,
  getConfig: getConfig
}

function setConfig(dataDic) {

  if (!dataDic) {
    console.log('参数错误')
    return;
  }

  wx.setStorage({
    key: "kBluetoothConfig",
    data: dataDic
  })
}

function getConfig() {
  try {
    var value = wx.getStorageSync('kBluetoothConfig')
    if (!value || value.length <= 0) {
      console.log('读取 kBluetoothConfig 为空')
      return null;
    }
    return value;

  } catch (e) {
    console.log('读取 kBluetoothConfig 错误')
    return null;
  }
}