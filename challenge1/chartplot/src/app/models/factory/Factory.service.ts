import { Injectable } from '@angular/core';

import { IFactory } from "./IFactory";
import { IPlotEngine } from "../engine/IPlotEngine";
import { IStartEvent, IStopEvent, ISpanEvent, IDataEvent } from "../events/events";

import { StartEvent } from "../events/StartEvent";
import { StopEvent } from "../events/StopEvent";
import { SpanEvent } from "../events/SpanEvent";
import { DataEvent } from "../events/DataEvent";
import { PlotEngine } from "../engine/PlotEngine";
import { XyData } from "../charting/XyData";
import { ChartData } from "../charting/ChartData";
import { IChartData } from "../charting/IChartData";

@Injectable({
  providedIn: 'root'
})
export class Factory implements IFactory {
  newPlotEngine(): IPlotEngine {
    return new PlotEngine(this);
  }

  newChartData(xyDataArray: XyData[], xSpan: [Date, Date]): IChartData {
    return new ChartData(xyDataArray, xSpan);
  }

  newStartEvent(eventData: any, plotEngine: IPlotEngine): IStartEvent {
    return new StartEvent(eventData, plotEngine);
  }

  newStopEvent(eventData: any, plotEngine: IPlotEngine): IStopEvent {
    return new StopEvent(eventData, plotEngine);
  }

  newSpanEvent(eventData: any, plotEngine: IPlotEngine): ISpanEvent {
    return new SpanEvent(eventData, plotEngine);
  }

  newDataEvent(eventData: any, plotEngine: IPlotEngine): IDataEvent {
    return new DataEvent(eventData, plotEngine);
  }
}
