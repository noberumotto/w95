import store from "../store";

const run = function (options = { args: {} }) {

    let runAppList = store.state.client.runAppList;
    var name = options.app;
    var title = "";
    var icon = "";
    switch (options.app) {
        case "Folder":
            title = options.args.title;
            icon = "folder_open";
            break;
        case "IE":
            title = "Internet Explorer";
            icon = "link";
            break;
        case "Recycle":
            title = "回收站";
            icon = "recycle";
            break;
        case "Find":
            title = "查找";
            icon = "findapp";
            break;
        case "Photos":
            icon = "photos";
            title = options.args.title;
            break;
        case "Word":
            icon = "word";
            title = options.args.title;
            break;
        case "Notepad":
            icon = "txt";
            title = options.args.title;
            break;
    }

    runAppList.push({
        pid: this.generateAppID(),
        name: name,
        title: title,
        active: true,
        icon: icon,
        args: options.args,
        instance: {},
        window: {},
    });

    store.dispatch("client/set", {
        runAppList: runAppList,
    });
}



const generateAppID = function () {
    let runAppList = store.state.client.runAppList;
    let maxPid = 0;
    runAppList.forEach((element) => {
        maxPid = element.pid > maxPid ? element.pid : maxPid;
    });
    return maxPid + 1;
}

export default {
    run,
    generateAppID
}