//app.js
import { scanDevice, accountAuth, getDeviceData } from './utils/util.js';
App({
    globalData: {
        sourceData: {}
    },
    onLaunch: function () {
        let _this = this;
        accountAuth(res => {
            console.log('授权成功')
        }, err => {
            console.log('授权失败')
        });
    },
})