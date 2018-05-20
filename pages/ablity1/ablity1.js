import { getDeviceData, removeListenDevice, sendDevice} from '../../utils/util.js';
Page({
    data: {
        sourceData: {}
    },
    onLoad: function (options) {
        // wx.showLoading({
        //     title: '',
        // })
    },
    onShow: function () {
        getDeviceData(res => {
            console.log(res);
            wx.hideLoading()
            this.setData({
                sourceData: JSON.parse(res)
            })
        })
    },
    onUnload: function () {
        removeListenDevice();
    },
    //改变用户模式
    changeUser(event) {
        let currentData = this.data.sourceData;
        currentData.yonghuxuanzhe = event.currentTarget.dataset.user;
        // 设备控制
        console.log('currentData', currentData);
        let _this = this;
        sendDevice(currentData,res=>{
            this.setData({
                sourceData: currentData
            })
            console.log('control === ', res)
        },err=>{

        })
    },
    handleStop() {
        let currentData = this.data.sourceData;
        if(currentData.mode==0) return;
        currentData.mode = 0;
        sendDevice(currentData, res => {
            this.setData({
                sourceData: currentData
            })
            console.log('control === ', res)
        }, err => {

        })
    },
    //打开功能详情页
    handleDetail(event) {
        wx.showLoading();
        let sourceData = this.data.sourceData;
        let { mode, type } = event.currentTarget.dataset;
        sourceData[type] = mode;
        wx.navigateTo({
            url: `/pages/detail/detail?type=${type}&mode=${mode}`,
        })
        wx.hideLoading();
    },
    //打开烘干详情
    openDry(event) {
        wx.showLoading();
        let old = this.data.sourceData;
        let { mode, type } = event.currentTarget.dataset;
        old[type] = mode;
        wx.navigateTo({
            url: `/pages/dry/dry?type=${type}&mode=${mode}`,
        })
        wx.hideLoading();
    },
    handelGai(event) {
        console.log(typeof this.data.sourceData );
        console.log(event.currentTarget.dataset);
        let { zuogaizhuangtai, zuoquanzhuangtai } = event.currentTarget.dataset;
        let currentData = this.data.sourceData;
        currentData.zuogaizhuangtai = zuogaizhuangtai;
        currentData.zuoquanzhuangtai = zuoquanzhuangtai;
        sendDevice(currentData, res => {
            this.setData({
                sourceData: currentData
            })
            console.log('control === ', res)
        }, err => {

        })
    }
})