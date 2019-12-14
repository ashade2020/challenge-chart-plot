class PlotEngine {
  private startTimestamp: number;
  private timeSeries = {};
  private select: string[];
  private groups: string[];

  isStarted(): boolean {
    if (this.startTimestamp)
      return true;
    else
      return false;
  }

  setStart(startEvent: IStartEvent) {
    this.startTimestamp = startEvent.timestamp;
    this.select = startEvent.select;
    this.groups = startEvent.group;
    this.timeSeries = {};
  }

  setRange(spanEvent: ISpanEvent) {
    throw new Error("not implemented yet.");
  }

  setStop(stopEvent: IStopEvent) {
    throw new Error("not implemented yet.");
  }

  addData(dataEvent: IDataEvent) {
    if (!this.isStarted() || dataEvent.timestamp < this.startTimestamp)
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

}
