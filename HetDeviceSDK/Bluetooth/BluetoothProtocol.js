var _Utils = require('../Bluetooth/BluetoothUtils.js')

module.exports = {
  getCommand: getCommand,
  cmd_A020: cmd_A020,
  cmd_0020: cmd_0020,
  cmd_0040: cmd_0040,
  cmd_0041: cmd_0041,
  cmd_A041: cmd_A041,
  cmd_0037: cmd_0037,
  cmd_A037: cmd_A037,

  head: head, // 3a
  version: version,
  length: length
}

// 获取实时数据 0x0037(APP􏰁终端)
function cmd_0037() { return '0037' }

// 实时数据回复 0xA037(终端􏰁APP)
function cmd_A037() { return 'a037' }

// 状态数据 0xA041 (终端 –> APP)
function cmd_A041() { return 'a041' }

// 状态数据回复 0x0041(APP->终端)
function cmd_0041() { return '0041' }

// 控制命令 0x0040(APP􏰀终端)
function cmd_0040() { return '0040' }

// 认证请求指令 0xA020 (终端->APP) 2字节
function cmd_A020() { return 'a020' }

// 认证确认 0x0020(终端 < -APP)
function cmd_0020() { return '0020' }

// 起始标志 1字节
function head() { return '3a' }

// 协议版本号 1字节
function version() { return '01' }

// 数据长度 16进制
function length(buffer, add) {
  var allLength = add
  if (buffer) {
    allLength = buffer.byteLength + add
  }
  var buffer = new ArrayBuffer(2)
  var dataView = new DataView(buffer)
  dataView.setUint16(0, allLength)
  return _Utils.ab2hex(buffer)
}

// 获取命令
function getCommand(buffer) {
  return buffer.slice(4, 6);
}