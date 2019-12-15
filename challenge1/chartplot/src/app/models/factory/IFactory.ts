import { IStartEvent, IStopEvent, ISpanEvent, IDataEvent } from "../events/events";
import { IPlotEngine } from "../engine/IPlotEngine";
import { XyData } from "../charting/XyData";
import { IChartData } from "../charting/IChartData";

export interface IFactory {
  newStartEvent(eventData: any, plotEngine: IPlotEngine): IStartEvent;
  newStopEvent(eventData: any, plotEngine: IPlotEngine): IStopEvent;
  newSpanEvent(eventData: any, plotEngine: IPlotEngine): ISpanEvent;
  newDataEvent(eventData: any, plotEngine: IPlotEngine): IDataEvent;

  newPlotEngine(): IPlotEngine;

  newChartData(xyDataArray: XyData[], xSpan: [Date, Date]): IChartData;
}
