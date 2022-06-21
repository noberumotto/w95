export default {
    namespaced: true,
    state: {
        id: '',//    访客Id
        isCheck: false,//    是否已确认
        windowList: [],//    窗口
        runAppList: [],//    打开的app列表
        shrotcutList: [],//  快捷方式列表
        recycleList: [],//   回收站数据
        isRecycleEmpty: false,
        isShutdown: false,// 关机
        diskData: [],//  硬盘数据
    },
    mutations: {
        update(state, payload) {
            for (let i in payload) {
                for (let j in state) {
                    if (i === j) {
                        state[j] = payload[i];
                    }
                }
            }
        }
    },
    actions: {
        set({ state, commit, dispatch, rootState }, data) {
            commit('update', data);


        },
        shutdown({ state, commit, dispatch, rootState }) {
            localStorage.removeItem('token');
            commit('update', {
                id: '',
                isCheck: false,
                isShutdown: true
            });
        },
        exitapp({ state, commit, dispatch, rootState }, data) {
            //  data = pid

            let runAppList = state.runAppList;
            runAppList.forEach((item, index) => {
                if (item.pid == data) {
                    // item.instance.exit();
                    runAppList.splice(index, 1);
                }
            });
            commit('update', {
                runAppList: runAppList
            });
        },
        setAppInstance({ state, commit, dispatch, rootState }, data) {
            let runAppList = state.runAppList;

            runAppList.forEach((item, index) => {
                if (item.pid == data.pid) {
                    item.instance = data.instance;
                }
            });
            commit('update', {
                runAppList: runAppList
            });
        },
        setAppWindow({ state, commit, dispatch, rootState }, data) {
            let runAppList = state.runAppList;

            runAppList.forEach((item, index) => {
                if (item.pid == data.pid) {
                    item.window = data.window;
                }
            });
            commit('update', {
                runAppList: runAppList
            });
        },
        updateRecycleList({ state, commit, dispatch, rootState }, data) {
            commit('update', {
                recycleList: data
            });

            window.localStorage.setItem(
                "berumotto_computer_recycle",
                JSON.stringify(data)
            );

            state.isRecycleEmpty = data.length == 0;
        },
        updateShrotcutList({ state, commit, dispatch, rootState }, data) {
            commit('update', {
                shrotcutList: data
            });

            var userList = [];
            data.forEach((item) => {
                if (item.id > 3) {
                    userList.push(item);
                }
            });

            window.localStorage.setItem(
                "berumotto_computer_data",
                JSON.stringify(userList)
            );
        },
    }
};