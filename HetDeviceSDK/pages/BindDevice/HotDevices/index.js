//index.js
var _BindDeviceRequest = require('../../../Networking/BindDeviceRequest.js')

Page({
  data: {
  },

  onLoad: function () {
    var that = this;
    wx.showLoading({
        title: '请稍后...',
    })
    this.beginToLoadData(); // 请求数据
  },

  // 小类点击
  cellSubClick: function(e) {

      var item = e.currentTarget.dataset.hi;
      // 蓝牙
      if (item.bindType == 2) {
          var itemJson = JSON.stringify(item);
          var encodeJson = encodeURIComponent(itemJson);
          var navUrl = "../ScanDevice/index?itemJson=" + encodeJson;
          wx.navigateTo({url:navUrl})
      } 
      else {
          wx.showToast({
            title: '不支持该类型设备',
            duration: 2000
          })
      }
  },

  // 分类查找
  categoriesClick: function() {
      wx.navigateTo({url:"../DeviceCategories/index"})
  },
  
  // 数据处理
  beginToLoadData: function() {
    console.log('获取数据')
       var that = this;
       _BindDeviceRequest.send2GetHotDevice({
          success: function(res){
              wx.hideLoading();
              // var dataArray = res["deviceTypeVos"];

              that.setData({
                  subListData:res
              })
          },
          fail: function (res) {
              wx.hideLoading()
              wx.showToast({
                title: res["msg"],
                duration: 2000
              })
          }
      })
  }
})
