export class XyData {
  data: { x: Date, y: number }[];
  label: string;

  constructor(data: { x: Date, y: number }[], label: string) {
    this.label = label;
    this.data = data;
  }
}
