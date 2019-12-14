class XyData {
  data: { x: number, y: number }[];
  label: string;

  constructor(data: { x: number, y: number }[],label:string) {
    this.label = label;
    this.data = data;
  }
}
