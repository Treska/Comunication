define(['qlik'],
    function (qlik) {
        return {
            initialProperties: {
				qHyperCubeDef: {
					qInitialDataFetch: [{
						qWidth: 9,
						qHeight: 50
					}]
				}
			},
			definition: {
				type: "items",
				component: "accordion",
				items: {
					dimensions: {
						uses: "dimensions",
						min: 0,
						max:0
					},
					measures: {
						uses: "measures",
						min: 1,
						max:20
                    },
                }
            },
            paint: function($element){
               
                var app = qlik.currApp();
                $element.find('#status').remove();
                $element.append('<div id="status"></div>');
                var JsonVariable =new Object;
                var appId = qlik.currApp().id;
                var retriveInformation = function(){
//                var url ="ws://localhost:4848/app/C%3A%5CUsers%5CInvestech%5CDocuments%5CQlik%5CSense%5CApps%5C____________minigrafico.qvf"   
                var url = "wss://nextlevelreporting-dev.enel.com/nlr-dev-adfs/app/"+appId;
                var ws = new WebSocket(url);
                // var opendoc = {
                //     "method": "OpenDoc",
                //     "handle": -1,
                //     "params": [
                //         "C:\\Users\\Investech\\Documents\\Qlik\\Sense\\Apps\\____________minigrafico.qvf"
                //     ],
                //     "outKey": -1,
                //     "id": 1,
                //     type:"open"
                // }
                var opendoc = {
                    "method": "OpenDoc",
                    "handle": -1,
                    "params": {
                        "qDocName": appId
                    },
                    "outKey": -1,
                    "id":1,
                    type:"open"
                    
                };
                var createSession = {
                    "method": "CreateSessionObject",
                    "handle": 1,
                    "params": [
                        {
                            "qInfo": {
                                "qType": "CurrentSelection"
                            },
                            "qSelectionObjectDef": {}
                        },
                        
                    ],
                    "outKey": -1,
                    "id": 2
                };

               
                var getLayout = {
                    "method": "GetLayout",
                    "handle": 2,
                    "params": [],
                    "outKey": -1,
                    "id": 3
                };
                ws.onmessage = function (event) {
                    
                    var msg = JSON.parse(event.data);
                    if(msg.method =="OnAuthenticationInformation"){
                    	JsonVariable.userId = msg.params.userId;
                    }

                  
                    switch(msg.id) {
                  
                      case 1:
                      
                      ws.send(JSON.stringify(createSession));
                      
                  
                      break;
                  
                      case 2:
                      ws.send(JSON.stringify(getLayout));
                      break;	 
                  
                  
                      case 3:
                        var appIdOld = localStorage.appId;
                        var sheetIdOld = localStorage.sheetId;
                        localStorage.appId =  appId;
                        localStorage.sheetId = qlik.navigation.getCurrentSheetId().sheetId;
                        var messageType = ((localStorage.appId == appIdOld && sheetIdOld == localStorage.sheetId) ? 'page_filters' : (localStorage.appId != appIdOld ? 'change_app' :(localStorage.sheetId !=sheetIdOld ? 'change_sheet' : 'page_filters')));


                    //   $('head').find('#EvaQlikVariable').append('var selectionAppId ="'+appId+'";');
                    //   $('head').find('#EvaQlikVariable').append('var selectionSheetId ="'+qlik.navigation.getCurrentSheetId().sheetId+'";');
                    //   console.log('app old:',selectionAppIdOld,' app:',appId);
                    //   console.log('sheet old:',selectionSheetIdOld,' sheet:',qlik.navigation.getCurrentSheetId().sheetId);
                    //  JsonVariable.userId ='';
                      JsonVariable.directory ='enelint';
                      JsonVariable.nodeId =''; // da chiedere cosa sia
                      JsonVariable.serviceProvider = 'Qlik';
                      JsonVariable.messageType = messageType;// ((selectionAppIdOld==undefined && selectionSheetIdOld ==undefined) ? 'page_filters' :(appId !=selectionAppIdOld ? "change_app" : qlik.navigation.getCurrentSheetId().sheetId != selectionSheetIdOld ? "change_sheet" : "page_filters"   ));
                      JsonVariable.appId = appId;
                      JsonVariable.sheetId = qlik.navigation.getCurrentSheetId().sheetId;
                      JsonVariable.filter = [];
                      msg.result.qLayout.qSelectionObject.qSelections.forEach(function(d){
                            var values = [];
                            
                            d.qSelectedFieldSelectionInfo.forEach(function(d){
                                values.push(d.qName)
                            });

                            var valuesAmount = (values.length == 1 ? 'single' : 'multiple');

                            JsonVariable.filter.push({
                                filterName:d.qField,
                                filterValues:{
                                    values:values,
                                    valuesAmount:valuesAmount,
                                    valuesType: "inclusive"
                                },
                                options: {
                                    otherOptions: {}
                                },
                                states: []
                    
                            })
                      });
                      
                      
                      $element.find('#status').append(JSON.stringify(JsonVariable));
                      console.log(JsonVariable);
                      var parentWindow = window.parent; 
                    /*  https://eva-dev.enelint.global/wildfly*/
                        parentWindow.postMessage(JsonVariable,'https://e-report-dev.enel.com/wildfly/');
                        parentWindow.postMessage(JsonVariable,'https://eva-dev.enelint.global/wildfly/');
                    //   parentWindow.postMessage(window.parent,"https://nextlevelreporting-dev.enel.com/nlr-dev-adfs/app/"+appId);

                      break;
                     
                       }
                    }
                    ws.onopen = function() {
                        ws.send(JSON.stringify(opendoc));
                        //console.log('apro la app');
                    }
                    
                     ws.onclose = function()
                                   { 
                                      // websocket is closed.
                                    //   console.log("Connessione chiusa..."); 
                                   };
                }
                retriveInformation();

                window.addEventListener("message", (event) => {
                    var selections = JSON.parse(event.data);
                    
                    qlik.navigation.gotoSheet(selections.sheetId);
                    
                    selections.filter.forEach(function(d){
                        var qField = d.filterName;
                        var value = d.filterValues.values;
                        app.field(qField).selectValues(value, false, true);
                    });


                    
                }, false);
            }
        }
});