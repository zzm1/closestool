/**
 * Created by zm on 2018/5/18.
 */

let _BluetoothCenter = require('../HetDeviceSDK/Bluetooth/BluetoothCenter.js');
let _Bluetooth = require('../HetDeviceSDK/Bluetooth/Bluetooth.js');
let _AppConfig = require('../HetDeviceSDK/Config/AppConfig.js');
let _HetDeviceSDK = require('../HetDeviceSDK/Public/Public.js');
const app = getApp();
let productId = '4724';
let deviceTypeId = '100';
let deviceSubtypeId = '1';
let productName = '樱井智能马桶';
let productIcon = '';
//
function getDeviceData(_fn) {
    if(typeof _fn != "function"){
          return '回调函数必须是函数'
    }
    _BluetoothCenter.init(productId);
    _BluetoothCenter.NotiCenter().listen('kOnBluetoothStatus', _fn);
    _BluetoothCenter.getCurrentTimeData();
};
function removeListenDevice() {
    _BluetoothCenter.NotiCenter().remove('kOnBluetoothStatus', function(){
        console.log('移除监听')
    });
};
//扫描设备
function scanDevice(succFn, failFn) {
    wx.showLoading({ title: '扫描中', })
    _Bluetooth.scanBluetoothDevice(productId, deviceTypeId, deviceSubtypeId, productName, productIcon, { success: succFn, fail: failFn });
};

//账户授权
function accountAuth(suc, err) {
    _AppConfig.setConfig('31050', '12454fce5f83490f9498d2056d2c1d50');
    _HetDeviceSDK.accountAuth({
        success: suc,
        fail: err
    })
};
//绑定设备
function bindDevice(deviceId,mac,suc){
    _BluetoothCenter.connect(deviceId, mac, {
        success:suc
    })
}
//控制设备
function sendDevice(data,suc,err){
    wx.showLoading();
    _BluetoothCenter.control(data, {
        success:function(res){
            wx.hideLoading();
            suc(res);  
        },
        fail: function(res){
            wx.hideLoading();
            err(res);  
        }
    })
}

//获取蓝牙状态
function getBluetoothAdapterState(suc,err){
    wx.openBluetoothAdapter();
    wx.getBluetoothAdapterState({
        success: function (res) {
            console.log(res);
            suc(res)
        },
        fail:function(res) {
            err(res)
            console.log(res);
        }
    })
}

module.exports = {
    getDeviceData,
    removeListenDevice,
    _BluetoothCenter,
    _Bluetooth,
    scanDevice,
    accountAuth,
    bindDevice,
    sendDevice,
    getBluetoothAdapterState
}
