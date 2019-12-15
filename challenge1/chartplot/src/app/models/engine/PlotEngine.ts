import { IPlotEngine } from './IPlotEngine'
import { IStartEvent, ISpanEvent, IStopEvent, IDataEvent } from "../events/events";
import { IChartData } from "../charting/IChartData";
import { XyData } from "../charting/XyData";
import { IFactory } from "../factory/IFactory";

export class PlotEngine implements IPlotEngine {
  /**
   * This class is the receiver equivalent of the command design pattern
   * (https://en.wikipedia.org/wiki/Command_pattern). It works like a state machine that
   * registers all data, grouped by timeseries [(group, select) key] and takes care of the events
   * sequence.
   */
  private startTimestamp: number;
  private lastStopTimestamp: number;
  private timeSeries: { [id: string]: [number, number][]; } = {};
  private select: string[];
  private groups: string[];
  private beginDate: number;
  private endDate: number;
  private maximumDataPoints = 1000; // protection mechanism: receiving data points is stopped after we reach this limit.

  constructor(private readonly factory: IFactory) {
    this.doReset();
  }

  isStarted(): boolean {
    if (!this.startTimestamp)
      return false;
    if (this.lastStopTimestamp && this.lastStopTimestamp > this.startTimestamp)
      return false;
    return true;
  }

  setStart(startEvent: IStartEvent) {
    if (!this.canStart(startEvent))
      return;
    this.doReset();
    this.startTimestamp = startEvent.timestamp;
    this.select = startEvent.select;
    this.groups = startEvent.group;
  }

  private canStart(startEvent: IStartEvent): boolean {
    if (!startEvent.timestamp)
      return false;
    if (this.lastStopTimestamp && this.lastStopTimestamp > startEvent.timestamp)
      return false;
    return true;
  }

  setRange(spanEvent: ISpanEvent) {
    if (!this.isStarted())
      return; // ignore this span event.
    if (!spanEvent.timestamp || spanEvent.timestamp < this.startTimestamp)
      return; // ignore this event, because the timestamp is invalid.
    if (spanEvent.end < spanEvent.begin)
      return; // ignore event when begin date is older than end date.
    this.beginDate = spanEvent.begin;
    this.endDate = spanEvent.end;
  }

  setStop(stopEvent: IStopEvent) {
    if (!this.isStarted() || !stopEvent.timestamp || stopEvent.timestamp < this.startTimestamp)
      return; // ignore this stop event.
    this.lastStopTimestamp = stopEvent.timestamp;
  }

  private doReset() {
    this.startTimestamp = null;
    this.lastStopTimestamp = null;
    this.select = null;
    this.groups = null;
    this.beginDate = null;
    this.endDate = null;
    this.timeSeries = {};
  }

  addData(dataEvent: IDataEvent) {
    if (!this.isStarted() || !dataEvent.timestamp || dataEvent.timestamp < this.startTimestamp)
      return; // ignore this data event.
    if (this.isTooMuchData())
      return; // ignore this data event because the engine is flooded.
    this.fillTimeSeries(dataEvent);
  }

  private fillTimeSeries(dataEvent: IDataEvent) {
    const groupValues = dataEvent.readGroupValues(this.groups);
    for (let seriesName of this.select)
      this.pushNewTimeSeriesValue(dataEvent, groupValues, seriesName);
  }

  private pushNewTimeSeriesValue(dataEvent: IDataEvent, groupValues: string[], seriesName: string) {
    const seriesValue = dataEvent.readValue(seriesName);
    if (!seriesValue)
      return;
    const key = this.getFormattedKey(groupValues, seriesName);
    if (key in this.timeSeries)
      this.timeSeries[key].push([dataEvent.timestamp, seriesValue]);
    else
      this.timeSeries[key] = [[dataEvent.timestamp, seriesValue]];
  }

  private getFormattedKey(groupValues: string[], seriesName: string): string {
    let formattedValue = "";
    for (let groupValue of groupValues) {
      formattedValue += groupValue + " ";
    }
    formattedValue += seriesName;
    return formattedValue;
  }

  readChartData(): IChartData {
    if (!this.timeSeries)
      return null;
    const xyDataArray: XyData[] = [];
    const timeSeries = this.timeSeries;
    for (let seriesLabel in timeSeries)
      if (timeSeries.hasOwnProperty(seriesLabel))
        this.buildXyDataArray(timeSeries[seriesLabel], seriesLabel, xyDataArray);
    if (xyDataArray.length <= 0)
      return null;
    return this.factory.newChartData(xyDataArray,
      [this.convertToTime(this.beginDate), this.convertToTime(this.endDate)]);
  }

  private buildXyDataArray(seriesValues: [number, number][], seriesLabel: string, currentXyDataArray: XyData[]) {
    const xyValues = this.sortAndFilterSeriesValuesBySpan(seriesValues);
    const xyData = this.buildXyDataFromFilteredAndSortedValues(xyValues, seriesLabel);
    currentXyDataArray.push(xyData);
  }

  private sortAndFilterSeriesValuesBySpan(seriesValues: [number, number][]): [number, number][] {
    const sortedValues = seriesValues.sort((a, b) => a[0] - b[0]);
    const filteredAndSortedValues = this.filterBySpan(sortedValues);
    return filteredAndSortedValues;
  }

  private filterBySpan(seriesValues: [number, number][]): [number, number][] {
    const outValues: [number, number][] = [];
    for (let entry of seriesValues) {
      if ((this.beginDate && entry[0] < this.beginDate) || (this.endDate && entry[0] > this.endDate))
        continue;
      outValues.push(entry);
    }
    return outValues;
  }

  private buildXyDataFromFilteredAndSortedValues(filteredAndSortedValues: [number, number][], label: string): XyData {
    const xyValues: { x: Date,y: number }[] = [];
    for (let value of filteredAndSortedValues) {
      const [x, y] = value;
      const xLabel = this.convertToTime(x);
      xyValues.push({ x: xLabel, y });
    }
    return new XyData(xyValues, label);
  }

  convertToTime(unixTimestampMs: number): Date {
    if (!unixTimestampMs)
      return null;
    const date = new Date(unixTimestampMs * 1000);
    return date;
  }

  private isTooMuchData() {
    let totalLength = 0;
    const timeSeries = this.timeSeries;
    for (let seriesId in timeSeries)
      if (timeSeries.hasOwnProperty(seriesId))
        totalLength += timeSeries[seriesId].length;
    return totalLength >= this.maximumDataPoints;
  }
}
