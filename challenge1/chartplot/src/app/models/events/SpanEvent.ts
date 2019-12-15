import { IPlotEngine } from "../engine/IPlotEngine";
import { ISpanEvent } from "./events";

export class SpanEvent implements ISpanEvent {
  private plotEngine: IPlotEngine;

  constructor(eventData: any, plotEngine: IPlotEngine) {
    Object.assign(this, eventData);
    this.plotEngine = plotEngine;
  }

  execute() {
    this.plotEngine.setRange(this);
  }

  type: string;
  timestamp: number;
  begin: number;
  end: number;
}
