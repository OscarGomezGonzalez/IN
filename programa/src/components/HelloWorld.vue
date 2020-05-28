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
                    <div v-if="dataStatistics.length > 0">
                        <br>
                        <v-btn @click="createPDF" rounded primary>PDF</v-btn>
                    </div>
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
        <v-row class="text-center">
            <div ref="content">
                <div v-if="dataStatistics.length > 0">

                    <v-sparkline
                            :fill="true"
                            :line-width="2"
                            :padding="8"
                            :smooth="10 || false"
                            :value="[0, 2, 5, 9, 5, 10, 3, 5, 0, 0, 1, 8, 2, 9, 0]"
                            auto-draw
                    ></v-sparkline>

                    <v-divider></v-divider>


                </div>
            </div>
        </v-row>
    </v-container>
</template>
<script>
    import Papa from 'papaparse'
    import jsPDF from 'jspdf'
    // import html2canvas from 'hmtl2canvas';

    var {jStat} = require('jstat');

    function SplitByMonth(Array) {
        var retArray = [];
        var k = 0;
        var limit_end = k;
        for (var i = 0; i < 12 && k < Array.length; i++) {
            var compare_i = i + 1;
            if (i < 9) {
                compare_i = "0" + compare_i;
            }
            var cambio = false;
            var num_elements = 0;
            for (var j = k; j < Array.length && !cambio; j++) {
                try {
                    if (Array[j][0].split("/")[1] != compare_i) {
                        cambio = true;
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
                if (!cambio) {
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
                //Parseo de datos a float
                var datas =
                    this.filesData.map(function (datasets) {
                        //array por cada archivo
                        return datasets.map(function (val) {
                            // un array por cada dia
                            return val.map(function (arr) {
                                arr = arr.slice(1);
                                return arr.map(function (element) {
                                    return parseFloat(element);
                                })
                                //Por cada fila se elemina la fecha y se parsea a float.
                            });
                        });
                    });

                //Vamos a transponer los meses
                for(var el = 0; el < datas.length; el++){
                    for(var m = 0; m < datas[el].length; m++){
                        datas[el][m] = jStat.transpose(datas[el][m]);
                    }
                }

                console.log('Después de transponer los meses');
                console.log(datas);
                console.log('Has analizado ' + this.filesData.length + ' archivo/s.');

                //array de [edificio][mes]
                var edificioMes = new Array(17);
                for(var i = 0; i < edificioMes.length; i++){
                    edificioMes[i] = new Array(12);
                }

                for(el = 0; el < datas.length; el++){
                    var fin = false;
                    var eActual = 0;
                    while(!fin) { //mientras no hayamos acabado, seguimos iterando meses
                        for (m = 0; m < datas[el].length; m++) {
                            var enc = false;
                            for (var e = 0; e < datas[el][m].length && !enc; e++) {
                                if (e == eActual) { //si es el edificio que buscamos
                                    edificioMes[e][m] = jStat.mean(datas[el][m][e]); //calculamos la media para el edificio segun el mes
                                    enc = true;
                                }
                            }
                        }
                        eActual++;
                        if(eActual == 17){
                            fin = true;
                        }
                    }
                }

                console.log(edificioMes); //se muestra por consola
                this.dataStatistics.push(edificioMes); //lo almacenamos en la variable global
            },
            LoadedData(data) {

                if (this.filesData.includes(data.data.slice(1))) {
                    this.error = "Dataset ya cargado"
                    return;
                }
                this.filesData.push(data);

                if (this.filesData.length == 1) {
                    this.filesHeaders = this.filesData[0].data[0].slice(1);
                } else {
                    this.filesData[this.filesData.length - 1].data[0].slice(1);
                }

                var orderedArray = this.filesData[this.filesData.length - 1].data.slice(1)
                    .sort((a, b) => a[0].split("/")[1] - b[0].split("/")[1]);
                //Splice array based in months
                this.filesData[this.filesData.length - 1] = SplitByMonth(orderedArray);
                this.indice = this.indice + 1;
            },
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
                    Papa.parse(this.chosenFiles[i],
                        {
                            complete: (results) => {
                                this.LoadedData(results);
                                this.fileLoading = false
                            },
                            /**
                             step: (row) => {
                                this.loadingBar(row);
                            }
                             */
                        });

                }

                //This will filter the first row and first column of the matrix
                //Map will execute a function for every element of the array, and as it is a matrix we'll need to
                //indent a map inside a map function
                /**var newArray = this.filesData.map(function (val) {
                    //this will remove the first row and order based on date month
                    var orderedArray = val.data.slice(1).sort((a, b) => a[0].split("/")[1] - b[0].split("/")[1]);
                    //Splice array based in months
                    return SplitByMonth(orderedArray);
                });
                 this.filesData = newArray;
                 */
            },
            createPDF() {
                var fecha = new Date();
                var pdfName = "presupuesto Solaire " + fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear();
                var doc = new jsPDF();
                const contentHtml = this.$refs.content.innerHTML;
                doc.text(contentHtml, 10, 10);
                // doc.text(this.dataStatistics.toString(), 10, 10);
                doc.save(pdfName + '.pdf');
            },

            // createPDFCSS() {
            //     const doc = new jsPDF();
            //     /** WITH CSS */
            //     var canvasElement = document.createElement('canvas');
            //     html2canvas(this.$refs.content, {
            //         canvas: canvasElement
            //     }).then(function (canvas) {
            //         const img = canvas.toDataURL("image/jpeg", 0.8);
            //         doc.addImage(img, 'JPEG', 20, 20);
            //         doc.save("sample.pdf");
            //     });
            // },
        }
    }
</script>

