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
                        src="../assets/images/solaire.png"
                        class="my-3"
                        contain
                        height="200"
                />
                <h1 class="display-2 font-weight-bold mb-3">
                    Bienvenido a Solaire
                </h1>
                <v-form v-on:submit.prevent="importTxt">
                    <v-row>
                        <v-col cols="10">
                            <!--accept=".csv"-->
                            <v-file-input multiple v-model="chosenFiles" type="file" label="Seleccionar datos a cargar"
                                          dense></v-file-input>
                        </v-col>
                        <v-col cols="2">
                            <v-btn type="submit" rounded color="primary">Cargar datos</v-btn>
                        </v-col>
                    </v-row>
                </v-form>
                <v-progress-circular v-if="fileLoading" indeterminate
                                     color="blue"
                ></v-progress-circular>
                <v-alert type="error" v-if="error!=null">{{error}}</v-alert>
                <div v-if="filesData.length > 0">
                    <p>{{filesData.length}} dataset<span v-if="filesData.length>1">s</span> loaded</p>
                    <!--
                    <v-col cols="auto">
                        <v-card raised>
                            <v-card-title>File contents:</v-card-title>
                            <v-card-text v-bind:key="fileData.data" v-for="fileData in filesData">
                                <p v-if="fileData!=null">{{ fileData.data.length }}</p>
                                <v-alert type="warning" v-else>Error al cargar archivo</v-alert>
                            </v-card-text>
                        </v-card>
                    </v-col>
                    -->
                    <v-btn @click="Mean" rounded primary>Analizar</v-btn>
                    <p v-if="average !=null"></p>
                </div>
                <v-form>
                    <v-text-field label="Porcentaje(%)" v-model="porcentaje">70</v-text-field>
                    <h3>PANEL</h3>
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
    import Papa from 'papaparse'
    var { jStat } = require('jstat');
    function SplitByMonth(Array) {
        var retArray = [];
        var k = 0;
        var limit_end = k;
        for (var i = 0; i < 12 && k < Array.length; i++) {
            var compare_i = i + 1;
            if (i < 9) {
                compare_i = "0" + compare_i;
            }
            var cambio = "false";
            var num_elements = 0;
            for (var j = k; j < Array.length && cambio == "false"; j++) {
                try {
                    if (Array[j][0].split("/")[1] != compare_i) {
                        cambio = "true";
                        limit_end = j;
                    }
                    num_elements++;
                } catch (e) {
                    console.log(e);
                    console.log("indice j: " + j + "  Length de array en j:" + Array[j].length);
                    console.log(Array[j]);
                }

            }
            if (num_elements > 0) {
                if (cambio == "false") {
                    limit_end = Array.length + 1;
                }
                retArray[i] = Array.slice(k, limit_end);
            }
            k = limit_end;
        }
        return retArray
    }

    export default {
        name: 'HelloWorld',
        data: function () {
            return {
                panelMeters: 0.5,
                porcentaje: 70,
                panelKW: 1.3,
                chosenFiles: [],
                error: null,
                fileLoading: false,
                fileProgress: 0,
                filesData: [],
                dataStatistics: [],
                filesHeaders: [],
                fileSize: 0,
                average: null,
                indice: 0,
            }
        },
        methods: {
            Mean() {
                //const average = (...nums) => nums.reduce((acc, val) => acc + val, 0) / nums.length;


                //Debugging:
                console.log("probando map");
                var datas = this.filesData[0].map(function(val){
                    return val.map(function (arr){
                        return arr.slice(1).map(function (element){
                            return parseFloat(element);
                        });
                    });
                });

                console.log(datas);
                console.log("prueba de datas");
                for (var i = 0; i < this.filesData.length; i++) {
                    var medias = [];
                    for (var j = 0; j < 12; j++) {
                        var avg = jStat.mean(datas[i][j]);
                        medias.push(avg);
                    }
                }
                this.dataStatistics.push(medias);
            },
            LoadedData(data) {

                if (this.filesData.includes(data)) {
                    console.log("Error");
                    console.log(data)
                    this.fileLoading = false;
                    this.error = "Error al cargar datos"
                    return;
                }
                console.log("Tamaño antes de incluir data " + this.filesData.length)
                this.filesData.push(data);
                if (this.filesData.length == 1) {
                    this.filesHeaders = this.filesData[0].data[0].slice(1);
                }
                console.log("Tamaño despues de incluir data " + this.filesData.length
                    + "\nIndice: " + this.indice);
                console.log(this.filesData[this.indice].data.length);
                //This will filter the first row and first column of the matrix
                //Map will execute a function for every element of the array, and as it is a matrix we'll need to
                //indent a map inside a map function
                var newArray = this.filesData.map(function (val) {
                    //this will remove the first row and order based on date month
                    var orderedArray = val.data.slice(1).sort((a, b) => a[0].split("/")[1] - b[0].split("/")[1]);
                    //Splice array based in months
                    console.log(orderedArray.length);
                    console.log(orderedArray);
                    return SplitByMonth(orderedArray);
                    /**return val.data.slice(1).map(function (element) {
                        //this will remove the first column
                        //return element.slice(1);
                        return element.sort((a,b)=> b[0].split("/")[1] - a[0].split("/")[1]);
                    });
                     **/
                });
                this.filesData = newArray;
                this.fileLoading = false;
            },
            /**
             loadingBar(row) {
                var progress = row.indexes[0];
                var newPercent = Math.round(progress / this.fileSize * 100);
                if (newPercent === this.fileProgress) return;
                this.fileProgress = newPercent;
            },
             */
            importTxt() {

                if (this.chosenFiles.length == 0) {
                    this.error = "No File Chosen"
                } else {
                    this.error = null;
                }

                for (var i = 0; i < this.chosenFiles.length; i++) {
                    // Use the javascript reader object to load the contents
                    // of the file in the v-model prop

                    this.fileLoading = true;
                    this.fileSize = this.chosenFiles[i].size;
                    Papa.parse(this.chosenFiles[i],
                        {
                            complete: (results) => {
                                this.LoadedData(results);
                            },
                            /**
                             step: (row) => {
                                this.loadingBar(row);
                            }
                             */
                        });
                }
            }
        }
    }
</script>

