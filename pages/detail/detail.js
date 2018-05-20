// pages/detail/detail.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        setList: [{ title: '水温', value: 1 }, { title: '水压', value: 1 }, { title: '位置', value: 1 }],
        stop: true,
        modeData: [
            { name: '未使用', mode: 0, image: '' },
            { name: '一键全自动', mode: 1, image: '/image/work/zd.png' },
            { name: '烘干', mode: 2, image: '/image/work/hg.png' },
            { name: '冲水', mode: 3, image: '/image/work/cs.png' },
            { name: '臀部清洗', mode: 4, image: '/image/work/tb.png' },
            { name: '女性清洗', mode: 5, image: '/image/work/nx.png' },
            { name: '润肠水疗', mode: 6, image: '/image/work/rc.png' },
            { name: '儿童清洗', mode: 7, image: '/image/work/et.png' },
            { name: '冷热SPA', mode: 8, image: '/image/work/lr.png' },
            { name: '经期护理', mode: 9, image: '/image/work/jq.png' },
            { name: '碰头清洗', mode: 10, image: '/image/work/pt.png' }
        ],
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // console.log(options)
        let { type, mode } = options;
        this.setData({
            type, mode
        })
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

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    sliderChange(event) {
        let oldData = this.data.setList;
        let currentVal = event.detail.value;
        let currentIndex = event.currentTarget.dataset.index;
        oldData[currentIndex].value = currentVal
        this.setData({
            setList: oldData
        })
    },
    switchRepeat() {

    },
    //停止模式
    handleStop() {
        let { sourceData } = this.data;
        sourceData.Mode = 0;
        sendDevice(sourceData, res => {
            wx.navigateBack()
            // console.log('control === ', res)
        }, err => {
        })
    }
})