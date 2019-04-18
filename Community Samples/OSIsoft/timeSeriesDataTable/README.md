## *Time Series Data Table* custom PI Vision Symbol

This symbol allows PI Vision to display time series data in tabular form. Simply drag and drop an attribute from attributes pane to visualize the original compressed data provided by the selected attribute. 

***Insert URL on Value option***

If selected, this option will display data with a embedded hyperlink. A typical use case is to provide links to pictures stored in a folder. The value could be, for example, the name of a file without extension, but the hyperlink embedded on the displayed values will contain the full path to access those files. The configuration pane will expose the *URL Prefix* and *URL Suffix* fields when the Insert URL on Value option is selected.

Example:
URL prefix: https://myserver/pictures/
URL suffix: .jpg

| Attribute value showing in table | Embedded hyperlink |
|--|--|
|Bearing001|https://myserver/pictures/Bearing001.jpg|
|Bearing002|https://myserver/pictures/Bearing002.jpg|


## Deployment

Follow these simple instructions to install this custom symbol; the overall process should only take a minutes.

1. In Windows Explorer, navigate to the "PIPC\PIVision" installation folder on your PI Vision server; typically, it's located in "C:\Program Files\PIPC\PIVision"

2. From within the folder named "PIVision", navigate to the "\Scripts\app\editor\symbols" sub-folder.  

3. Within the folder named "symbols", if there is not already a folder called "ext", create a folder called "ext".  

4. Now that the "ext" folder exists, or already exits, open it, and paste into the "ext" folder the one .js and two .html files contained in the custom symbol .ZIP folder that you were sent.

5. Within the folder named "ext", if there is not already a folder called "Icons", create a folder called "Icons".  

6. Now that the "Icons" folder exists, or already exits, open it, and paste into the "Icons" folder the one .png image file contained in the custom symbol .ZIP folder that you were sent.

The next time you open a web browser and navigate to PI Vision and create a new PI Vision display, you will see this new symbol appear in the top-left-hand corner of the PI Vision display editor.