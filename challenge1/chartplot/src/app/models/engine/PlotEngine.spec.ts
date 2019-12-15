import { TestBed } from '@angular/core/testing';
import { PlotEngine } from "./PlotEngine";
import { Factory } from "../factory/Factory.service";

describe('PlotEngine',
  () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should deny all events before start',
      () => {
        const factory = new Factory();
        const engine = new PlotEngine(new Factory());
        engine.addData(factory.newDataEvent("", engine));
        engine.setRange(factory.newSpanEvent("", engine));
        engine.setStop(factory.newStopEvent("", engine));
        const chartData = engine.readChartData();
        expect(chartData).toBeNull();
      });

    it('should ignore all events with timespan smaller than start timespan',
      () => {
        const factory = new Factory();
        const engine = new PlotEngine(new Factory());
        engine.setStart(factory.newStartEvent({ type: "start", timestamp: 10 }, engine));
        engine.addData(factory.newDataEvent({ type: "data", timestamp: 1 }, engine));
        engine.setRange(factory.newSpanEvent({ type: "data", timestamp: 2 }, engine));
        engine.setStop(factory.newStopEvent({ type: "data", timestamp: 9 }, engine));
        const chartData = engine.readChartData();
        expect(chartData).toBeNull();
      });

    it('should generate valid xy data on valid inputs',
      () => {
        const factory = new Factory();
        const engine = new PlotEngine(new Factory());
        engine.setStart(factory.newStartEvent({
            type: "start",
            timestamp: 10,
            select: ['min_response_time', 'max_response_time'],
            group: ['os', 'browser']
          },
          engine));
        engine.addData(factory.newDataEvent({
            type: "data",
            timestamp: 10,
            os: 'linux',
            browser: 'chrome',
            min_response_time: 0.1,
            max_response_time: 1.3
          },
          engine));
        engine.setRange(factory.newSpanEvent({
            type: "data",
            timestamp: 11,
            begin: 10,
            end: 12
          },
          engine));
        engine.setStop(factory.newStopEvent({ type: "data", timestamp: 15 }, engine));
        const chartData = engine.readChartData();

        const span = chartData.getXAxisSpan();
        expect(span[0].getTime() / 1000).toEqual(10);
        expect(span[1].getTime() / 1000).toEqual(12);

        const xy = chartData.getXyData();
        expect(xy.length).toEqual(2);
        expect(xy[0].label).toEqual("linux chrome min_response_time");
        expect(xy[1].label).toEqual("linux chrome max_response_time");

        expect(xy[0].data.length).toEqual(1);
        expect(xy[0].data[0]).toEqual({ x: new Date(10 * 1000), y: 0.1 });

        expect(xy[1].data.length).toEqual(1);
        expect(xy[1].data[0]).toEqual({ x: new Date(10 * 1000), y: 1.3 });
      });
  });
