(function (CS) {
	var definition = {
	    typeName: 'sendvalue',
	    datasourceBehavior:  CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
		visObjectType: symbolVis,
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/Update.png',
	    getDefaultConfig: function() {			
	    	return {
	    		DataShape: 'TimeSeries',
		        Height: 50,
		        Width: 450,
				defaultTimestamp: '*'
			};
		},
	    configOptions: function () {
	        return [{
	            title: 'Format Symbol',
	            mode: 'format'
	        }];
	    },
        inject: ['$http']
	};
    
    
	function symbolVis() { }
	CS.deriveVisualizationFromBase(symbolVis);
		
	symbolVis.prototype.init = function (scope, elem, $http){
	console.log("SCOPE");
		console.log(scope);
		
		
		this.onDataUpdate = dataUpdate;
	    
		function dataUpdate(data) {
		
	        if(data) {
	            if(data.Data[0].Label) {
					//get Data Streams configuration from the data object provided by PI Coresight data layer
					scope.dataStreamList = data.Data;
        			console.log(scope.dataStreamList);
	            }
	        }
	    };
		
		//		scope.dataStreamList = scope.symbol.DataSources;
		scope.isStreamSelectedList = {};
		scope.config.submittedData = {};
		scope.config.submittedData.timestamps = _.range(3).fill(scope.config.defaultTimestamp);
		
		scope.areAnyStreamsSelected = false;

		
		var baseUrl = CS.ClientSettings.PIWebAPIUrl.replace(/\/?$/, '/'); //Example: "https://arcadia.osisoft.int/piwebapi/";
		console.log("baseUrl");
		console.log(baseUrl);
		
		scope.inputType = {};
		scope.isEnumerationType = {};
		scope.enumerationOptions= {};
		var TYPES = {
			Single: "Number",
			Double: "Number",
			Int16: "Number",
			Int32: "Number",
			Int64: "Number",
			String: "String",
			EnumerationValue: "String", //String for now, but should be handled specially
			Boolean: "Boolean"
			
		};
		
		
	   scope.sendValue = function(){
		   
		    //Send data only if we have the following:
			//scope.config.submittedData - WHAT to send 
			//dataStreamList - WHERE to send
			//AnyStreamsSelected - confirmation from user 
           if(scope.config.submittedData && scope.dataStreamList && anyStreamsSelected()){
               
				//Form a batch request to send to PI Web API
				//TODO = example of batch request
				var batchRequest = formBulkSendRequest(scope.dataStreamList,scope.config.submittedData);
				console.log(batchRequest);
				
				//Send batch request to PI Web API endpoint
				$http({
					url: baseUrl + "batch" ,
					method: "POST",
					data: batchRequest,
					withCredentials: true,
					headers: {
						'Content-Type': 'application/json',
					}
				});     
     
                
			}
        
	   };
	   
		scope.toggleAll = function(){
			var toggleValue = scope.config.isAllSelected;
			
			scope.dataStreamList.forEach(function(dataItem, index){
				scope.isStreamSelectedList[index] = toggleValue;
			});
			
		};
		
		scope.cbSelectionUpdate = function(){
			
			scope.config.isAllSelected = scope.dataStreamList.every(function(dataItem, index){	
					return(scope.isStreamSelectedList[index])
			 });
			 scope.areAnyStreamsSelected  = anyStreamsSelected();
		};
		

		
		scope.getType = function(index){
			
			if(scope.dataStreamList)
			{
				var itemPath = scope.dataStreamList[index].Path;
				
				var getAttributesURL = baseUrl + "attributes?path=" + itemPath;
				
				
				$http.get(getAttributesURL).success(function(response){
						//General case
						scope.inputType[index] = TYPES[response.Type];
						
						
						//Attribute with Enumeration Set Value type case
						if (response.Type == "EnumerationValue")
						{	
							scope.isEnumerationType[index] = true; 
													
							var batchRequest = {
								"EnumSetConfig" : {
									"Method": "GET",
									"Resource": response.Links.EnumerationSet
								},
								"EnumSetValues" : {
									"Method": "GET",
									"Resource": "{0}",
									"ParentIds": [
										"EnumSetConfig"
									],
									"Parameters": [
										"$.EnumSetConfig" + ".Content.Links.Values"
									]
								}
							}
							
							$http({
								url: baseUrl + "batch" ,
								method: "POST",
								data: JSON.stringify(batchRequest),
								withCredentials: true,
								headers: {
									'Content-Type': 'application/json',
								}
							}).success(function(enumSet){
								
								scope.enumerationOptions[index] = enumSet.EnumSetValues.Content.Items;
								
							});    
							
						}
						else
						{	scope.isEnumerationType[index] = false;}
						
						
						
						
				});
					
				
				
			}
			
		};
			
		
		anyStreamsSelected = function(){
			
			return scope.dataStreamList.some(function(dataItem, index){	
					return(scope.isStreamSelectedList[index])
			 })
			
		};
		
		

		formBulkSendRequest = function(dataStreamList, submittedData) {
			
			var batchRequest = {};
			dataStreamList.forEach(function(dataStream, index){
					
					//skip Data Streams that are not selected
					if(!scope.isStreamSelectedList[index])
						return;

					var itemPath = dataStream.Path;
					
					
					var streamInfoUrl = itemPath.includes("|") ? encodeURI(baseUrl + "attributes?path=" + itemPath + "&selectedFields=Links.Value") : encodeURI(baseUrl + "points?path=" + itemPath + "&selectedFields=Links.Value");
					
					
					var data = {
                        "Timestamp": submittedData.timestamps[index],
                        "Value": scope.isEnumerationType[index] ? submittedData.values[index].Name : submittedData.values[index]
					};
					
					batchRequest["GetStreamInfo" + index.toString()] = {
						"Method": "GET",
						"Resource": streamInfoUrl
					}
					batchRequest["PostValue" + index.toString()] = {
								"Method": "POST",
								"Resource": "{0}",
								"Content": JSON.stringify(data),
								"Headers": {
									'Content-Type': 'application/json'
								},
								"ParentIds": [
									"GetStreamInfo" + index.toString()
								],
								"Parameters": [
									"$.GetStreamInfo" + index.toString() + ".Content.Links.Value"
								]
						
					}
				
				});		   
		
			return JSON.stringify(batchRequest);
		};

		
		scope.config.SendBtnStyles = {
			disabled: {
				'cursor': 'not-allowed',
				'opacity':'0.65',
				'background-color': '#239a23',
				'border': '1px solid rgba(230,231,232,.55)',
				'color': '#fff',
				'width': '80px',
				'height': '26px',
				'text-shadow': '0 -1px 0 rgba(0,0,0,.25)',
				'margin-left': 'auto'
				},
			general: {
				'background-color': '#239a23',
				'border': '1px solid rgba(230,231,232,.55)',
				'color': '#fff',
				'width': '80px',
				'height': '26px',
				'text-shadow': '0 -1px 0 rgba(0,0,0,.25)',
				'margin-left': 'auto'
				}
			
		}
		
		
		
	}	
	
	


    CS.symbolCatalog.register(definition);
})(window.Coresight);
