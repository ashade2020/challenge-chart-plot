class PlotEngine implements IPlotEngine {
  /**
   * This class is the receiver equivalent of the command design pattern
   * (https://en.wikipedia.org/wiki/Command_pattern). It works like a state machine that
   * registers all data, grouped by timeseries (group, select) key and takes care of the events
   * sequence.
   */
  private startTimestamp: number;
  private lastStopTimestamp: number;
  private timeSeries: { [id: string]: [number, number][]; } = {};
  private select: string[];
  private groups: string[];
  private beginDate: number;
  private endDate: number;

  isStarted(): boolean {
    if (this.startTimestamp)
      return true;
    else
      return false;
  }

  setStart(startEvent: IStartEvent) {
    if (!this.canStart(startEvent))
      return;
    this.startTimestamp = startEvent.timestamp;
    this.select = startEvent.select;
    this.groups = startEvent.group;
    this.timeSeries = {};
  }

  private canStart(startEvent: IStartEvent): boolean {
    if (this.isStarted())
      return false;
    if (!this.startTimestamp || !this.lastStopTimestamp)
      return true;
    if (!startEvent.timestamp)
      return false;
    return this.lastStopTimestamp <= startEvent.timestamp;

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
    this.doReset();
    this.lastStopTimestamp = stopEvent.timestamp;
  }

  constructor() {
    this.doReset();
  }

  private doReset() {
    this.startTimestamp = null;
    this.select = null;
    this.groups = null;
    this.beginDate = null;
    this.endDate = null;
  }

  addData(dataEvent: IDataEvent) {
    if (!this.isStarted() || !dataEvent.timestamp || dataEvent.timestamp < this.startTimestamp)
      return; // ignore this data event.
    this.fillTimeSeries(dataEvent);
  }

  private fillTimeSeries(dataEvent: IDataEvent) {
    const groupValues = dataEvent.readGroupValues(this.groups);
    for (let seriesName of this.select)
      this.pushNewTimeSeriesValue(dataEvent, groupValues, seriesName);
  }

  private pushNewTimeSeriesValue(dataEvent: IDataEvent, groupValues: string[], seriesName: string) {
    const seriesValue = dataEvent.readValue(seriesName);
    const key = this.getFormattedKey(groupValues, seriesName);
    if (key in this.timeSeries)
      this.timeSeries[key].push([dataEvent.timestamp, seriesValue]);
    else
      this.timeSeries[key] = [[dataEvent.timestamp, seriesValue]];
  }

  private getFormattedKey(groupValues: string[], seriesName: string): string {
    let formattedValue = "";
    for (let groupValue of groupValues) {
      formattedValue += groupValue + "____";
    }
    formattedValue += seriesName;
    return formattedValue;
  }

  readChartData(): IChartData {
    const xyDataArray: XyData[] = [];
    const timeSeries = this.timeSeries;
    for (let seriesLabel in timeSeries)
      this.buildXyDataArray(timeSeries[seriesLabel], seriesLabel, xyDataArray);
    return new ChartData(xyDataArray);
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
      if (entry[0] < this.beginDate || entry[0] > this.endDate)
        continue;
      outValues.push(entry);
    }
    return outValues;
  }

  buildXyDataFromFilteredAndSortedValues(filteredAndSortedValues: [number, number][], label: string): XyData {
    const xyValues: { x: number,y: number }[] = [];
    for (let value of filteredAndSortedValues) {
      const [x, y] = value;
      xyValues.push({ x, y });
    }
    return new XyData(xyValues, label);
  }
}
