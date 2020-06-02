<template>
    <v-container>
        <v-row class="text-center">
            <v-col>
                <v-img
                        src="https://www.mairenainforma.es/wp-content/uploads/2015/03/torre.jpg"
                        class="my-3"
                        contain
                        height="700"
                />
            </v-col>
            <v-col>
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
                        <v-col cols="9">
                            <!--accept=".csv"-->
                            <v-file-input multiple v-model="chosenFiles" type="file" width="100%"
                                          label="Seleccionar datos a cargar"
                                          dense></v-file-input>
                        </v-col>
                        <v-col cols="3">
                            <v-btn type="submit" width="100%" rounded color="primary">Cargar</v-btn>
                        </v-col>
                    </v-row>
                </v-form>
                <v-progress-circular v-if="fileLoading" indeterminate
                                     color="blue"
                ></v-progress-circular>
                <v-alert type="error" v-if="error!=null">{{error}}</v-alert>
                <div v-if="filesData.length > 0">
                    <p>{{filesData.length}} dataset<span v-if="filesData.length>1">s</span> loaded</p>

                    <v-text-field label="Porcentaje(%)" v-model="porcentaje">70</v-text-field>

                    <v-btn @click="Analyze" rounded primary>Mostrar datos</v-btn>

                    <v-select v-if="dataMean.length > 0" :items="items" label="Elige el edificio"
                              v-model="buildingSelected"
                              v-on:change="ReloadGraph"></v-select>
                </div>
                <br>
            </v-col>

        </v-row>
        <div class="text-center" ref="content" id="pdf">
            <div v-if="dataMean.length > 0">
                <v-row>
                    <v-col/>
                    <v-col cols="10">
                        <line-chart v-if="buildingSelected != null && $vuetify.theme.dark === false"
                                    :data="dataSelected"
                                    :round="2"
                                    :curve="false"
                                    :colors="['red','orange','lightgreen','green']"
                                    suffix="Kw"
                        ></line-chart>
                        <line-chart v-if="buildingSelected != null && $vuetify.theme.dark === true"
                                    :data="dataSelected"
                                    :round="2"
                                    :curve="false"
                                    :colors="['red','orange','lightgreen','green']"
                                    suffix="Kw"
                        ></line-chart>

                        <v-divider></v-divider>
                    </v-col>
                    <v-col/>
                </v-row>
                <v-row/>
            </div>
        </div>
        <v-row v-if="this.buildingSelected != null">
            <v-col/>
            <v-col cols="10">
                <v-form>
                    <h3>PANEL</h3>
                    <v-text-field label="Vatios" v-model="panelW" value="400"></v-text-field>
                    <v-text-field label="Precio por panel(euros)" v-model="panelPrecio" value="100"></v-text-field>
                    <v-text-field label="Longitud del panel(mm)" v-model="panelLong" value="0.3">70</v-text-field>
                    <v-text-field label="Ancho del panel(mm)" v-model="panelAnc" value="0.3">70</v-text-field>
                    <v-text-field label="Altura del panel(mm)" v-model="panelAlt" value="0.3">70</v-text-field>
                    <v-row>
                        <v-col>
                            <v-btn @click="calcularPaneles" rounded primary>Calcular paneles</v-btn>
                        </v-col>
                        <v-col/>
                        <v-col>
                            <v-btn v-if="dataQuartiles.length > 0" @click="createPDF" rounded primary>PDF</v-btn>
                        </v-col>
                    </v-row>
                </v-form>
                <span v-if="this.cantidadPaneles>0">{{this.cantidadPaneles}}</span>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import Papa from 'papaparse'
    import jsPDF from 'jspdf'
    import html2canvas from 'html2canvas'

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
                dark: '#222',
                white: '#fff',
                error: null,
                panelLong: 2008,
                panelAnc: 1002,
                panelAlt: 40,
                panelPrecio: 168.58,
                panelPerdida10: 0.9,
                panelPerdida25: 0.8,
                panelTotalProducido10: [],
                panelTotalProducido25: [],
                UpoSol: [2.5, 3.7, 5.1, 6.2, 7.1, 7.9, 7.8, 7.1, 5.7, 4.2, 3, 2.4],
                UpoMedia: 5.225,
                porcentaje: 70,
                panelW: 400,
                cantidadPaneles: 0,
                chosenFiles: [],
                filesHeaders: [],
                fileLoading: false,
                fileProgress: 0,
                filesData: [],
                dataStatistics: [],
                dataQuartiles: [],
                dataMean: [],
                dataPercentiles: [],
                fileSize: 0,
                buildingSelected: null,
                items: [],
                monthsLabels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
                dataSelected: null,
                average: null,
                indice: 0,
            }

        },

        methods: {
            Analyze() {
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
                                //Por cada fila se elimina la fecha y se parsea a float.
                            });
                        });
                    });

                //Vamos a transponer los meses
                for (var el = 0; el < datas.length; el++) {
                    for (var m = 0; m < datas[el].length; m++) {
                        datas[el][m] = jStat.transpose(datas[el][m]);
                    }
                }
                var edificioMesPercentil = new Array(17);
                for (var i = 0; i < edificioMesPercentil.length; i++) {
                    edificioMesPercentil[i] = new Array(12);
                }
                var edificioMesQuartiles = new Array(17);
                for (i = 0; i < edificioMesQuartiles.length; i++) {
                    edificioMesQuartiles[i] = new Array(12);
                }

                var edificioMesMean = new Array(17);
                for (i = 0; i < edificioMesMean.length; i++) {
                    edificioMesMean[i] = new Array(12);
                }
                //Recorrido por cada edf
                for (i = 0; i < datas[0][0].length; i++) {
                    //por cada mes
                    for (var j = 0; j < datas[0].length; j++) {
                        var aux = [];
                        //recorrido por cada archivo
                        for (var k = 0; k < datas.length; k++) {
                            aux = aux.concat(datas[k][j][i]);
                        }
                        edificioMesPercentil[i][j] = jStat.percentile(aux, this.porcentaje / 100);
                        edificioMesQuartiles[i][j] = jStat.quartiles(aux);
                        edificioMesMean[i][j] = jStat.mean(aux);
                    }
                }

                this.dataPercentiles = this.dataPercentiles.concat(edificioMesPercentil);
                this.dataQuartiles = edificioMesQuartiles;
                this.dataMean = edificioMesMean;

            },

            ReloadGraph() {
                if (this.buildingSelected != null) {
                    var res = [];
                    var arrMean = this.dataMean[this.buildingSelected];
                    var arrPercentile = this.dataPercentiles[this.buildingSelected];
                    var resPercentile = this.createArray(this.monthsLabels, arrPercentile);
                    var resMean = this.createArray(this.monthsLabels, arrMean);
                    var auxDict = {name: "Media", data: resMean};
                    res.push(auxDict);
                    auxDict = {name: "Percentil " + this.porcentaje + "%", data: resPercentile};
                    res.push(auxDict);
                    if (this.cantidadPaneles > 0) {
                        var resPaneles10 = this.createArray(this.monthsLabels, this.panelTotalProducido10);
                        auxDict = {name: "Panel producido 10 años", data: resPaneles10};
                        res.push(auxDict);
                        var resPaneles25 = this.createArray(this.monthsLabels, this.panelTotalProducido25);
                        auxDict = {name: "Panel producido 25 años", data: resPaneles25};
                        res.push(auxDict);
                    }
                    //res data de mediana
                    this.dataSelected = res;
                }
            },

            createArray(vector1, vector2) {
                //asigna el valor a cada mes para poder mostrarlo en line-chart
                //nuevo array bidimensional vacio de 12x2
                var res = new Array(12);
                for (var i = 0; i < res.length; i++) {
                    res[i] = new Array(2);
                    //eje x
                    res[i][0] = vector1[i];
                    //eje y
                    res[i][1] = vector2[i];
                }


                return res;
            },

            LoadedData(data) {

                if (this.filesData.includes(data.data.slice(1))) {
                    this.error = "Dataset ya cargado"
                    return;
                }
                this.filesData.push(data);

                if (this.filesData.length == 1) {
                    var auxDict;
                    this.filesHeaders = this.filesData[0].data[0].slice(1);
                    //Creamos la variable items
                    for (var i = 0; i < this.filesHeaders.length; i++) {
                        auxDict = {text: this.filesHeaders[i], value: i};
                        this.items.push(auxDict)
                    }
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

            calcularPaneles() {
                this.cantidadPaneles = 0;
                //ajustamos la variable de Kw a W
                var cantidadAProducir = jStat.mean(this.dataPercentiles[this.buildingSelected]) * 1000;
                this.cantidadPaneles = Math.ceil(cantidadAProducir / (this.UpoMedia * this.panelPerdida25 * this.panelW));
                this.panelTotalProducido10 = new Array(12);
                this.panelTotalProducido25 = new Array(12);
                for (var j = 0; j < 12; j++) {
                    this.panelTotalProducido10[j] = (this.cantidadPaneles * this.panelW * this.panelPerdida10 * this.UpoSol[j]) / 1000;
                    this.panelTotalProducido25[j] = (this.cantidadPaneles * this.panelW * this.panelPerdida25 * this.UpoSol[j]) / 1000;
                }
                this.ReloadGraph();
            },
            /**
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