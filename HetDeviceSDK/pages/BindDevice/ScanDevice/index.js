//index.js
var Bluetooth = require('../../../Bluetooth/Bluetooth.js')

var _timer = null;
var _waterTimer = null;
var _progress = 0;

Page({
  data: {
  },

  onLoad: function (options) {
  	var that = this;

    this.setData({
        yunViewHidden: true,// 注册云端视图
        successViewHidden: true
    })
    this.starProgress(); // 进度视图

  	var itemJson = decodeURIComponent(options.itemJson);
    var item = JSON.parse(itemJson);
    let productId = item.productId;
    let deviceTypeId = item.deviceTypeId;
    let deviceSubtypeId = item.deviceSubtypeId;
    let productName = item.productName;
    let productIcon = item.productIcon;

    console.log('item === ', item)
    Bluetooth.scanBluetoothDevice(productId, deviceTypeId, deviceSubtypeId, productName, productIcon, {
      success: function(res){
        console.log('成功:',res)
        that.setData({
          listData:res
        })
      },
      fail: function (res) {
        // console.log('失败:',res)
        wx.showToast({
		  title: '绑定失败',
		  duration: 2000
		})
      }
   })
  },

  onShow: function() {
  
  },

  onUnload: function() {
    this.stopProgress();
    this.stopWaterAnimation();
  },

  // 启动进度条
  starProgress: function() {
    _progress = 0;
    this.updataProgress();

      this.setData({
        progressHidden: false
      })

      // 创建动画
      var animation = wx.createAnimation({
      duration: 1400,
          timingFunction: 'linear', 
          delay: 0,
          transformOrigin: '50% 50% 0',
          success: function(res) {
            
          }
      })

     // 圆圈旋转
     var n = 0;
     _timer = setInterval(function () {
        n=n+1;
        animation.rotate(180 * (n)).step()
        this.setData({
          animation: animation.export()
        })
     }.bind(this), 1000)
  },

   // 刷新进度
   updataProgress: function() {
      var that = this;
      _progress ++;
      if (_progress <= 100) {
        that.progressView(_progress)
        var t=setTimeout(function(){
          that.updataProgress()
        },50)
      } 
      else {
        this.stopProgress();
      }
 },

   // 停止进度
   stopProgress: function() {
    clearInterval(_timer);
    this.setData({
      progressHidden: true
    })
  },

  // 进度
  progressView: function(value) {
    var that = this;

    var progress = value;
    var a = parseInt(progress / 100);
    var b = parseInt(progress /10%10);
    var c = parseInt(progress %10);

    // console.log("参数:",a,b,c)

    // 只显示各位
    if (a == 0 && b == 0) {
      that.setData({
        progressWidth: 100,
        showView_a: false,
        showView_b: false,
        showView_c: true,
        cImageSrc: "../../../Images/" + c + "@2x.png"
      })
    }
    // 只显示十位、个位
    else if (a == 0) {
      that.setData({
        progressWidth: 100,
        showView_a: false,
        showView_b: true,
        showView_c: true,
        bImageSrc: "../../../Images/" + b + "@2x.png",
        cImageSrc: "../../../Images/" + c + "@2x.png"
      })
    }
    // 只显示百位、十位、个位
    else if (a != 0) {
      that.setData({
        progressWidth: 140,
        showView_a: true,
        showView_b: true,
        showView_c: true,
        aImageSrc: "../../../Images/" + a + "@2x.png",
        bImageSrc: "../../../Images/" + b + "@2x.png",
        cImageSrc: "../../../Images/" + c + "@2x.png"
      })
    }
  },

  // 设备注册云端动画
  waterAnimation: function() {
    var animation2 = wx.createAnimation({  
      duration: 100,  
      timingFunction: "linear",  
      delay: 0,  
      transformOrigin: "50% 50 % 0"  
    }) 

    _waterTimer = setInterval(function () {
      animation2.scale(1.1).opacity(0.9).step({delay: 20})  
      .scale(1.2).opacity(0.9).step({ delay: 20 })  
      .scale(1.3).opacity(0.8).step({ delay: 20 })  
      .scale(1.4).opacity(0.7).step({ delay: 20})  
      .scale(1.5).opacity(0.6).step({ delay: 20 })  
      .scale(1.6).opacity(0.5).step({ delay: 20 })  
      .scale(1.7).opacity(0.4).step({ delay: 20 })  
      .scale(1.8).opacity(0.3).step({ delay: 20 })  
      .scale(1.9).opacity(0.2).step({ delay: 20 })  
      .scale(2.0).opacity(0.1).step({ delay: 20 })
      .scale(2.0).opacity(0.0).step({ delay: 20 })   
      .scale(1.0).opacity(0.0).step({ delay: 20, timingFunction: "step-end" })  
      this.setData({  
        animationData2: animation2.export()  
      }) 
    }.bind(this), 1000) 
  },

  // 停止波纹动画
  stopWaterAnimation: function () {
    clearInterval(_waterTimer);
    this.setData({
      yunViewHidden: true
    })
  },

  cellClick: function (e) {
    var that = this;
    var item = e.currentTarget.dataset.hi;

    this.setData({
        tableViewHidden: true,
        yunViewHidden: false,

        yunViewName: item.productName,
        yunViewDeviceName: item.localName
    })
    this.waterAnimation();

  	console.log('item === ',item)
    console.log("xxxxx === ",(item.mac));
    Bluetooth.createBLEConnection(item.deviceId, item.mac, {
      success: function(res){
        console.log('成功:',res)

        that.stopWaterAnimation();
        that.setData({
            successViewHidden: false
        })
      },
      fail: function (res) {
       console.log('失败:',res)
        wx.showToast({
          title: '绑定失败:'+res,
          duration: 2000
      })
     }
   })
  }

})
