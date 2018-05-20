// pages/feedBack/feedBack.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        years: [1, 2, 3, 4],
        months: [4, 5, 6],
        days: [7, 8, 0],
        multiArray: [['无脊柱动物', '脊柱动物'], ['扁性动物', '线形动物', '环节动物', '软体动物', '节肢动物'], ['猪肉绦虫', '吸血虫']],
        nodes: [{
            name: 'div',
            attrs: {
                class: 'div_class',
                style: 'line-height: 60px; color: red;'
            },
            children: [{
                type: 'text',
                text: 'Hello&nbsp;World!'
            }]
        }],
        code: '',
        array: ['美国', '中国', '巴西', '日本'],
        questionOne: '请选择',
        questionTwo: '请选择',
        questionListOne: ['机器无反应', '体验感不好', '水路问题', '功能问题', '陶瓷'],
        questionListTwo: [],
        sourceQuestionListTwo: [['操作无反应', '无法清洗', '无法烘干', '其他'], ['座温温度', '水温温度', '烘干温度', '清洗水压强度', '其他'], ['不出水', '漏水', '喷水压力', '其他'], ['不工作', '开关总是跳闸', '夜灯不亮', '其他'], ['无法冲水', '冲不干净']]
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
    makeTel: function (event) {
        //不能用target 里面的元素会冒泡
        console.log(event)
        wx.makePhoneCall({
            phoneNumber: event.currentTarget.dataset.tel
        })
    },
    //点击问题1
    changeQuestOne: function (e) {
        console.log(e)
        let currentInx = e.detail.value;
        this.setData({
            questionOne: this.data.questionListOne[currentInx],
            questionListTwo: this.data.sourceQuestionListTwo[currentInx],
            questionTwo: '请选择'
        })
    },
    //点击问题2
    changeQuestTwo: function (e) {
        this.setData({
            questionTwo: this.data.questionListTwo[e.detail.value]
        })
    },
    //扫描序列号
    scaleCode: function () {
        wx.scanCode({
            onlyFromCamera: true,
            success: (res) => {
                this.setData({
                    code: res.result
                })
                console.log(res)
            }
        })
    },
    //改变序列号
    changeCode: function (event) {
        console.log(event)
        this.setData({
            code: event.detail.value
        })
    }
})