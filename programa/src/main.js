import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false

import './assets/css/styles.scss'
import Chartkick from 'vue-chartkick'
import Chart from 'chart.js'

new Vue({
    vuetify,
    render: h => h(App)
}).$mount('#app')

Vue.use(Chartkick.use(Chart))
