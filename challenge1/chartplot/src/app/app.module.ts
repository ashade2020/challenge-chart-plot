import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AceEditorModule } from 'ng2-ace-editor';
import { ChartsModule } from 'ng2-charts';
import { ChartComponent } from './chart/chart.component';
import { ResizableModule } from 'angular-resizable-element';

import { Factory } from "./models/factory/Factory.service";

@NgModule({
  declarations: [
    AppComponent,
    ChartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AceEditorModule,
    ChartsModule,
    ResizableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
