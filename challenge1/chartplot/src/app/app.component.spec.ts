import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';

import { ChartsModule } from "ng2-charts";
import { AceEditorModule } from 'ng2-ace-editor';
import { ResizableModule } from 'angular-resizable-element';
import { ChartComponent } from "./chart/chart.component";

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ChartsModule,
        AceEditorModule,
        ResizableModule
      ],
      declarations: [
        AppComponent,
        ChartComponent
      ],
      
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'chartplot'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('chartplot');
  });
});
