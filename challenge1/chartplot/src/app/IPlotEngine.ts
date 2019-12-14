interface IPlotEngine {
  /**
   * This is the receiver equivalent of the command design pattern
   * (https://en.wikipedia.org/wiki/Command_pattern). It works like a state machine that
   * registers all data, grouped by timeseries (group, select) key and takes care of the events
   * sequence.
   */
  isStarted(): boolean;
  setStart(startEvent: IStartEvent);
  setRange(spanEvent: ISpanEvent);
  setStop(stopEvent: IStopEvent);
  addData(dataEvent: IDataEvent);
  readChartData(): IChartData;
}
