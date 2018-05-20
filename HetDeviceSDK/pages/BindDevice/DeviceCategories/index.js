//index.js
var _BindDeviceRequest = require('../../../Networking/BindDeviceRequest.js')

Page({
  data: {
    showModalStatus: false
  },

  onLoad: function () {
    this.animation = wx.createAnimation({
        duration: 250
    })

    var that = this;
    wx.showLoading({
        title: '加载中',
    })
    this.beginToLoadData(); // 请求数据
  },

  // 下拉
  onPullDownRefresh: function () {
    this.beginToLoadData();     
  },

  // cell点击
  cellClick: function(e) {
      var that = this;
      var currentStatu = e.currentTarget.dataset.statu;
      if (currentStatu == "open") { 
      	var item = e.currentTarget.dataset.hi;
        var productArray = item["product"];
		    var subArray = hanleProduct(productArray);

  		  that.setData({
             subListData:subArray
        }) 
      }
       
        this.util(currentStatu) 
  }, 

  util: function(currentStatu){ 

        // 关闭
        if (currentStatu == "close") { 
          this.animation.translate(0, 0).step()
          this.setData({ 
            showModalStatus: false,
          }); 
        } 
    
       // 显示 
        if (currentStatu == "open") { 
          this.animation.translate(0, -360).step()
          this.setData({ 
            showModalStatus: true,
          }); 
        }

        this.setData({ animation: this.animation.export() }) 
  },

  // 小类点击
  cellSubClick: function(e) {
      var currentStatu = e.currentTarget.dataset.statu;
      this.util(currentStatu) 

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
  
  // 数据处理
  beginToLoadData: function() {
    console.log('获取数据')
       var that = this;
       _BindDeviceRequest.send2GetDeviceType({
          success: function(res){
              wx.hideLoading();
              var dataArray = res["deviceTypeVos"];

              that.setData({
                  listData:dataArray
              })
              console.log('成功:',res)
              wx.stopPullDownRefresh()
          },
          fail: function (res) {
              wx.hideLoading()
              wx.showToast({
                title: res["msg"],
                duration: 2000
              })
              console.log('失败:',res)
              wx.stopPullDownRefresh()
          }
      })
  }
})


// 处理小类
function hanleProduct(dataArray){
	var that = this;

	var tempArray = new Array();
	for (var i = 0; i < dataArray.length; i++) {
		var dataDic = dataArray[i];

		let deviceTypeId = dataDic["deviceTypeId"];
		let deviceSubtypeId = dataDic["deviceSubtypeId"];

		let tempId = deviceTypeId + deviceSubtypeId;

		if (!isHaveDeviceId(tempArray, tempId)) {

			tempArray.push(dataDic);
		}
	}

	return tempArray;
}

// 检查意见存在的id
function isHaveDeviceId(tempArray, tId) {

	for (var i = 0; i < tempArray.length; i++) {
		var dataDic = tempArray[i];					

		let deviceTypeId = dataDic["deviceTypeId"];
		let deviceSubtypeId = dataDic["deviceSubtypeId"];

		let tempId = deviceTypeId + deviceSubtypeId;

		if (tempId == tId) {
			return true;
		} else {
			return false;
		}
	}
}
