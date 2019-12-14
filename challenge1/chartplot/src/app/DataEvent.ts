import { IDataEvent } from "./events";
import { IPlotEngine } from "./IPlotEngine";

export class DataEvent implements IDataEvent {
  private plotEngine: IPlotEngine;

  readValue(seriesName: string): number {
    if (seriesName in this.allValues)
      return this.allValues[seriesName];
    else
      return 0.0;
  }

  readGroupValues(group: string[]): string[] {
    const values: string[] = [];
    for (let groupId of group)
      if (groupId in this.allValues)
        values.push(this.allValues[groupId]);
      else
        values.push(null);
    return values;
  }

  execute() {
    this.plotEngine.addData(this);
  }

  constructor(eventData: any, plotEngine: IPlotEngine) {
    this.plotEngine = plotEngine;
    this.allValues = eventData;
    this.type = eventData.type;
    this.timestamp = eventData.timestamp;
  }

  private allValues: {}
  type: string;
  timestamp: number;
}
