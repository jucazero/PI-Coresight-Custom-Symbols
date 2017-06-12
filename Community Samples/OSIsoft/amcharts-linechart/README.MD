## Line Chart symbol

This symbol is a work in progress.

This symbol is for PI Coresight version 2016 R2. Scroll down for the instructions on how to upgrade it to PI Vision 2017.

<img src="https://github.com/AnnaPerry/PI-Coresight-Custom-Symbols/blob/master/Community%20Samples/OSIsoft/amcharts-linechart/ExampleofLineChart.png" 
alt="Line Chart for PI Coresight" />

## To deploy the symbol: 

1. In Windows Explorer, navigate to the "%PIHOME%\Coresight\Scripts\app\editor\symbols\ext" on your PI Coresight web server; typically, it's located in "C:\Program Files\PIPC\Coresight\Scripts\app\editor\symbols\ext".
If this folder doesn't exist, create it.

2. Place the following symbol files to the .\ext folder

	*sym-amcharts-linechart-template.html*
	
	*sym-amcharts-linechart-config.html*
	
	*sym-amcharts-linechart.js*

3. Place all files with *.png* extension to the .\ext\Icons directory (create if it doesn't exist)
4. Place the Underscore library (*underscore-min.js*) to the .\ext\libraries (create if doesn't exist). The latest version of Underscore can be downloaded from http://underscorejs.org/.
5. Place the amCharts libraries (*amcharts.js*, *dark.js* and *serial.js*) to the .\ext\libraries folder.
6. Run iisreset

## Upgrade to PI Vision 2017

To upgrade this symbol to PI Vision 2017,

1. Replace the last line in the sym-amcharts-linechart.js file with **})(window.PIVisualization)**;

I.e.

})(window.Coresight); => })(window.PIVisualization);


2. In the sym-amcharts-linechart-config.html, replace all occurrences of **cs-color-picker** with **pv-color-picker** (Hint: Ctrl+H to speed up the process).
