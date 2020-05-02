<template>
    <v-container>
        <v-row class="text-center">

            <v-col cols="6">
                <v-img
                        src="https://www.mairenainforma.es/wp-content/uploads/2015/03/torre.jpg"
                        class="my-3"
                        contain
                        height="700"
                />
            </v-col>
            <v-col cols="6">
                <v-img
                        src="https://i.pinimg.com/236x/b6/ae/59/b6ae59abb791ee9e536b50e464982744.jpg"
                        class="my-3"
                        contain
                        height="200"
                />
                <h1 class="display-2 font-weight-bold mb-3">
                    Welcome to Solaire
                </h1>
                <v-form>
                    <v-row>
                        <v-col cols="10">
                            <v-file-input label="Seleccionar datos a cargar" dense></v-file-input>
                        </v-col>
                        <v-col cols="2">
                            <v-btn rounded color="primary">Cargar datos</v-btn>
                        </v-col>
                    </v-row>
                </v-form>
                <v-form>
                    <v-text-field label="Porcentaje(%)" v-model="porcentaje">70</v-text-field>
                    <h3 >PANEL</h3>
                    <v-text-field label="KWatio" v-model="panelKW" value="1.3"></v-text-field>
                    <v-text-field label="MetrosPanel" v-model="panelMeters" value="0.3">70</v-text-field>
                </v-form>
            </v-col>


            <v-col class="mb-5" cols="12">


                <v-row justify="center">

                </v-row>
            </v-col>

            <v-col class="mb-5" cols="12">


                <v-row justify="center">

                </v-row>
            </v-col>

            <v-col class="mb-5" cols="12">
                <v-row justify="center">

                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    export default {
        name: 'HelloWorld',

        data: () => ({
            panelMeters: 0.5,
            porcentaje: 70,
            panelKW: 1.3,

        }),
    }
</script>
