<template>
    <v-app>
        <v-app-bar
                app
                color="primary"
                dark
        >
            <div class="d-flex align-center">
                <v-img
                        alt="Vuetify Logo"
                        class="shrink mr-2"
                        contain
                        src="https://cdn-prod.scalefast.com/public/assets/img/resized/bandai-namco-store-eu/7963e1ccb39f44bbb6c2e490775a487e_400_KR.png"
                        transition="scale-transition"
                        width="40"
                />

                <h1>Solaire</h1>
            </div>

            <v-spacer></v-spacer>

            <!-- theme switcher-->
            <div>
                <input type="checkbox" id='theme-switch' class='theme-switch' v-model="$vuetify.theme.dark"/>
                <label for='theme-switch'>
                         <span v-if="$vuetify.theme.dark === true">
                             <img alt="logo" src="./assets/images/moon.png" width="40">
                         </span>
                    <span v-else>
                             <img alt="logo" src="./assets/images/sun.png" width="40">
                         </span>
                </label>
            </div>

            <v-spacer></v-spacer>

            <v-btn
                    href="https://github.com/vuetifyjs/vuetify/releases/latest"
                    target="_blank"
                    text
            >
                <span class="mr-2">Latest Release</span>
                <v-icon>mdi-open-in-new</v-icon>
            </v-btn>
        </v-app-bar>

        <v-content>
            <HelloWorld/>
        </v-content>
    </v-app>
</template>

<script>
    import HelloWorld from './components/HelloWorld';

    export default {
        name: 'App',

        components: {
            HelloWorld,
        },

        data() {
            return {
                darkMode: false,
            }
        },
    };
</script>
