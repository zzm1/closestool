// pages/start/start.js
import { scanDevice, accountAuth, getDeviceData, bindDevice, getBluetoothAdapterState } from '../../utils/util.js';
const app = getApp();
Page({
    data: {
        deviceList: [],
        loading:false,
    },
    onLoad: function () {
        this.comScale();
    },
    onReady: function (options) {

    },
    scaleAgain:function(){
        this.setData({
            loading: !this.data.loading
        })
        this.comScale();
    },
    comScale:function(){
        wx.stopPullDownRefresh();
        getBluetoothAdapterState(res => {
            console.log(res)
            if (res.available == false) {
                wx.showModal({
                    title: '提示',
                    content: '请打开手机蓝牙功能',
                    showCancel: false,
                    success: function (res) {
                        if (res.confirm) {
                            console.log('用户点击确定')
                        } else if (res.cancel) {
                            console.log('用户点击取消')
                        }
                    }
                })
                return;
            }else{
                scanDevice(res => {
                    wx.hideLoading();
                    console.log('扫描成功', res)
                    this.setData({
                        deviceList: res
                    })
                }, err => {
                });
            }
        },err=>{

        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.comScale();
        // let _this = this;
        // this.setData({
        //     deviceList: []
        // })
        // scanDevice(res => {
        //     wx.hideLoading();
        //     wx.stopPullDownRefresh();
        //     this.setData({
        //         deviceList: res
        //     })

        //     console.log('扫描完成:', res)
        // }, res => {
        //     console.log('扫描失败', res);
        // })
    },
    chooseDevice: function (event) {
        wx.showLoading({ title: '正在连接', });
        console.log(event)
        let deviceId = event.currentTarget.dataset.deviceId;
        let mac = event.currentTarget.dataset.mac;
        console.log('获取到的id跟mac', deviceId, mac);
        bindDevice(deviceId, mac, res => {
            wx.hideLoading();
            wx.switchTab({
                url: "/pages/ablity1/ablity1",
            })
        })
    },
})