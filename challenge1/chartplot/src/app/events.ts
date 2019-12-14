interface IBasicEvent {
  type: string;
  timestamp: number;
}

interface IStartEvent extends IBasicEvent {
  select: string[];
  group: string[];
}

interface ISpanEvent extends IBasicEvent {
  begin: number;
  end: number;
}

interface IStopEvent extends IBasicEvent {
}

interface IDataEvent extends IBasicEvent {
  readGroupValues(group: string[]): string[];
  readValue(seriesName: string): number;
}
