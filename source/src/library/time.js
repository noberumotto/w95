

/**
 * 格式化日期
 * @param {Date|String} time 日期
 * @param {String} parseStr 格式化（y:年,m:月,d:日,h:时,i:分,s:秒），默认:y-m-d h:i
 * @returns {String}
 */
const toString = function (time = undefined, parseStr = "y-m-d h:i") {
    let date = time ? time : new Date();
    if (typeof (date) != Date) {

        date = date.toString().length == 10 ? date * 1000 : date;

        date = new Date(date);
    }

    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    parseStr = parseStr.replace("y", year);
    parseStr = parseStr.replace("m", month);
    parseStr = parseStr.replace("d", day);
    parseStr = parseStr.replace("h", hours);
    parseStr = parseStr.replace("i", minutes);
    parseStr = parseStr.replace("s", seconds);

    return parseStr;
}

export default {
    toString,
}