import { XyData } from "./XyData";

export interface IChartData {
  getXyData(): XyData[];
  getXAxisSpan(): [Date, Date];
}
