## To deploy the Manual Data Entry Symbol: 

1. In Windows Explorer, navigate to the "%PIHOME%\Coresight\Scripts\app\editor\symbols\ext" on your PI Coresight web server; typically, it's located in "C:\Program Files\PIPC\Coresight\Scripts\app\editor\symbols\ext".
If this folder doesn't exist, create it.

2. Place the following symbol files to the .\ext folder
	sym-sendvalue-config.html
	sym-sendvalue-config.html
	sym-sendvalue.js

3. Place Update.png and loading.gif to the .\ext\Icons directory (create if it doesn't exist)
4. Place the Underscore library (underscore-min.js) to the .\ext\libraries (create if doesn't exist). The latest version of Underscore can be downloaded from http://underscorejs.org/.

## A word about requirements

This symbol uses PI Web API to send data to the PI System.

This means that if you use a self-signed certificate for PI Web API, each client machine needs to install that certificate. 
Here is a video on how to install certificates for PI Web API: https://www.youtube.com/watch?list=PLMcG1Hs2JbcvGH0VCE4o-CjjaUkTiW5_D&v=KvYsF5MMQMU#t=04m18s

And since the PI Web API requests are made from within PI Coresight server, you may (read: definitely will) run into CORS issues.
I found the following video helpful when trying get CORS working without having to throw my server security wide open
 (i.e. without CorsHeaders=\*, CorsMethods=\* and CorsOrigins=*): https://www.youtube.com/watch?v=EyxieRFRPRw&index=10&list=PLMcG1Hs2JbcvGH0VCE4o-CjjaUkTiW5_D

## Quick Demo Video
<a href="http://www.youtube.com/watch?feature=player_embedded&v=CUklG6o9yHc
" target="_blank"><img src="http://img.youtube.com/vi/CUklG6o9yHc/0.jpg" 
alt="Manual Data Entry for PI Coresight" width="500" height="300" border="10" /></a>
