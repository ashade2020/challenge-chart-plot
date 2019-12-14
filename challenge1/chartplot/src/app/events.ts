interface IBasicEvent {
  /*
   * This is the interface for a basic event. Is is the command equivalent in the command design pattern
   * (https://en.wikipedia.org/wiki/Command_pattern). To execute this command instance, call method execute().
   * Implementations of this interface should be aware of what to do within the execute method. Typically, one
   * should call appropriate receiver methods to register this command.
   */
  type: string;
  timestamp: number;

  execute();
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
