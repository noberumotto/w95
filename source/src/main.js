import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/index';
import messagebox from "./components/messagebox";
import folderdialog from "./components/folderdialog";

Vue.config.productionTip = false

Vue.prototype.$msgbox = messagebox;
Vue.prototype.$folderdialog = folderdialog;
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
