const toString = function (length) {
    if (length < 1024) {
        return length + "字节";
    }
    else if (length < 1024 * 1000) {
        return (length / 1000).toFixed(2) + "KB";
    }
    else if (length < 1024 * 1024 * 1024) {
        return (length / 1024 / 1024).toFixed(2) + "MB";
    }
    else {
        return "未知";
    }
}

export default {
    toString
}