define(['qlik'],
    function (qlik) {

        async function getUser(){
            let promise = new Promise((res, rej) => {
              res(qlik.getGlobal().getAuthenticatedUser().then(x=> {return x}));
          });
           // wait until the promise returns us a value
            let result = await promise;

            return result;

        };

        return {
            initialProperties: {
                liste: {
                    uno: {
                        qListObjectDef: {
                            qShowAlternatives: true,
                            //qFrequencyMode: "V",
                            qInitialDataFetch: [{
                                qWidth: 3,
                                qHeight: 20
                            }],
                            qSortByState: 0,
                        },
                    },
                    due: {
                        qListObjectDef: {
                            qShowAlternatives: true,
                            //qFrequencyMode: "V",
                            qInitialDataFetch: [{
                                qWidth: 3,
                                qHeight: 20
                            }],
                            qSortByState: 0,
                        },
                    },
                    tre: {
                        qListObjectDef: {
                            qShowAlternatives: true,
                            //qFrequencyMode: "V",
                            qInitialDataFetch: [{
                                qWidth: 3,
                                qHeight: 20
                            }],
                            qSortByState: 0,
                        },
                    },
                    quattro: {
                        qListObjectDef: {
                            qShowAlternatives: true,
                            //qFrequencyMode: "V",
                            qInitialDataFetch: [{
                                qWidth: 3,
                                qHeight: 20
                            }],
                            qSortByState: 0,
                        },
                    },
                    cinque: {
                        qListObjectDef: {
                            qShowAlternatives: true,
                            //qFrequencyMode: "V",
                            qInitialDataFetch: [{
                                qWidth: 3,
                                qHeight: 20
                            }],
                            qSortByState: 0,
                        },
                    },
                    sei: {
                        qListObjectDef: {
                            qShowAlternatives: true,
                            //qFrequencyMode: "V",
                            qInitialDataFetch: [{
                                qWidth: 3,
                                qHeight: 20
                            }],
                            qSortByState: 0,
                        },
                    },
                    sette: {
                        qListObjectDef: {
                            qShowAlternatives: true,
                            //qFrequencyMode: "V",
                            qInitialDataFetch: [{
                                qWidth: 3,
                                qHeight: 20
                            }],
                            qSortByState: 0,
                        },
                    },
                },
                variableValue: {},
                maxLimitvariableValue: {},
            },
                definition: {
                	type: "items",
                	component: "accordion",
                	items: {
                		dim: {
                			type: "items",
                			label: "Dim",
                			ref: "liste.uno.qListObjectDef",
                			min: 0,
                			max: 2,
                			items: {
                				field: {
                					type: "string",
                					expression: "optional",
                					expressionType: "dimension",
                					ref: "liste.uno.qListObjectDef.qDef.qFieldDefs.0",
                					label: "Field or variable name",
                					// show: function ( data ) {
                					// 	return data.qListObjectDef && !data.qListObjectDef.qLibraryId;
                					// },
                			},
                        },
                    },
                        dim2: {
                			type: "items",
                			label: "Dim2",
                			ref: "liste.due.qListObjectDef",
                			min: 0,
                			max: 2,
                			items: {
                				field: {
                					type: "string",
                					expression: "optional",
                					expressionType: "dimension",
                					ref: "liste.due.qListObjectDef.qDef.qFieldDefs.0",
                					label: "Field or variable name",
                					// show: function ( data ) {
                					// 	return data.qListObjectDef && !data.qListObjectDef.qLibraryId;
                					// },
                			},
                        },
                    },
            },
        },
            paint: function ($element, layout) {

                /**
                 * Inizializzazioni delle variabili
                 */

                var app = qlik.currApp();
                var JsonToSend =new Object;

                /**
                 * Conservo le informazioni delle variabili appId e sheetId contenute nel localStorage
                 * in variabili di appoggio per confrontare cambiamenti rispetto all'ultima esecuzione
                 */

                var appIdOld = localStorage.appId;
                var sheetIdOld = localStorage.sheetId;
                localStorage.appId =  qlik.currApp().id;
                localStorage.sheetId = qlik.navigation.getCurrentSheetId().sheetId;
                var messageType;
                
                /**
                 * Casistiche:
                 *  1) appId precedente  uguale ad appId corrente e Sheetid precedente uguale al precedente
                 *     messaggio = page_filters
                 *  2) appId corrente diverso da quello precedente
                 *     messaggio = change_app
                 *  3) sheetId corrente diverso da quello precedente
                 *     messageType =  'change_sheet';
                 *  4) tutti gli altri casi si tratta di cambio filtri e quindi il messaggio è 
                 *     messageType =  'page_filters';
                 */

                if(localStorage.appId == appIdOld && sheetIdOld == localStorage.sheetId){
                    messageType = 'page_filters';
                } else if (localStorage.appId != appIdOld) {
                    messageType = 'change_app';
                } else if (localStorage.sheetId !=sheetIdOld){
                    messageType =  'change_sheet';
                } else {
                    messageType =  'page_filters';
                }

                /**
                 * costruzione array dei filtri partendo dalle singole liste
                 */

                var liste = layout.liste;
                for( var element in liste){
                    if(liste[element].qListObject.qDataPages.length !== 0) {
                        var newObj = new Object;
                        newObj.filterName = liste[element].qListObject.qDimensionInfo.qFallbackTitle;
                        var newArray =[];
                        liste[element].qListObject.qDataPages[0].qMatrix.forEach(x => {
                            newArray.push((x.qState ==="S" ? x.qText)
                        });
                        console.log(newArray);
                    }
                }
                var filters = [];

                // liste.forEach(element => {
                //     if(element.qListObject.qDataPages.length !== 0){
                //         var newObj = new Object;
                //         newObj.filterName = element.qListObject.qDimensionInfo.qFallbackTitle;
                        
                //         var newArray =element.qListObject.qDataPages[0].qMatrix.map(x => x.qState == 'S');
                //         console.log(newArray);
                //     }
                // });
              
                var directory = 'enelint';
                var nodeId = '';
                var serviceProvider = 'Qlik';

                
                /**
                 * costruzione del json da inviare tramite postMessage
                 * 
                 */
                getUser().then(user => {JsonToSend.userId = user.qReturn;})
                        .then(() => JsonToSend.appId =localStorage.appId) 
                        .then(() => JsonToSend.messageType = messageType)
                        .then(() => JsonToSend.directory =directory)
                        .then(() => JsonToSend.nodeId =nodeId)
                        .then(() => JsonToSend.serviceProvider = serviceProvider)
                        .then(() => JsonToSend.sheetId= localStorage.sheetId)
                        ;

               



            }
        }
    });