import { Component } from '@angular/core';

class TimeSeriesKey {
  private group: string[];
  private seriesName: string;

  constructor(groupValues: string[], seriesName: string) {
    this.group = groupValues;
    this.seriesName = seriesName;
  }

  getFormattedKey(): string {
    let formattedValue = "";
    for (let groupValue of this.group) {
      formattedValue += groupValue + "____";
    }
    formattedValue += this.seriesName;
    return formattedValue;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chartplot';

  private plotEngine: IPlotEngine;
  private currentData: string[];

  constructor() {
    this.plotEngine = new PlotEngine();  // todo: remove new keyword and use a factory pattern.
  }

  onEventsChanged(jsonData: string) {
    this.currentData = jsonData.split("\\n");
  }

  generateChart() {
    const events = this.parseEvents();
    const newData = this.getChartDataFromEvents(events);
    this.updateChart(newData);
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
      return parsedEvent as IStopEvent;
    case "data":
      return new DataEvent(parsedEvent, this.plotEngine);
    case "span":
      return parsedEvent as ISpanEvent;
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

  }
}
