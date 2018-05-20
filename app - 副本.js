//app.js
let _AppConfig = require('./HetDeviceSDK/Config/AppConfig.js');
let _HetDeviceSDK = require('./HetDeviceSDK/Public/Public.js');
_AppConfig.setConfig('31050', '12454fce5f83490f9498d2056d2c1d50');
_HetDeviceSDK.accountAuth({
    success: function (res) {

        console.log('成功:', res)
    },
    fail: function (res) {
        console.log('失败:', res)
    }
})
App({
    onShow() {
        // this.startConnect();
    },
    onLaunch: function () {
        // 展示本地存储能力
        var logs = wx.getStorageSync('logs') || []
        logs.unshift(Date.now())
        wx.setStorageSync('logs', logs)

        // 登录
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
            }
        })
        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    // wx.getUserInfo({
                    //     success: res => {
                    //         // 可以将 res 发送给后台解码出 unionId
                    //         this.globalData.userInfo = res.userInfo

                    //         // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                    //         // 所以此处加入 callback 以防止这种情况
                    //         if (this.userInfoReadyCallback) {
                    //             this.userInfoReadyCallback(res)
                    //         }
                    //     }
                    // })
                }
            }
        })
    },
    globalData: {
        sourceCtrlData: { "Clearingmode": 0, "ONOFF": 0, "Sitandleave": 0, "USERS": 0, "seattemp": 0, "Seattemponoff": 0, "Windtemp": 0, "Tunbuwatertemp": 0, "malewatertemp": 0, "tunbuwaterpress": 0, "hotandcoolpress": 0, "tubuweizhi": 0, "lereweizhi": 0, "nvxingshuiya": 0, "jingqishuiya": 0, "nvxingweizhi": 0, "jingqiweizhi": 0, "runchangweizhi": 0, "SetFW1": 0, "SettunbuWaterTp1": 0, "SetwomenWaterTP1": 0, "Settunbushuiya1": 0, "Setlengreshuiya1": 0, "Settubuweizhi1": 0, "Setlengreweizhi1": 0, "Setwomenshuiya1": 0, "Setjingqishuiya1": 0, "Setwomenweizhi1": 0, "Setjingqiweizhi1": 0, "Setrunchangweizhi1": 0, "SetFw2": 0, "Settunbushuiwen2": 0, "Setnvxingshuiwen2": 0, "Settubushuiya2": 0, "Setlengreshuiya2": 0, "Settubuweizhi2": 0, "Setlengreweizhi2": 0, "Setnvxingshuiya2": 0, "Setjingqishuiya2": 0, "Setnvxingweizhi2": 0, "Setjingqiweizhi2": 0, "Setrunchangweizhi2": 0, "jienengonoff": 0, "zhaomkaiguan": 0, "zuogaikaiguan": 0, "zuoquankaiguan": 0, "chuchou": 0, "Recoverstart": 0, "baoliu1": 0, "Baoliu2": 0, "baoliu3": 0 },
    },
    startConnect: function () {
        var that = this;
        wx.showLoading({
            title: '开启蓝牙适配'
        });
        wx.openBluetoothAdapter({
            success: function (res) {
                console.log("初始化蓝牙适配器");
                console.log(res);
                that.getBluetoothAdapterState();
            },
            fail: function (err) {
                console.log(err);
                wx.showToast({
                    title: '蓝牙初始化失败',
                    icon: 'success',
                    duration: 2000
                })
                setTimeout(function () {
                    wx.hideToast()
                }, 2000)
            }
        });
        wx.onBluetoothAdapterStateChange(function (res) {
            var available = res.available;
            if (available) {
                that.getBluetoothAdapterState();
            }
        })
    },
    getBluetoothAdapterState: function () {

        var that = this;

        wx.getBluetoothAdapterState({

            success: function (res) {

                var available = res.available,

                    discovering = res.discovering;

                if (!available) {

                    wx.showToast({

                        title: '设备无法开启蓝牙连接',

                        icon: 'success',

                        duration: 2000

                    })

                    setTimeout(function () {

                        wx.hideToast()

                    }, 2000)

                } else {

                    if (!discovering) {

                        that.startBluetoothDevicesDiscovery();

                        that.getConnectedBluetoothDevices();

                    }

                }

            }

        })

    },
    startBluetoothDevicesDiscovery: function () {

        var that = this;

        wx.showLoading({

            title: '蓝牙搜索'

        });

        wx.startBluetoothDevicesDiscovery({

            services: [],

            allowDuplicatesKey: false,

            success: function (res) {

                if (!res.isDiscovering) {

                    that.getBluetoothAdapterState();

                } else {

                    that.onBluetoothDeviceFound();

                }

            },

            fail: function (err) {

                console.log(err);

            }

        });

    },
    getConnectedBluetoothDevices: function () {

        var that = this;

        wx.getConnectedBluetoothDevices({

            services: [that.serviceId],

            success: function (res) {

                console.log("获取处于连接状态的设备", res);

                var devices = res['devices'], flag = false, index = 0, conDevList = [];

                devices.forEach(function (value, index, array) {

                    if (value['name'].indexOf('FeiZhi') != -1) {

                        // 如果存在包含FeiZhi字段的设备

                        flag = true;

                        index += 1;

                        conDevList.push(value['deviceId']);

                        that.deviceId = value['deviceId'];

                        return;

                    }

                });

                if (flag) {

                    this.connectDeviceIndex = 0;

                    that.loopConnect(conDevList);

                } else {

                    if (!this.getConnectedTimer) {

                        that.getConnectedTimer = setTimeout(function () {

                            that.getConnectedBluetoothDevices();

                        }, 5000);

                    }

                }

            },

            fail: function (err) {

                if (!this.getConnectedTimer) {

                    that.getConnectedTimer = setTimeout(function () {

                        that.getConnectedBluetoothDevices();

                    }, 5000);

                }

            }

        });

    },
    onBluetoothDeviceFound: function () {

        var that = this;

        console.log('onBluetoothDeviceFound');

        wx.onBluetoothDeviceFound(function (res) {

            console.log('new device list has founded')

            console.log(res);

            if (res.devices[0]) {

                var name = res.devices[0]['name'];

                if (name != '') {

                    if (name.indexOf('FeiZhi') != -1) {

                        var deviceId = res.devices[0]['deviceId'];

                        that.deviceId = deviceId;

                        console.log(that.deviceId);

                        that.startConnectDevices();

                    }

                }

            }

        })

    },
    startConnectDevices: function (ltype, array) {

        var that = this;

        clearTimeout(that.getConnectedTimer);

        that.getConnectedTimer = null;

        clearTimeout(that.discoveryDevicesTimer);

        that.stopBluetoothDevicesDiscovery();

        this.isConnectting = true;

        wx.createBLEConnection({

            deviceId: that.deviceId,

            success: function (res) {

                if (res.errCode == 0) {

                    setTimeout(function () {

                        that.getService(that.deviceId);

                    }, 5000)

                }

            },

            fail: function (err) {

                console.log('连接失败：', err);

                if (ltype == 'loop') {

                    that.connectDeviceIndex += 1;

                    that.loopConnect(array);

                } else {

                    that.startBluetoothDevicesDiscovery();

                    that.getConnectedBluetoothDevices();

                }

            },

            complete: function () {

                console.log('complete connect devices');

                this.isConnectting = false;

            }

        });

    },
    getService: function (deviceId) {

        var that = this;

        // 监听蓝牙连接

        wx.onBLEConnectionStateChange(function (res) {

            console.log(res);

        });

        // 获取蓝牙设备service值

        wx.getBLEDeviceServices({

            deviceId: deviceId,

            success: function (res) {

                that.getCharacter(deviceId, res.services);

            }

        })

    },
    getCharacter: function (deviceId, services) {

        var that = this;

        services.forEach(function (value, index, array) {

            if (value == that.serviceId) {

                that.serviceId = array[index];

            }

        });

        wx.getBLEDeviceCharacteristics({

            deviceId: deviceId,

            serviceId: that.serviceId,

            success: function (res) {

                that.writeBLECharacteristicValue(deviceId, that.serviceId, that.characterId_write);

                that.openNotifyService(deviceId, that.serviceId, that.characterId_read);

            },

            fail: function (err) {

                console.log(err);

            },

            complete: function () {

                console.log('complete');

            }

        })

    },
    loopConnect: function (devicesId) {

        var that = this;

        var listLen = devicesId.length;

        if (devicesId[this.connectDeviceIndex]) {

            this.deviceId = devicesId[this.connectDeviceIndex];

            this.startConnectDevices('loop', devicesId);

        } else {

            console.log('已配对的设备小程序蓝牙连接失败');

            that.startBluetoothDevicesDiscovery();

            that.getConnectedBluetoothDevices();

        }

    },
})