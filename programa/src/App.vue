<template>
    <v-app>
        <v-app-bar
                app
                color="primary"
                dark
        >
            <div class="d-flex align-center">
                <v-img
                        alt="Solaire Logo"
                        class="shrink mr-2"
                        contain
                        src="./assets/images/solaire.png"
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
                    href="https://github.com/OscarGomezGonzalez/IN/tree/master/programa"
                    target="_blank"
                    text
            >
                <span class="mr-2">GITHUB Project</span>
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
        menu: [
            {icon: "home", title: "Link A"},
            {icon: "info", title: "Link B"},
            {icon: "warning", title: "Link C"}
        ],

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
