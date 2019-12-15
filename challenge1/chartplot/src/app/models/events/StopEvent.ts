import { IPlotEngine } from "../engine/IPlotEngine";
import { IStopEvent } from "./events";

export class StopEvent implements IStopEvent {
  private plotEngine: IPlotEngine;

  constructor(eventData: any, plotEngine: IPlotEngine) {
    Object.assign(this, eventData);
    this.plotEngine = plotEngine;
  }

  execute() {
    this.plotEngine.setStop(this);
  }

  type: string;
  timestamp: number;
}
