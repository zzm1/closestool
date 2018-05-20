import { getDeviceData, removeListenDevice, sendDevice } from '../../utils/util.js';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        setList: [{ title: '风温', value: 1 }],
        tempNum: 1,
        sourceData: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    onUnload: function () {
        removeListenDevice();
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
    //改变风温slider
    sliderChange(event) {
        let oldData = this.data.setList;
        let currentVal = event.detail.value;
        let currentIndex = event.currentTarget.dataset.index;
        oldData[currentIndex].value = currentVal
        this.setData({
            setList: oldData
        })
    },
    //点击停止
    handleStop() {
        let currentData = this.data.sourceData;
        // if (currentData.mode == 0) return;
        currentData.mode = 0;
        sendDevice(currentData, res => {
            wx.navigateTo({
                url: '/pages/ablity1/ablity1',
            })
            this.setData({
                sourceData: currentData
            })
        }, err => {

        })
    },
})