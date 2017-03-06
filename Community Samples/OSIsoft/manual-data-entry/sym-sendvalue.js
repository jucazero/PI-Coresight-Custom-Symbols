(function (CS) {
	var definition = {
	    typeName: 'sendvalue',
	    datasourceBehavior:  CS.Extensibility.Enums.DatasourceBehaviors.Multiple,
		visObjectType: symbolVis,
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/paper-plane-xxl.png',
	    getDefaultConfig: function() {			
	    	return {
	    		DataShape: 'TimeSeries',
		        Height: 50,
		        Width: 450,
				defaultTimestamp: '*',
				bgColor: "#239a23",
				textColor: "#fff",
				btnWidth: "80px",
				btnHeight: "26px",
				btnText: "Update",
				showTimestamp: false,
				valColWidth: "150px"
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

		
		
		this.onDataUpdate = dataUpdate;
	    
		function dataUpdate(data) {
		
	        if(data) {
			
	            if(data.Data[0].Label) {
					//get Data Streams configuration from the data object provided by PI Coresight data layer
					scope.dataStreamList = data.Data;
					//console.log("Logging scope.symbol.Name");
					//console.log(scope.symbol.Name);
        			//console.log("Logging scope.$id");
					//console.log(CS);
	            }
	        }
	    };
		// TODO: Replace dataStreamList with:
		//		scope.dataStreamList = scope.symbol.DataSources;
		scope.isStreamSelectedList = {};
		scope.config.submittedData = {};
		scope.config.submittedData.values = []; 
		scope.config.submittedData.timestamps = _.range(scope.symbol.DataSources.length).fill(scope.config.defaultTimestamp);
		
		scope.areAnyStreamsSelected = false;

		
		var baseUrl = CS.ClientSettings.PIWebAPIUrl.replace(/\/?$/, '/'); //Example: "https://arcadia.osisoft.int/piwebapi/";

		scope.inputType = {};
		scope.isEnumerationType = {};
		scope.enumerationOptions= {};
		var TYPES = {
			Single: "Number",
			Double: "Number",
			Float16: "Number", 
			Float32: "Number",
			Float64: "Number",
			Int16: "Number",
			Int32: "Number",
			Int64: "Number",
			String: "String",
			EnumerationValue: "String", //String for now, but should be handled specially
			Boolean: "Boolean",
			DateTime: "String"
			
		};
		
		
	   scope.sendValue = function(){
		   
		   scope.config.loading = true;
		    //Send data only if we have the following:
			//scope.config.submittedData - WHAT to send 
			//dataStreamList - WHERE to send
			//AnyStreamsSelected - confirmation from user 
           if(scope.config.submittedData && scope.dataStreamList && anyStreamsSelected()){
               
				//Form a batch request to send to PI Web API
				//TODO = example of batch request
				var batchRequest = formBulkSendRequest(scope.dataStreamList,scope.config.submittedData);
				//console.log(batchRequest);
				
				//Send batch request to PI Web API endpoint
				$http({
					url: baseUrl + "batch" ,
					method: "POST",
					data: batchRequest,
					withCredentials: true,
					headers: {
						'Content-Type': 'application/json',
					}
				}).success(function(response){
					setTimeout(function() {
						scope.config.loading = false;
					}, 2000);
					
				});     
     
                
			}
        
	   };
	   
		scope.toggleAll = function(){
			var toggleValue = scope.config.isAllSelected;
			
			scope.dataStreamList.forEach(function(dataItem, index){
				scope.isStreamSelectedList[index] = toggleValue;
			});
			
			scope.areAnyStreamsSelected  = anyStreamsSelected();
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
				
				var isAttribute = _.contains(itemPath, "|") ? true : false;
				var getDataStreamURL = isAttribute ? encodeURI(baseUrl + "attributes?path=" + itemPath) : encodeURI(baseUrl + "points?path=" + itemPath);
				
				$http.get(getDataStreamURL, {withCredentials: true}).success(function(response){
						
						//General case
						scope.inputType[index] = isAttribute ? TYPES[response.Type] : TYPES[response.PointType];
						
						
						//Attribute with Enumeration Set Value type case
						if (isAttribute && response.Type == "EnumerationValue")
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
					
					var isAttribute = _.contains(itemPath, "|") ? true : false;
					var streamInfoUrl = isAttribute ? encodeURI(baseUrl + "attributes?path=" + itemPath + "&selectedFields=Links.Value") : encodeURI(baseUrl + "points?path=" + itemPath + "&selectedFields=Links.Value");
					
					
					var data = {
                        "Timestamp": submittedData.timestamps[index],
                        "Value": scope.isEnumerationType[index] ? submittedData.values[index].Name : submittedData.values[index]
					};
					
					//var method = isAttribute ? "POST"
					
					batchRequest["GetStreamInfo" + index.toString()] = {
						"Method": "GET",
						"Resource": streamInfoUrl
					}
					//TODO: check if the post request failes with 405 and if it does, send the put request.
					//for streams
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
					//for static attributes
					batchRequest["PutValue" + index.toString()] = {
								"Method": "PUT",
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
				'background-color': scope.config.bgColor,
				'border': '1px solid rgba(230,231,232,.55)',
				'color': '#fff',
				'width': '80px',
				'height': '26px',
				'text-shadow': '0 -1px 0 rgba(0,0,0,.25)',
				'margin-left': 'auto'
				},
			general: {
				'background-color': scope.config.bgColor,
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
