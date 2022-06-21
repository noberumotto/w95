import Vue from 'vue'
import MessageBox from './MessageBox.vue'
import store from '../../store';
const vc = Vue.extend(MessageBox)


function messagebox(options) {
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

export default messagebox