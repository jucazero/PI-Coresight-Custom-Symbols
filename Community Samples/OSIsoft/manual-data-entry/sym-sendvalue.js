(function (PV) {
	'use strict';

	function symbolVis() { }
	PV.deriveVisualizationFromBase(symbolVis);

	var definition = {
	    typeName: 'sendvalue',
		displayName: 'Manual Data Entry',
	    datasourceBehavior:  PV.Extensibility.Enums.DatasourceBehaviors.Multiple,
		visObjectType: symbolVis,
        iconUrl: '/Scripts/app/editor/symbols/ext/Icons/paper-plane-xxl.png',
	    getDefaultConfig: function() {
	    	return {
	    		DataShape: 'Table',
		        Height: 50,
		        Width: 450,
				DataType: true,
				DefaultTimestamp: '*',
				AlternativeNames: [],
				BackgroundColor: "#239a23",
				ButtonTextColor: "#fff",
				TextColor: "#fff",
				ButtonWidth: 80,
				ButtonHeight: 26,
				ButtonText: "Update",
				ShowTimestamp: false,
				ShowAttribute: true,
				ShowAlternativeName: false,
				ShowCurrentValue: true,
				InputValueWidth: 150
			};
		},
	    configOptions: function () {
	        return [
				{
	            	title: 'Format Symbol',
	            	mode: 'format'
				}
			];
	    },
        inject: ['webServices', '$http', '$q', 'log'],
		configure: {
			deleteTrace: configDeleteTrace
		}
	};

	var baseUrl = PV.ClientSettings.PIWebAPIUrl.replace(/\/?$/, '/'); //Example: "https://server.domain.com/piwebapi/";

	symbolVis.prototype.init = function (scope, elem, webServices, $http, $q, log) {

		var TYPES = {
			Single: "Number",
			Double: "Number",
			Float: "Number",
			Int16: "Number",
			Int32: "Number",
			Int64: "Number",
			String: "String",
			Digital: "String",
			Boolean: "Boolean",
			DateTime: "String"
		};

		scope.runtimeData.newStreamsAdded = true;
		scope.runtimeData.streamList = [];
		scope.runtimeData.isAllSelected = false;
		scope.isButtonEnabled = false;
		scope.config.DataSources = scope.symbol.DataSources;

		this.onConfigChange = configChange;
		this.onDataUpdate = dataUpdate;

		function configChange(newConfig, oldConfig) {
            if (newConfig && oldConfig && !angular.equals(newConfig, oldConfig)) {
				if (newConfig.DataSources.length > oldConfig.DataSources.length) {
					scope.runtimeData.newStreamsAdded = true;
				}
            }
        }

		function dataUpdate(data) {
			if (!data) return;
			if (data.Rows[0].Label && scope.runtimeData.newStreamsAdded) {
				var newStreams = getStreams(data.Rows.slice(scope.runtimeData.streamList.length));
				scope.runtimeData.streamList = scope.runtimeData.streamList.concat(newStreams);
				scope.runtimeData.streamList.forEach(function (item) {
					if (item.IsDigital) {
						webServices.getDefaultStates(item.Path).promise.then(function (response) {
							item['DigitalStates'] = response.data.States;
						});
					}
				});
				scope.runtimeData.newStreamsAdded = false;
			}
			scope.runtimeData.streamList.forEach(function (item, index){
				item.CurrentValue = data.Rows[index].Value;
			})
		}

		function getStreams(dataRows) {
			return dataRows.map(function (item, index){
				return {
					Label: item.Label,
					Type: TYPES[item.DataType],
					CurrentValue: item.Value,
					UOM: item.Units,
					AlternativeName: scope.config.AlternativeNames.length> 0 && scope.config.AlternativeNames[index]
									? scope.config.AlternativeNames[index] : '<Enter name>',
					IsSelected: false,
					Path: item.Path,
					InputTimestamp: scope.config.DefaultTimestamp,
					IsDigital: item.DataType == 'Digital',
					isPoint: item.Path.indexOf('pi:') == -1 ? false : true,
					InputValue: undefined
				};
			});
		}

		scope.sendValues = function() {

			scope.loading = true; //show loading icon
			scope.isButtonEnabled = false;
			var streams = scope.runtimeData.streamList;
			if(!anyStreamsSelected(streams)) return;

			var batchRequest = formBulkSendRequest(streams);
			//Send batch request to PI Web API endpoint
			var sendDataPromise = Object.keys(batchRequest).length > 0
									? $http.post(baseUrl + "batch", batchRequest, {withCredentials: true})
									: $q.reject();

			sendDataPromise.then(function (response) {
				setTimeout(function () {
					scope.loading = false;
					scope.isButtonEnabled = true;
					for (var request in response.data) {
						if (!(response.data[request].Status == 200 || response.data[request].Status == 202)) {
							var message = response.data[request].Content.Message ? response.data[request].Content.Message : response.data[request].Content;
							// console.log('Error from PI Web API:', message);
							log.add(PV.ResourceStrings.CommunicationError, log.Severity.Error, message, log.ClearType.Manual);
						}
					}
				}, 5000);
			}, function (error) {
					console.log('Failed request to PI Web API:', error);
					log.add(PV.ResourceStrings.CommunicationError, log.Severity.Error, 'Check Developer Console for errors', log.ClearType.Manual);
					scope.loading = false;
					scope.isButtonEnabled = true;
				}
			);
	    };

	   	function formBulkSendRequest(streamList) {

			var batchRequest = {};

			streamList.forEach(function (stream, index) {
				if (!stream.IsSelected || (!stream.InputValue && stream.InputValue !== 0)) return;
				// Request to get stream
				var path = PV.Utils.parsePath(stream.Path).fullPath;
				batchRequest['GetStream' + index] = {
					'Method': 'GET',
					'Resource': baseUrl + (stream.isPoint ? 'points' : 'attributes') + '?path=' + path + '&selectedFields=Links.Value'
				}
				// Request to send data to the previsouly acquired stream
				var data = {
					"Timestamp": stream.InputTimestamp,
					"Value": stream.IsDigital ? stream.InputValue.Name : stream.InputValue
				};
				batchRequest["SendValue" + index] = {
							"Method": stream.isPoint ? 'PUT' : 'POST',
							"Resource": '{0}',
							"Content": JSON.stringify(data),
							'ParentIds': [
								'GetStream' + index
							],
							'Parameters': [
								'$.GetStream' + index + '.Content.Links.Value'
							],
							"Headers": {
								'Content-Type': 'application/json'
							}
				}
			});

			return JSON.stringify(batchRequest);
		}

		function anyStreamsSelected() {
			return scope.runtimeData.streamList.some(function (stream) { return(stream.IsSelected); });
		}

		scope.toggleAll = function() {
			var toggleValue = scope.runtimeData.isAllSelected;
			scope.runtimeData.streamList.forEach(function (stream) { stream.IsSelected = toggleValue });
			scope.isButtonEnabled  = anyStreamsSelected();
		};

		scope.toggleStreamSelection = function() {
			scope.runtimeData.isAllSelected = scope.runtimeData.streamList.every(function (stream) { return(stream.IsSelected); });
			scope.isButtonEnabled  = anyStreamsSelected();
		};
	}

	function configDeleteTrace(scope) {
		var index = scope.runtimeData.selectedStream;
        var datasources = scope.symbol.DataSources;
		var streams = scope.runtimeData.streamList;
		var names = scope.config.AlternativeNames;

        if (datasources.length > 1) {
            datasources.splice(index, 1);
			streams.splice(index, 1);
			names.splice(index, 1);
			scope.$root.$broadcast('refreshDataForChangedSymbols');
		}
	}

    PV.symbolCatalog.register(definition);

}) (window.PIVisualization);
