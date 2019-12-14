class DataEvent implements IDataEvent {
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

  constructor(eventData: any) {
    this.allValues = eventData;
    this.type = eventData.type;
    this.timestamp = eventData.timestamp;
  }

  private allValues: {}
  type: string;
  timestamp: number;
}
