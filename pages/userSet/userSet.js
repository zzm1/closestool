// pages/userSet/userSet.js
import { getDeviceData, removeListenDevice, sendDevice } from '../../utils/util.js';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        setList: [
            { title: '臀部-女性水温', value: 1, name:'nxsw'}, 
            { title: '臀部-冷热水压', value: 1, name: 'lrsy' },
            { title: '臀部-冷热位置', value: 1, name: 'lrwz' },
            { title: '女性-经期水压', value: 1, name: 'jqsy' }, 
            { title: '女性-经期位置', value: 1, name: 'jqwz' }, 
            { title: '润肠位置', value: 1, name: 'rcwz' }, 
            { title: '风温', value: 1, name: 'fw' }
        ],
        sourceData:{}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            userType: options.userType
        })
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
    sliderChange(event) {
        console.log(event);
        let { userType, setList, sourceData} = this.data;
        let currentVal = event.detail.value;
        let currentName = event.currentTarget.dataset.name;
        let currentIndex = event.currentTarget.dataset.index;
        switch (currentName) {
            case 'nxsw':
                if (userType == 3) {
                    sourceData.RearFrontWaterT00 = currentVal;
                }
                if (userType == 1) {
                    sourceData.RearFrontWaterT01 = currentVal;
                }
                if (userType == 2) {
                    sourceData.RearFrontWaterT02 = currentVal;
                }
                break;
            case 'lrsy':
                if (userType == 3) {
                    sourceData.RearSpaPress00 = currentVal;
                }
                if (userType == 1) {
                    sourceData.RearSpaPress01 = currentVal;
                }
                if (userType == 2) {
                    sourceData.RearSpaPress02 = currentVal;
                }
                break;
            case 'lrwz':
                if (userType == 3) {
                    sourceData.RearSpaPosi00 = currentVal;
                }
                if (userType == 1) {
                    sourceData.RearSpaPosi01 = currentVal;
                }
                if (userType == 2) {
                    sourceData.RearSpaPosi02 = currentVal;
                }
                break;
            case 'jqsy':
                if (userType == 3) {
                    sourceData.FrontCycPress00 = currentVal;
                }
                if (userType == 1) {
                    sourceData.FrontCycPress01 = currentVal;
                }
                if (userType == 2) {
                    sourceData.FrontCycPress02 = currentVal;
                }
                break;
            case 'jqwz':
                if (userType == 3) {
                    sourceData.FrontCycPosi00 = currentVal;
                }
                if (userType == 1) {
                    sourceData.FrontCycPosi01 = currentVal;
                }
                if (userType == 2) {
                    sourceData.FrontCycPosi02 = currentVal;
                }
                break;
            case 'rcwz':
                if (userType == 3) {
                    sourceData.RunChongPosi00 = currentVal;
                }
                if (userType == 1) {
                    sourceData.RunChongPosi01 = currentVal;
                }
                if (userType == 2) {
                    sourceData.RunChongPosi02 = currentVal;
                }
                break;
            case 'fw':
                if (userType == 3) {
                    sourceData.SetFanTemp00 = currentVal;
                }
                if (userType == 1) {
                    sourceData.SetFanTemp01 = currentVal;
                }
                if (userType == 2) {
                    sourceData.SetFanTemp02 = currentVal;
                }
                break;
        }
        sendDevice(sourceData, res => {
            this.setData({
                sourceData
            })
            console.log('control === ', res)
        }, err => {

        })
        setList[currentIndex].value = currentVal;
        // console.log(currentName);
        this.setData({
            setList
        })
    },
    preventDef(e) {
        // console.log(e);
        // e.preventDefault();
    }
})