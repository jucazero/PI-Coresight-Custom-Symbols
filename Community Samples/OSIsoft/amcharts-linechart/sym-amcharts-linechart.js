/**
# ***********************************************************************
# * DISCLAIMER:
# *
# * All sample code is provided by OSIsoft for illustrative purposes only.
# * These examples have not been thoroughly tested under all conditions.
# * OSIsoft provides no guarantee nor implies any reliability,
# * serviceability, or function of these programs.
# * ALL PROGRAMS CONTAINED HEREIN ARE PROVIDED TO YOU "AS IS"
# * WITHOUT ANY WARRANTIES OF ANY KIND. ALL WARRANTIES INCLUDING
# * THE IMPLIED WARRANTIES OF NON-INFRINGEMENT, MERCHANTABILITY
# * AND FITNESS FOR A PARTICULAR PURPOSE ARE EXPRESSLY DISCLAIMED.
# ************************************************************************
#
# Visualizations provided by amCharts: https://www.amcharts.com/
#
**/

(function (PV) {
	//'use strict';
	
	var myCustomSymbolDefinition = {

		typeName: 'amcharts-linechart',
		displayName: 'amCharts Line Chart',
		datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Multiple,
		iconUrl: 'Scripts/app/editor/symbols/ext/Icons/LineChart.png',
		visObjectType: symbolVis,
		getDefaultConfig: function () {
			return {
				DataShape: 'TimeSeries',
				DataQueryMode: PV.Extensibility.Enums.DataQueryMode.ModePlotValues,
				Height: 300,
				Width: 600,
				FormatType: "F3",
				BackgroundColor: "",
				TextColor: "#ffffff",
				Graphs: [],
				Rotate: false,
				LabelRotation: 0,
				LegendPosition: "right"
				
            };
		},
	
        configOptions: function () {
            return [{
				title: 'Format Symbol',
                mode: 'format'
            }];
        },
		inject: ['dataPump'],
		configure: {
			deleteTrace: configDeleteTrace
			
		}
 
	};
	
	
	function symbolVis() { };
    PV.deriveVisualizationFromBase(symbolVis);
	
	function configDeleteTrace(scope){
		var index = scope.runtimeData.selectedTrace;
        var datasources = scope.symbol.DataSources;
		var graphs = scope.config.Graphs;
		
        if (datasources.length > 1) {
            datasources.splice(index, 1);
			graphs.splice(index,1);   
			updateGraphIndexes(graphs);
			scope.$root.$broadcast('refreshDataForChangedSymbols');		
		}
		
	};
	
	function updateGraphIndexes(graphs){
		graphs.forEach(function(graph, index){
			graph.valueField = "Value" + index;
		});
		
	}
	
	symbolVis.prototype.init = function(scope, elem, dataPump) {	
	
	
	    scope.$watch('symbol.DataSources', function (nv, ov) {
            if (nv && ov && !angular.equals(nv, ov)) {
/*                 that.revertZoom();
                if (nv.length <= ov.length) {
                    scope.$emit(scope.cursor.callouts.length ? 'refreshDataforChangedSymbolsWithCursor' : 'refreshDataForChangedSymbols');
                    scope.trendModel.refresh();
                } */
            }
        }, true);
		
		
		this.onDataUpdate = dataUpdate;
		this.onConfigChange = configChange;
		
		scope.config.Bullets = [
			"none","round","square", "triangleUp", "triangleDown", "bubble"//, "custom"
		];
		
		scope.config.GraphTypes = [
			"line", "column", "step", "smoothedLine"
		];
		
		scope.config.Positions = [
			"left", "right", "top", "bottom"
		];
		
		
		
		scope.config.DataSources = scope.symbol.DataSources;
		
	
		var chart = initChart(scope.config);

		
		chart.addListener("zoomed", handleZoom);
		
		function handleZoom(event) {
		//   console.log(event);
		 //  console.log(PV);
		  // dataPump.stop();
		}
		
		function initChart(config){
			
			config.Graphs = config.Graphs.length > 0 ? config.Graphs : initGraphs(scope.symbol.DataSources);
	
			var symbolContainerDiv = elem.find('#container')[0];
			symbolContainerDiv.id = "myCustomSymbol_" + Math.random().toString(36).substr(2, 16);
								
			var chartconfig = getChartConfig(config);
					
			var chartObject = AmCharts.makeChart(symbolContainerDiv.id, chartconfig);
			
			
			//if(chartObject.graphs[0].lineColor == ""){
				config.Graphs.forEach(function(graph,index){
					graph.lineColor = chartObject.graphs[index].lineColorR;
					graph.bulletColor = chartObject.graphs[index].lineColorR;
				});	
			//}
		
			return chartObject;
		};		
		
		
		function configChange(newConfig, oldConfig) {
			
            if (chart && newConfig && oldConfig && !angular.equals(newConfig, oldConfig)) {			
				var newdatasoucres = _.difference(newConfig.DataSources, oldConfig.DataSources);
					if(newdatasoucres.length > 0){
						var newGraphs = initGraphs(newdatasoucres);
						var index = scope.config.Graphs.length;
						scope.config.Graphs =  scope.config.Graphs.concat(newGraphs);

					}

				chart.graphs = getGraphs(scope.config.Graphs);
				chart.color = scope.config.TextColor;
				chart.rotate = scope.config.Rotate;
				chart.categoryAxis.labelRotation =  scope.config.LabelRotation;
				chart.legend.position = scope.config.LegendPosition;

				
				

				chart.validateData();
            
			}
			
        };
			
		function dataUpdate(newdata) { 
			if (!newdata || !chart) return;
			var dataprovider = convertToChartDataFormat(newdata);		
			chart.dataProvider = dataprovider;
			chart.validateData();
			chart.animateAgain();			
			
		}
             
		 function convertToChartDataFormat(newdata) {		
			return _.chain(newdata.Data)
					.map(function(dataArray,index){
						return dataArray.Values.map(function(dataitem){
								var datetime = new Date(dataitem.Time);
								var starttime = new Date(dataArray.StartTime);
								return datetime >= starttime 
										? _.object(['Value' + index, 'Time', 'DateTime'], [dataitem.Value, dataitem.Time, datetime])
										: undefined;
							});
					})
					.flatten()
					.compact()
					.groupBy(function(item){return item.Time})
					.map(function(item){
						if (_.size(item) > 1){
							var merged = {};
							item.forEach(function(item){_.defaults(merged,item)});	
							return merged;
						}
						else{
							return item[0];
						}	
					})
					.sortBy('DateTime')
					.value();			
		 }
		

		
		function initGraphs(datasources){
			return datasources.map(function(item){
				var isAttribute = /af:/.test(item);
				var label = isAttribute ? item.match(/\w*\|.*$/)[0] : item.match(/(\w+)\?*[0-9]*$/)[1];
				var index = scope.symbol.DataSources.indexOf(item);			
				return {
						balloonText: "<span style='font-size:13px'>[[title]]</span><br> <span style='font-size:18px'>[[Time]]</span><br><span style='font-size:18px'>[[Value" + index + "]]</span>",
						title: label,
						valueField: "Value" + index,
						bullet: "round",
	//					lineColor: '', 
						lineThickness: 1,
						type: "line",
						bulletColor: "rgba(0,0,0,0)",
						fixedColumnWidth: 25

				}
				
			});			
		};
        
		function getGraphs(graphs){
			return graphs.map(function(graph){
				return {
					balloonText: graph.balloonText,
					title: graph.title,
					valueField: graph.valueField,
					bullet: graph.bullet,
					lineColor: graph.lineColor,
					lineThickness: graph.lineThickness,
					type: graph.type,
					bulletColor: graph.bulletColor,
					fixedColumnWidth: parseInt(graph.fixedColumnWidth)

				};
				
			});
			
		};
		
		function getChartConfig(config) {
            return {
						"type": "serial",
						"theme": "dark",
						"rotate": config.Rotate,
						"color": config.TextColor,
						"listeners": [{
							"event": "zoomed",
							"method": handleZoom
						}],
						"valueAxes": [{
							"position": "left",
							"title": "Value"
						}],    
						"categoryField": "Time",
						"categoryAxis": {
							"title": "Time",
							"labelRotation": config.LabelRotation,
							"parseDates": true,
							"minPeriod":"ss",
						},
						"graphs": getGraphs(config.Graphs),					 
						"dataProvider": "",						
						"chartCursor": { 

							"valueLineBalloonEnabled": true,
							"valueLineEnabled": true,
							"valueZoomable": true
						},
						"legend": {
							"enabled": true,
							"useGraphSettings": true,
							"position": config.LegendPosition
							
						},
						"export": {
							"enabled": true
						}
					}
        }

	}
	PV.symbolCatalog.register(myCustomSymbolDefinition);

})(window.PIVisualization);