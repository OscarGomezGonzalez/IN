import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({

    theme: {
        themes: {
            light: {
                primary: '#323232',
                secondary: '#b0bec5',
                anchor: '#8c9eff',
            },
            dark: {
                primary: '#323232',
                secondary: '#b0bec5',
                anchor: '#8c9eff',
            }
        },
    },

});
