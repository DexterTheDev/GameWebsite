//Start the project...
let hmacSHA256 = require('crypto-js/hmac-sha256');

require("./dashboard/index");
let hashGenerator = (userId) => {
    return `${Math.floor(Date.now() / 1000)}:${hmacSHA256(`${Math.floor(Date.now() / 1000)}:${userId}`, "d2da9f140c687e72bc36eb5433342dfd342fdghfd232d7e61102b")}`
}
let RandomString = (length) => {
    var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    var b = [];
    for (var i = 0; i < length; i++) {
        var j = (Math.random() * (a.length - 1)).toFixed(0);
        b[i] = a[j];
    }
    return b.join("");
}
module.exports = {
    hashGenerator, RandomString
}