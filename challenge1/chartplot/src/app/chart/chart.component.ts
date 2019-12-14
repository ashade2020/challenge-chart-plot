import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { IChartData } from "./IChartData";

import { BaseChartDirective } from 'ng2-charts/ng2-charts';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})
export class ChartComponent implements OnInit {
  @Input()
  set newData(data: IChartData) {
    this.updateChart(data);
  }

  barChartOptions = {
    scaleShowVerticalLines: true,
    responsive: true,
    legend: {
      position: 'right'
    },
    scales: {
      xAxes: [
        {
          type: 'time',
          unit: 'second',
          position: 'bottom',
          displayFormats: {
            second: 'h:mm:ss a'
          },
          ticks: {}
        }
      ]
    }
  };

  barChartLegend = true;
  barChartData = [];

  private updateChart(chartData: IChartData) {
    if (chartData) {
      this.barChartData = chartData.getXyData();
      this.updateChartRange(chartData);
    } else
      this.barChartData = [];
  }

  private updateChartRange(chartData: IChartData) {
    const xAxisRange = chartData.getXAxisSpan();
    if (xAxisRange) {
      this.barChartOptions = {
        scaleShowVerticalLines: true,
        responsive: true,
        legend: {
          position: 'right'
        },
        scales: {
          xAxes: [
            {
              type: 'time',
              unit: 'second',
              position: 'bottom',
              displayFormats: {
                second: 'h:mm:ss a'
              },
              ticks: {
                min: xAxisRange[0],
                max: xAxisRange[1]
              }
            }
          ]
        }
      };
    }
  }

  constructor() {}

  ngOnInit() {
  }

}
