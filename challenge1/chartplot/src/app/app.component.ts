import { Component } from '@angular/core';

interface IBasicEvent {
  type: string;
  timestamp: number;
}

interface IStartEvent extends IBasicEvent {
  select: string[];
  group: string[];
}

interface ISpanEvent extends IBasicEvent {
  begin: number;
  end: number;
}

interface IStopEvent extends IBasicEvent {
}

interface IDataEvent extends IBasicEvent {
  readValue(grouping: string, select: string): number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'chartplot';

  private currentData: string[];

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
      return parsedEvent as IStartEvent;
    case "stop":
      return parsedEvent as IStopEvent;
    case "data":
      return parsedEvent as IDataEvent;
    case "span":
      return parsedEvent as ISpanEvent;
    default:
      return null;
    }
  }

  getChartDataFromEvents(events: IBasicEvent[]) {
    let plotEngine: any;
    for (let event of events) {
      event.run()
    }
  }

  updateChart(newData: void) {

  }
}
