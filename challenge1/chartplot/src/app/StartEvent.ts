import { IPlotEngine } from "./IPlotEngine";
import { IStartEvent } from "./events";

export class StartEvent implements IStartEvent {
  private plotEngine: IPlotEngine;

  constructor(eventData: any, plotEngine: IPlotEngine) {
    Object.assign(this, eventData);
    this.plotEngine = plotEngine;
  }

  execute() {
    this.plotEngine.setStart(this);
  }

  select: string[];
  group: string[];
  type: string;
  timestamp: number;
}
