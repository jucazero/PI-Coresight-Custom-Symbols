(function (PV) {
	'use strict';

    function symbolVis() { };
    PV.deriveVisualizationFromBase(symbolVis);
	
	var definition = {
		typeName: "ganttchart",
		visObjectType: symbolVis,
		datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Multiple,
		getDefaultConfig: function(){
			return {
				DataShape: "Timeseries",
				Height: 150,
				Width: 150
			}		
		}
	}
	
	function getConfig() {
		return { 
		  "type": "gantt",
		  "theme": "light",
		  "marginRight": 70,
		  "period": "ss",
		  "dataDateFormat": "YYYY/MM/DD HH:NN:SS",
		  "columnWidth": 0.5,
		  "valueAxis": {
			"type": "date",
			"minPeriod": "ss",
			"ignoreAxisWidth": true
		  },
		  //"brightnessStep": 7,
		  "graph": {
			//"fillAlphas": 1,
			"lineAlpha": 1,
			"lineColor": "#fff",
			"fillAlphas": 0.85,
			"balloonText": "<br />[[start]] -- [[end]]"
		  },
		  "rotate": true,
		  "categoryField": "category",
		  "segmentsField": "segments",
		  "colorField": "color",
		  "startDateField": "start",
		  "endDateField": "end",
		  "dataProvider": "",
/* 		  "valueScrollbar": {
			"autoGridCount": true
		  }, */
		  "chartCursor": {
			"cursorColor": "#55bb76",
			"valueBalloonsEnabled": false,
			"cursorAlpha": 0,
			"valueLineAlpha": 0.5,
			"valueLineBalloonEnabled": true,
			"valueLineEnabled": true,
			"zoomable": false,
			"valueZoomable": true
		  },
		  "export": {
			"enabled": true
		  }
		}
	}
	
	symbolVis.prototype.init = function(scope, elem) {
		var symbolContainerDiv = elem.find("#container")[0];
		symbolContainerDiv.id = "barChart_" + Math.random().toString(36).substr(2, 16);
		var chartConfig = getConfig();
		console.log(chartConfig);
		var chart = AmCharts.makeChart(symbolContainerDiv.id, chartConfig);
		var labels;
		this.onDataUpdate = dataUpdate;
		
		function dataUpdate(data) {
			if(!data) return;
			var dataprovider = convertToChartDataFormat(data);
			chart.dataProvider = dataprovider;
			chart.validateData();
		}
		
		function convertToChartDataFormat(data) {
			var valArray = data.Data[0].Values;
			var segmentsRunning = [];
			var segmentsDown = [];
			var segmentsTrouble = [];
			valArray.forEach(function(item, index) {
				switch(item.Value) {
					case "Running":
						segmentsRunning.push({
							"start": new Date(item.Time),
							"end": index + 1 >= valArray.length ? new Date(data.Data[0].EndTime) : new Date(valArray[index + 1].Time)
						})
						break;
					case "Down":
						segmentsDown.push({
							"start": new Date(item.Time),
							"end": index + 1 >= valArray.length ? new Date(data.Data[0].EndTime) : new Date(valArray[index + 1].Time)
						})
						break;
					case "Trouble":
						segmentsTrouble.push({
							"start": new Date(item.Time),
							"end": index + 1 >= valArray.length ? new Date(data.Data[0].EndTime) : new Date(valArray[index + 1].Time)
						})
						break;
					default:
						break;
				}
			});
		 var dataprovider = [{
			"category": "Running",
			"segments": segmentsRunning
		  }, {
			"category": "Down",
			"segments": segmentsDown
		  }, {
			"category": "Trouble",
			"segments": segmentsTrouble
		  }];
		 return dataprovider;
		}
	}

	PV.symbolCatalog.register(definition); 
	
})(window.PIVisualization);
