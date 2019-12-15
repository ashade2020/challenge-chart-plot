import {Inject} from '@angular/core'

import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ResizeEvent } from 'angular-resizable-element';

import { IPlotEngine } from "./models/engine/IPlotEngine";
import { IChartData } from "./models/charting/IChartData";
import { IBasicEvent } from "./models/events/events";
import { IFactory} from "./models/factory/IFactory";
import { Factory } from "./models/factory/Factory.service";

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

  /**
   * Ctor called by Angular Core.
   * @param factory A factory instance. This instance is injected using the dependency injection pattern
   * (https://angular.io/guide/dependency-injection). This factory is used to encapsulate concrete classes
   * instantiation; this way, come concrete classes can be easily mocked during unit testing. See https://en.wikipedia.org/wiki/Factory_method_pattern
   * for more about the Factory Method design pattern.
   */
  constructor(private readonly factory: Factory) {
    this.plotEngine = factory.newPlotEngine();
  }

  onEventsChanged(jsonData: string) {
    this.currentData = jsonData.split("\n"); // I'm assuming events are separated by line breaks.
  }

  generateChart() {
    const events = this.parseEvents();
    const newData = this.getChartDataFromEvents(events);
    this.updateChart(newData);
  }

  ngAfterViewInit(): void {
    this.editor.getEditor().getSession().setUseWorker(false); // disable error checking.
  }

  private parseEvents(): IBasicEvent[] {
    const currentData = this.currentData;
    if (!currentData)
      return null; // what should be the behaviour when events are not specified?
    return this.readAndParseEachEvent(currentData);
  }

  private readAndParseEachEvent(currentData: string[]): IBasicEvent[] {
    const eventsParsed: IBasicEvent[] = [];
    for (let event of currentData) {
      if (!event)
        continue;
      const parsedEvent = this.parseJson(event);
      if (!parsedEvent || !parsedEvent.type || !parsedEvent.timestamp)
        continue; // should we ignore events without a "type" or "timestamp" value?
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
      return this.factory.newStartEvent(parsedEvent, this.plotEngine);
    case "stop":
      return this.factory.newStopEvent(parsedEvent, this.plotEngine);
    case "data":
      return this.factory.newDataEvent(parsedEvent, this.plotEngine);
    case "span":
      return this.factory.newSpanEvent(parsedEvent, this.plotEngine);
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
