// pages/setting/setting.js
import { getDeviceData, removeListenDevice, sendDevice } from '../../utils/util.js';
// const app = getApp();
// let sourceData = app.globalData.sourceData;
Page({
    data: {
        sourceData:{}
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
    onLoad: function (options) {

    },
    test() {
        wx.navigateTo({
            url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
        })
    },
    //设置座温
    sliderChange(event) {
        let { sourceData } = this.data;
        let currentValue = event.detail.value;
        sourceData.SetSeatTemp = currentValue;
        sendDevice(sourceData, res => {
            this.setData({
                sourceData
            })
            // console.log('control === ', res)
        }, err => {

        })
    },
    goToSelSet() {
        wx.navigateTo({
            url: "/pages/selectSet/selectSet"
        })
    },
    handleAutoFg(event) {
        let { sourceData } = this.data;
        let currentValue = event.detail.value;
        sourceData.AutoOpenONOff = currentValue?1:2;
        sendDevice(sourceData, res => {
            this.setData({
                sourceData
            })
            // console.log('control === ', res)
        }, err => {

        })
    },
    handlePower(event) {
        let { sourceData } = this.data;
        let currentValue = event.detail.value;
        sourceData.DeviceOnOff = currentValue ? 1 : 2;
        sendDevice(sourceData, res => {
            this.setData({
                sourceData
            })
            // console.log('control === ', res)
        }, err => {

        })
        // console.log(event.detail.value)
        // wx.showLoading();
        // let sourceData = this.data.sourceData;
        // let { Deviceonoff } = this.data.sourceData;
        // if (event.detail.value) {
        //     //开机设备
        //     sourceData.Deviceonoff = 1;
        //     _BluetoothCenter.control(sourceData, {
        //         success: function (res) {
        //             this.setData({
        //                 sourceData
        //             })
        //         },
        //         fail: function (res) {
        //             console.log('fail', res)
        //         }
        //     })
        // } else {
        //     //开机设备
        //     sourceData.Deviceonoff = 2;
        //     _BluetoothCenter.control(sourceData, {
        //         success: function (res) {
        //             this.setData({
        //                 sourceData
        //             })
        //         },
        //         fail: function (res) {
        //             console.log('fail', res)
        //         }
        //     })
        // }


    }
})