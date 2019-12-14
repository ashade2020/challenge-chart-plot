class ChartData implements IChartData {
  private xyDataArray: XyData[];

  constructor(xyDataArray: XyData[]) {
    this.xyDataArray = xyDataArray;
  }
  
  getXyData(): XyData[] { return this.xyDataArray; }

}
