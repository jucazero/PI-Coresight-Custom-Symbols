## Gantt symbol  


This symbol is for PI Vision version 2017 and 2017 R2.
Warning! This is just a prototype, a lot of stuff is hardcoded. It will not work without you tweaking it first.


<img src="https://github.com/AnnaPerry/PI-Coresight-Custom-Symbols/blob/master/Community%20Samples/OSIsoft/gantt/gantt.jpg" 
alt="Gantt Chart for PI Vision" />

## To deploy the symbol: 

1. In Windows Explorer, navigate to the "%PIHOME%\PIVision\Scripts\app\editor\symbols\ext" on your PI Vision web server; typically, it's located in "C:\Program Files\PIPC\PIVision\Scripts\app\editor\symbols\ext".
If this folder doesn't exist, create it.

2. Place the following symbol files to the .\ext folder

	*sym-gantt-template.html*
	
	*sym-gantt.js*

3. Download amCharts Javascript library from https://www.amcharts.com/download/
   Place *gantt.js* and *amcharts.js* to .\ext\libraries folder 