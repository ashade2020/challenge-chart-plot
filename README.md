# Plotting a chart
PLEASE SCROLL DOWN TO READ THE ORIGINAL STATEMENT OF THE PROBLEM

## Introduction

This problem has been solved using Angular and Typescript 1.8. Typescript is a supersed of JavaScript and is compiled to JavaScript during deploy
(https://www.typescriptlang.org/).

All the relevant code is within the chartplot folder. The chartplot/src/app folder contains the main app component and the charting component codes.
Please, take a look at app.component.ts and app.component.html as a starting point. Then, take a look at the chart.component.ts and chart.component.html
files to check the charting logic.

## Architecture

To keep things S.O.L.I.D., all classes are kept small and concise. I used a simplified version of the command design pattern to model the events, hence
the file events.ts (within the folder chartplot/src/app) has a basic command interface (IBasicEvent) and specific extensions for each event type. Moreover, concrete implementations of these interfaces can also be found inside chartplot/src/app. The choice of the command design pattern makes the implementation easily extensible, because adding a new event is just a matter of implementing the interface IBasicEvent. Additionally, using interfaces allow us to mock implementations easily to make unit testing scenarios.

To handle all the logic related with receiving and processing the events, I created the interface IPlotEngine and its concrete implementation PlotEngine. Most of the relevant logic happens within this class.

To display the charts, I used the module ng2-charts (https://valor-software.com/ng2-charts/), which is a wrapper of the chart.js library (https://www.chartjs.org/). For the user input, I used the ACE editor (https://ace.c9.io/), which is a syntax highlighting text editor that supports most of the existing programming languages. However, since our unquoted/single quoted JSON is not a valid JSON format, problably syntax highlighting will not work properly.

Finally, all the ploting logic is encapsulated within the class ChartComponent, declared in the file chart.component.ts (chartplot/src/app/chart).

## Running the code
To run the code, you will need to clone the repository to your local machine, then execute "npm install" within the folder challenge1/chartplot. This will install all the modules needed to compile the code. Then, after instalation is completed, just run "ng serve" and go to the URL displayed in the console to view the website.

## Protection mechanism for huge amounts of data
To avoid breaking the application memory at the client, I decided to limit the total number of data points to 1000. Of course, this number is arbitrary and nonsense, unless we are provided with more information about the demands of the application.

After a total of 1000 data points is reached, new data events as IGNORED. Other behaviours could be specified, like downsampling the dataset using any data interpolation scheme. However, I decided to go easy at this one since time is short and there is no clear requirement on what to do with big streams of data.

## Some Remarks on the implementation
Since some behaviours are not fully specified, I needed to take some decisions:

1 - timestamps are treated as stantard UNIX timestamps.

2 - the x axis uses a time scale in the format h:mm:ss AM/PM.

3 - when a data event does not specify the value of a particular time series, it is not plotted at that data event timestamp.

4 - it is not clear which fonts to use in the json editor and in the rest of the body. Therefore, I decided to use Source Code Pro in the text editor and Source Sans Pro in the rest of the body.

5 - since the template does not specify colors, I tried to use similar colors (exception: the code editor, which uses the monokai theme).

6 - the code editor height can be changed: just drag its bottom border down or up. After releasing the mouse button, the chart will adapt to the new editor height.

7 - non standard JSON is supported (unquoted/single quoted). However, I require that each event declaration takes only one line. Example:

{type: 'start', timestamp: 1519780251293, select: ['min_response_time', 'max_response_time'], group: ['os', 'browser']}
{type: 'span', timestamp: 1519780251293, begin: 1519780251293, end: 1519780251312}
{type: 'data', timestamp: 1519780251293, os: 'linux', browser: 'chrome', min_response_time: 0.1, max_response_time: 1.3}  
{type: 'data', timestamp: 1519780251295, os: 'linux', browser: 'chrome', min_response_time: 0.2, max_response_time: 1.0}  
{type: 'data', timestamp: 1519780251298, os: 'linux', browser: 'chrome', min_response_time: 0.5, max_response_time: 1.1}  
{type: 'data', timestamp: 1519780251299, os: 'linux', browser: 'chrome', min_response_time: 0.9, max_response_time: 1.8}  
{type: 'data', timestamp: 1519780251293, os: 'windows', browser: 'chrome', min_response_time: 0.15, max_response_time: 1.13}  
{type: 'data', timestamp: 1519780251295, os: 'windows', browser: 'chrome', min_response_time: 0.25, max_response_time: 1.10}  
{type: 'data', timestamp: 1519780251298, os: 'windows', browser: 'chrome', min_response_time: 0.55, max_response_time: 1.11}  
{type: 'data', timestamp: 1519780251299, os: 'windows', browser: 'chrome', min_response_time: 0.95, max_response_time: 1.18}  
{type: 'stop', timestamp: 1519780260210}



################ ORIGINAL TEXT #################

In this challenge, you will implement a web application that plots a line chart based on some manually input data.

The input data is a sequence of events. This sequence represents the output of a query, which is omitted for simplicity. The data will be manually input by the final user instead. Based on the input sequence of events, you may generate a time based line chart containing one or more series.

## Definitions
An event is a set of keys and values. For this challenge, it will be represented as a JSON. 

```
{a: 1, b: 2}
```

> Although this is not a strict JSON format, we are being lenient in order to improve readability and facilitate the data input. As there are some backend libraries that support this format, you can implement that support as a bonus.

On our system, each event has two mandatory fields: timestamp and type. All other fields are optional.

* *timestamp* field holds the moment that the event refers to. It is formatted as a regular [Javascript timestamp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime)

* *type* field holds the definition of what is represented on each event. Its value can be one of the following:

### start
Events of type *start* define that a new sequence of data events will follow, along with the fields that may be plotted and their grouping. A group is a category for splitting the same variable into different series.

Example:
```
{type: 'start', timestamp: 1519780251293, select: ['min_response_time', 'max_response_time'], group: ['os', 'browser']}
```
In this example, for each different value of the pair (os, browser), we may plot two lines: one that represents the minimum response time, and one that represents the maximum response time. That is: if there are two different values for os and two different values for browser, we should have 8 different lines plotted.

### span
Events of type *span* define what is the visible date range for the chart. A new event of this type may make the chart update its boundaries.

Example:
```
{type: 'span', timestamp: 1519780251293, begin: 1519780251293, end: 1519780260201}
```
In this example the data should be plotted inside the interval between the begin and end values, that is, the timestamps 1519780251293 and 1519780260201, respectively. All data outside this range may be ignored.

### stop
Events of type *stop* define that no more data events will follow.
A *stop* event is generated after loading a static timespan in the past, or if the user explicitly stops the query. If the chart consumes real time data, it might never be generated.
Any events that eventually follow a *stop* event should be ignored, except for a new *start*, which would imply the creation of a new chart.

Example:
```
{type: 'stop', timestamp: 1519780251293}
```

### data
Events of type *data* define the content that might be displayed on the chart.

Example
```
{type: 'data', timestamp: 1519780251000, os: 'linux', browser: 'chrome', min_response_time: 0.1, max_response_time: 1.3}
```

> Note that absent data values for the fields defined by *select* and *group* also generate new series. On the other hand, fields that are not defined should be ignored.

## The challenge

We expect you to:

* Provide an input on the user interface to allow plotting different sequences of events;
* Based on an arbitrary sequence of events, plot the chart that represents the output for that sequence;
* Follow the layout indication provided on the prototype below;
* Write tests;
* Suggest and implement a protection for this application to deal with huge amount of data;
* Justify design choices, arguing about costs and benefits involved. You may write those as comments inline or, if you wish, provide a separate document summarizing those choices;
* Write all code and documentation in english

![challenge_frontend](https://github.com/intelie/challenge-chart-plot/raw/master/challenge_frontend.png "Expected user interface")

Although you can choose any graphical library to plot the chart, we suggest that you use a declarative JS framework to build the application such as ReactJS.

## Solve this challenge

To solve this challenge, you may fork this repository, then
send us a link with your implementation. Alternatively, if you do not want to have this repo on
your profile (we totally get it), send us a
[git patch file](https://www.devroom.io/2009/10/26/how-to-create-and-apply-a-patch-with-git/)
with your changes.

There is no unique solution to this challenge. The intent is to evaluate candidate's ability and familiarity with tools and best practices.

If you are already in the hiring process, you may send it to whoever is your contact at Intelie. If you wish to apply for a job at Intelie, please send your solution to [trabalhe@intelie.com.br](mailto:trabalhe@intelie.com.br).



