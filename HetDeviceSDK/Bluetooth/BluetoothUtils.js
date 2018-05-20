module.exports = {
  ab2hex: ab2hex, // Buffer转16进制字符串
  HexStr2Buffer: HexStr2Buffer // 16进制字符串转buffer
}

// Buffer转16进制字符串
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}

// 16进制字符串转buffer
function HexStr2Buffer(HexStr) {
  var typedArray = new Uint8Array(HexStr.match(/[\da-f]{2}/gi).map(function (h) {
    return parseInt(h, 16)
  }))
  var buffer = typedArray.buffer
  return buffer;
}

// 16进制转字符串
function hexCharCodeToStr(hexCharCodeStr) {
  　　var trimedStr = hexCharCodeStr.trim();
  　　var rawStr =
    　　trimedStr.substr(0, 2).toLowerCase() === "0x"
      　　?
      　　trimedStr.substr(2)
      　　:
      　　trimedStr;
  　　var len = rawStr.length;
  　　if (len % 2 !== 0) {
    　　　　alert("Illegal Format ASCII Code!");
    　　　　return "";
  　　}
  　　var curCharCode;
  　　var resultStr = [];
  　　for (var i = 0; i < len; i = i + 2) {
    　　　　curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
    　　　　resultStr.push(String.fromCharCode(curCharCode));
  　　}
  　　return resultStr.join("");
}
