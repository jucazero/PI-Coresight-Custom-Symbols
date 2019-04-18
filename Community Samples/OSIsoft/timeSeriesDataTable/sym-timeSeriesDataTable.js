
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
# Updated by dlopez@osisoft.com
# Updared by fbatista@osisoft.com:
	- Added more parameters in get DefaultConfig function
#
**/

//************************************
// Begin defining a new symbol
//************************************
(function (CS) {
	//'use strict';
	// Specify the symbol definition	
	var myCustomSymbolDefinition = {
		// Specify the unique name for this symbol; this instructs PI Vision to also
		// look for HTML template and config template files called sym-<typeName>-template.html and sym-<typeName>-config.html
		typeName: 'timeSeriesDataTable',
		// Specify the user-friendly name of the symbol that will appear in PI Vision
		displayName: 'Time Series Data Table',
		// Specify the number of data sources for this symbol; just a single data source or multiple
		datasourceBehavior: CS.Extensibility.Enums.DatasourceBehaviors.Single,
		// Specify the location of an image file to use as the icon for this symbol
		iconUrl: '/Scripts/app/editor/symbols/ext/Icons/timeSeriesDataTable.png',
		visObjectType: symbolVis,
		// Specify default configuration for this symbol
		getDefaultConfig: function () {
			return {
				//
				DataShape: 'TimeSeries',
				//DataQueryMode:  CS.Extensibility.Enums.DataQueryMode.ModeEvents,
				// Specify the default height and width of this symbol
				Height: 300,
				Width: 500,
				Intervals: 1000,				
				// Specify the value of custom configuration options; see the "configure" section below
				showTimestampCheckboxValue: true,
				showHeaderCheckboxValue: true,
				showDataItemNameCheckboxStyle: "table-cell",
				showTimestampCheckboxStyle: "table-cell",				
				timestampColumnColor: "gray",
				valueColumnColor: "black",
				hoverColor: "93cadc",
				evenRowColor: "#EEEEEE",
				oddRowColor: "none",
				outsideBorderColor: "#091d3a",
				headerBackgroundColor: "#091d3a",
				headerTextColor: "white",
				searchBackgroundColor: "#2a3e5d",
				searchTextColor: "white",				
				orderFromNewestToOldest: false,
				enableKeywordColors: false,
				keyword1: "OFF",
				keyword1Color: "red",
				showSearchCheckboxValue: true,
				searchFilter: "",
				showApplyTimeControls: true,
				controlColumnColor: "black",
				urlPrefix: "",
				urlSuffix: "",
				insertUrl: false
				
			};
		},
		// By including this, you're specifying that you want to allow configuration options for this symbol
		configOptions: function () {
            return [{
				// Add a title that will appear when the user right-clicks a symbol
				title: 'Format Symbol',
				// Supply a unique name for this cofiguration setting, so it can be reused, if needed
                mode: 'format'
            }];
        }
		// Specify the name of the function that will be called to initialize the symbol
		//init: myCustomSymbolInitFunction
	};
	
	//************************************
	// Function called to initialize the symbol
	//************************************
	//function myCustomSymbolInitFunction(scope, elem) {
	function symbolVis() { }
    CS.deriveVisualizationFromBase(symbolVis);
	symbolVis.prototype.init = function(scope, elem) {
		// Specify which function to call when a data update or configuration change occurs 
		this.onDataUpdate = myCustomDataUpdateFunction;
		this.onConfigChange = myCustomConfigurationChangeFunction;
		
		// Locate the html div that will contain the symbol, using its id, which is "container" by default
		var symbolContainerElement = elem.find('#container')[0];
        // Use random functions to generate a new unique id for this symbol, to make it unique among all other custom symbols
		var newUniqueIDString = "myCustomSymbol_" + Math.random().toString(36).substr(2, 16);
		// Write that new unique ID back to overwrite the old id
        symbolContainerElement.id = newUniqueIDString;
		//************************************
		// When a data update occurs...
		//************************************
		function myCustomDataUpdateFunction(data) {
			// If there is indeed new data in the update
			if(data) {
				// If the custom visualization hasn't been made yet... create the custom visualization!
				// Custom code begins here:
				// --------------------------------------------------------------------------------------------------
				// Get the data item name and units
				if (data.Data[0].Label) {
					scope.dataItemLabel = data.Data[0].Label; 
				}
				if (data.Data[0].Units) {
					scope.dataItemUnits = " (" + data.Data[0].Units + ")";
				}
				console.log(data);
				if (data.Data[0].StartTime) {
					scope.StartTime = data.Data[0].StartTime;
				}
				if (data.Data[0].EndTime) {
					scope.EndTime = data.Data[0].EndTime;
				}			
				// If the inverted order checkbox is checked, reverse the order!
				if (scope.config.orderFromNewestToOldest) {
					scope.dataItemValues = data.Data[0].Values.reverse();
				} else {
					scope.dataItemValues = data.Data[0].Values;
				}
			}
		}

		//************************************
		// Applies a time range to the display
		//************************************		
		scope.config.applyTime = function (parameter, time) {
			var cleansedTime = time.replace("/", "%2F");
			//console.log (parameter, time);
			var newURL = window.location.href;
			// Trim off all other params
			if (newURL.indexOf("?") != -1) {
				newURL = newURL.split("?")[0];
			}
			var separator = "&";
			// Determine the right separator
			if (newURL.indexOf("?") == -1) {
				separator = "?";
			}
			// Add the parameter!
			newURL += (separator + parameter + "=" + cleansedTime);
			// Add the second parameter!
			if (parameter.toLowerCase() == "starttime") {
				newURL += ("&EndTime=" + scope.EndTime);
			} else {
				newURL += ("&StartTime=" + scope.StartTime);
			}
			console.log(newURL);
			//Navigate
			window.location.href = newURL;
		}
		
		//************************************
		// Function that is called when custom configuration changes are made
		//************************************
		function myCustomConfigurationChangeFunction(data) {
				//console.log("new prefix = " + config.urlPrefix);
		
		}
		
		
		
		// Specify which function to call when a data update or configuration change occurs 
		//return { dataUpdate: myCustomDataUpdateFunction, configChange:myCustomConfigurationChangeFunction };		
	}
	// Register this custom symbol definition with PI Vision
	CS.symbolCatalog.register(myCustomSymbolDefinition);
	
})(window.PIVisualization);