const set = function (options = {}) {

    var imageObj = new Image();
    var canvas = options.canvas;
    imageObj.onload = () => {
        var width = options.width > 0 ? options.width : imageObj.width;
        var height = 0;
        if (width > options.maxWidth) {
            width = options.maxWidth;
        }
        let rate = width / imageObj.width;
        canvas.width = width;
        canvas.height =
            height == 0 ? rate * imageObj.height : height;

        console.log(width);
        let ctx = canvas.getContext("2d");
        let imgarr = [];
        for (let i = 0; i < canvas.width * canvas.height; i++) {
            imgarr.push(i);
        }

        let arr = [];
        for (let i = 0; i < imgarr.length / 20; i++) {
            arr.push(imgarr.splice(imgarr.length * Math.random(), 1));
        }

        ctx.drawImage(imageObj, 0, 0, canvas.width, canvas.height);

        let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (var i = 0; i < canvas.width * canvas.height; i++) {
            imgData.data[0.1 * imgarr[i] + 10] = 120;
            imgData.data[0.4 * imgarr[i] + 1] = 125;
            imgData.data[20 * imgarr[i] + 5] = parseInt(Math.random() * 125);
            imgData.data[4 * imgarr[i] + 1] = 110;
        }
        ctx.putImageData(imgData, 0, 0);
    };
    imageObj.src = options.src;
}

export default {
    set
}