
var _inputValue = ''

Page({
  data: {
    showModalStatus: false
  },

  onLoad: function () {
    var that = this

    wx.getConnectedWifi({
      success: function (res) {
        console.log('SSID===', res.wifi.SSID)

        that.setData({
          title: res.wifi.SSID
        })
      }
    })
  },

  bindKeyInput: function(e) {
    _inputValue = e.detail.value
  },

  cancelClick: function(e) {

  },

  okClick: function(e) {
    if (!_inputValue || _inputValue.length <= 0) {
      wx.showToast({
        title: '请输入密码',
        duration: 2000
      })
      return
    }
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
    console.log('_inputValue', _inputValue)
  },

  util: function (currentStatu) {
    // 关闭
    if (currentStatu == "close") {
      this.setData({
        showModalStatus: false,
      });
    }

    // 显示 
    if (currentStatu == "open") {
      this.setData({
        showModalStatus: true,
      });
    }
  },
})