import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ResizeEvent } from 'angular-resizable-element';

import { PlotEngine } from './PlotEngine'
import { IPlotEngine } from "./IPlotEngine";
import { IChartData } from "./chart/IChartData";
import { IBasicEvent, IStopEvent, ISpanEvent } from "./events";
import { StartEvent } from "./StartEvent";
import { DataEvent } from "./DataEvent";
import { StopEvent } from "./StopEvent";
import { SpanEvent } from "./SpanEvent";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {

  title = 'chartplot';

  private plotEngine: IPlotEngine;
  private currentData: string[];

  @ViewChild('editor', { static: true })
  editor;

  plotData: IChartData;
  editorHeight = 200;

  constructor() {
    this.plotEngine = new PlotEngine(); // todo: remove new keyword and use a factory pattern.
  }

  onEventsChanged(jsonData: string) {
    this.currentData = jsonData.split("\n");
  }

  generateChart() {
    const events = this.parseEvents();
    const newData = this.getChartDataFromEvents(events);
    this.updateChart(newData);
  }

  ngAfterViewInit(): void {
    this.editor.getEditor().getSession().setUseWorker(false);
  }

  private parseEvents(): IBasicEvent[] {
    const currentData = this.currentData;
    if (!currentData)
      return null; // todo: what should be the behaviour when events are not specified?
    return this.readAndParseEachEvent(currentData);
  }

  private readAndParseEachEvent(currentData: string[]): IBasicEvent[] {
    const eventsParsed: IBasicEvent[] = [];
    for (let event of currentData) {
      if (!event)
        continue;
      const parsedEvent = this.parseJson(event);
      if (!parsedEvent.type)
        continue; // todo: should we ignore events without a "type" value?
      eventsParsed.push(this.readEventType(parsedEvent));
    }
    return eventsParsed;
  }

  private parseJson(data: string): any {
    try {
      // handle unquoted JSON.
      let fixedJson = data.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
      fixedJson = fixedJson.replace(/[']/g, '"');
      return JSON.parse(fixedJson);
    } catch (e) {
      return null;
    }
  }

  private readEventType(parsedEvent: any): IBasicEvent {
    switch (parsedEvent.type) {
    case "start":
      return new StartEvent(parsedEvent, this.plotEngine);
    case "stop":
      return new StopEvent(parsedEvent, this.plotEngine);
    case "data":
      return new DataEvent(parsedEvent, this.plotEngine);
    case "span":
      return new SpanEvent(parsedEvent, this.plotEngine);
    default:
      return null;
    }
  }

  getChartDataFromEvents(events: IBasicEvent[]) {
    for (let event of events)
      event.execute();
    return this.plotEngine.readChartData();
  }

  updateChart(newData: IChartData) {
    if (newData)
      this.plotData = newData;
    else
      this.plotData = null;
  }

  onValidateResize(event: ResizeEvent) {
    if (event.rectangle.height > 150 && event.rectangle.height < 450)
      return true;
    return false;
  }

  onResizeEnd(event: ResizeEvent) {
    this.editorHeight = event.rectangle.height;
  }
}
