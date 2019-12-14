import { IChartData } from "./chart/IChartData";
import { XyData } from "./chart/XyData";

export class ChartData implements IChartData {
  private xSpan: [Date, Date];
  private xyDataArray: XyData[];

  constructor(xyDataArray: XyData[], xSpan: [Date, Date]) {
    this.xSpan = xSpan;
    this.xyDataArray = xyDataArray;
  }

  getXyData(): XyData[] { return this.xyDataArray; }

  getXAxisSpan(): [Date, Date] {
    return this.xSpan;
  }

}
