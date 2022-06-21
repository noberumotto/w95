#!/usr/bin/env node

const path = require('path');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');

//  磁盘数据
const dataFolderPath = path.join(process.cwd(), "src", "data");
const dataJsonPath = path.join(process.cwd(), "src", "data", "data.json");

//  磁盘所有文件
const dataFilesJsonPath = path.join(process.cwd(), "src", "data", "files.json");

//  磁盘目录
const diskDir = path.join(process.cwd(), "src", "disk");

global.appRoot = path.resolve(__dirname);


var data = [];

var files = [];

console.log("开始构建磁盘信息");

if (!fs.existsSync(dataFolderPath)) {
    fs.mkdirSync(dataFolderPath);
}

//  获取磁盘
if (!fs.existsSync(diskDir)) {
    console.log("创建默认磁盘 C:");
    //  创建目录
    fs.mkdirSync(diskDir);

    //  创建默认磁盘C
    let diskC = path.join(diskDir, "C");
    fs.mkdirSync(diskC);

    let diskCIndexFile = path.join(diskC, "index.json");
    let indexModel = {
        name: "本地磁盘"
    };

    console.log(indexModel);

    fs.writeFile(diskCIndexFile, JSON.stringify(indexModel), function (err) {
        if (err) {
            return console.error(err);
        }
    });
}


if (!fs.existsSync(dataJsonPath)) {
    fs.writeFile(dataJsonPath, JSON.stringify([]), function (err) {
        if (err) {
            return console.error(err);
        }
    });
}

if (!fs.existsSync(dataFilesJsonPath)) {
    fs.writeFile(dataFilesJsonPath, JSON.stringify([]), function (err) {
        if (err) {
            return console.error(err);
        }
    });
}


const disks = fs.readdirSync(diskDir)

disks.forEach(function (disk) {
    var diskModel = scanFiles(disk);
    data.push(diskModel);
})


fs.writeFile(dataJsonPath, JSON.stringify(data), function (err) {
    if (err) {
        return console.error(err);
    }
});

fs.writeFile(dataFilesJsonPath, JSON.stringify(files), function (err) {
    if (err) {
        return console.error(err);
    }
});


function scanFiles(disk) {
    var info = fs.readFileSync(path.join(diskDir, disk, 'index.json')).toString();
    if (info.length == 0) {
        info = {
            name: disk.toUpperCase()
        };
    }
    else {
        info = JSON.parse(info);
    }
    var diskName = info.name + " (" + disk.toUpperCase() + ":)";
    return {
        icon: "disk",
        name: diskName,
        app: "Folder",
        type: "disk",
        args: {
            location: disk.toUpperCase() + ":\\",
            title: diskName,
            data: getFiles(disk)
        }
    };


}

function getFiles(dir) {
    var diskFiles = fs.readdirSync(path.join(diskDir, dir));

    //  移除描述文件
    var index = diskFiles.indexOf("index.json");
    if (index != -1) {
        diskFiles.splice(diskFiles.indexOf("index.json"), 1);
    }
    var result = [];
    diskFiles.forEach((file) => {
        var fileModel = {};


        var splitChar = "\\";
        if (os.type() == "Linux") {
            splitChar = "/";
        }
        var disk = dir.split(splitChar)[0].toUpperCase();
        var folder = dir.split(splitChar)[1];

        var location = "";
        if (folder) {
            location = path.join(location, folder);
        }
        if (fileModel.type == "folder") {
            location = path.join(location, file);
        }

        location = location.replace(/\//g, "\\");
        location = disk + ":\\" + location;


        if (file.indexOf(".") != -1) {

            //  文件
            var fileExtArr = file.split(".");

            var fileExt = fileExtArr[fileExtArr.length - 1];
            fileModel.name = fileExtArr[0];


            // var data = fileExt == "webimg" ? fs.readFileSync(path.join(diskDir, dir, file)).toString() : path.join("disk", dir, file).replace(/\\/g, "/");
            var data = path.join("disk", dir, file).replace(/\\/g, "/");
            //  文件大小
            var fileSizeInBytes = -1;

            var createTime = 0;
            var updateTime = 0;

            var stats = fs.statSync(path.join(diskDir, dir, file))

            if (fileExt != "webimg") {
                fileSizeInBytes = stats.size;
            }

            //  文件时间
            createTime = parseInt(stats.birthtimeMs / 1000);
            updateTime = parseInt(stats.mtimeMs / 1000);



            fileModel.args = {
                title: fileExtArr[0],
                subtitle: fileExtArr[0],
                data: data,
                size: fileSizeInBytes,
                createTime: createTime,
                updateTime: updateTime,
            };

            switch (fileExt) {
                case "md":
                    fileModel.type = "word";
                    fileModel.app = "Word";
                    break;
                case "jpg":
                case "webimg":
                case "png":
                    fileModel.type = "photo";
                    fileModel.app = "Photos";
                    break;
                case "txt":
                    fileModel.type = "txt";
                    fileModel.app = "Notepad";
                    break;
            }
        }
        else {
            //  目录
            fileModel.type = "folder";
            fileModel.name = file;
            fileModel.app = "Folder";
            fileModel.args = {
                title: file,
                data: getFiles(path.join(dir, file))
            };
        }

        if (JSON.stringify(fileModel) !== "{}") {



            fileModel.args = Object.assign({
                location: location
            }, fileModel.args)

            if (fileExt == "webimg") {
                fileModel.args.location = fs.readFileSync(path.join(diskDir, dir, file)).toString();
            }

            if (fileModel.type != "folder") {
                files.push(fileModel);
            }

            console.log(fileModel);

            result.push(fileModel);
        }
    });
    return result;
}