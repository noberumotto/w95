import Vue from 'vue'
import Folderdialog from './Folderdialog.vue'
import store from '../../store';
const vc = Vue.extend(Folderdialog)


function flolderdialog(options) {
    let t = new vc({
        propsData: options,
        store: store
    });
    t.$mount();

    document.body.appendChild(t.$el);
    t.remove = function () {
        document.body.removeChild(t.$el);
        t.$destroy()
    }
    return t;
}

export default flolderdialog