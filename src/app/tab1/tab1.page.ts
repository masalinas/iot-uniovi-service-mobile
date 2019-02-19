import { Component, OnInit, NgZone, AfterViewInit, OnDestroy } from '@angular/core';

import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

import { MqttService } from '../services/mqtt.service';

am4core.useTheme(am4themes_animated);

@Component({
	selector: 'app-tab1',
	templateUrl: 'tab1.page.html',
	styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, AfterViewInit, OnDestroy {
	private chart: am4charts.XYChart;
	private dateAxis: am4charts.DateAxis;
	private seriesTemp: am4charts.LineSeries;
	private seriesHum: am4charts.LineSeries;

	constructor(private mqttService: MqttService, private zone: NgZone) {}

	ngOnInit(): void {
		this.mqttService.connect();
		this.mqttService.onMqttMessageChanged.subscribe((message: Object) => {
			if (message['device'] === 'TP01') {
				if (this.seriesTemp.data.length > 6) {
					this.seriesTemp.addData({date: new Date(), name: message['device'], value: message['value']}, 1);
				} else {
					this.seriesTemp.addData({date: new Date(), name: message['device'], value: message['value']});
				}
			}
			else {
				if (this.seriesHum.data.length > 6) {
					this.seriesHum.addData({date: new Date(), name: message['device'], value: message['value']}, 1);
				} else {
					this.seriesHum.addData({date: new Date(), name: message['device'], value: message['value']});
				}
			}

			// this makes date axis labels which are at equal minutes to be rotated
			this.dateAxis.renderer.labels.template.adapter.add(
				'rotation',
				(rotation, target) => {
					var dataItem = target.dataItem;
					if (dataItem['date'].getSeconds() == 0) {
						target.verticalCenter = 'middle';
						target.horizontalCenter = 'left';
						return -90;
					} else {
						target.verticalCenter = 'bottom';
						target.horizontalCenter = 'middle';
						return 0;
					}
				}
			);
		});
	}

	ngAfterViewInit() {
		this.zone.runOutsideAngular(() => {
			// create chart instance
			let chart = am4core.create('chartdiv', am4charts.XYChart);

			// chart.padding(10, 10, 10, 10);

			chart.zoomOutButton.disabled = true;

			let data = [];

			chart.data = data;

			// Increase contrast by taking evey second color
			chart.colors.step = 5;
			const interfaceColors = new am4core.InterfaceColorSet();

			const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
			dateAxis.tooltip.disabled = false;
			dateAxis.tooltipDateFormat = 'd MMM, H:mm:ss';
			dateAxis.renderer.grid.template.location = 0;
			dateAxis.renderer.minGridDistance = 30;
			dateAxis.dateFormats.setKey('second', 'ss');
			dateAxis.periodChangeDateFormats.setKey('second', '[bold]H:mm');
			dateAxis.periodChangeDateFormats.setKey('minute', '[bold]H:mm');
			dateAxis.periodChangeDateFormats.setKey('hour', '[bold]H:mm');
			dateAxis.renderer.axisFills.template.disabled = true;
			dateAxis.renderer.ticks.template.disabled = true;

			const valueAxisTemp = chart.yAxes.push(new am4charts.ValueAxis());
			valueAxisTemp.tooltip.disabled = true;
			valueAxisTemp.interpolationDuration = 500;
			valueAxisTemp.rangeChangeDuration = 500;
			valueAxisTemp.renderer.inside = true;
			valueAxisTemp.renderer.minLabelPosition = 0.05;
			valueAxisTemp.renderer.maxLabelPosition = 0.95;
			valueAxisTemp.renderer.axisFills.template.disabled = true;
			valueAxisTemp.renderer.ticks.template.disabled = true;

			const valueAxisHum = chart.yAxes.push(new am4charts.ValueAxis());
			valueAxisHum.tooltip.disabled = true;
			valueAxisHum.interpolationDuration = 500;
			valueAxisHum.rangeChangeDuration = 500;
			valueAxisHum.renderer.inside = true;
			valueAxisHum.renderer.minLabelPosition = 0.05;
			valueAxisHum.renderer.maxLabelPosition = 0.95;
			valueAxisHum.renderer.axisFills.template.disabled = true;
			valueAxisHum.renderer.ticks.template.disabled = true;
			valueAxisHum.renderer.opposite = true;
			

			const seriesTemp = chart.series.push(new am4charts.LineSeries());
			seriesTemp.yAxis = valueAxisTemp;
			seriesTemp.dataFields.dateX = 'date';
			seriesTemp.dataFields.valueY = 'value';
			seriesTemp.name = 'TP01';
			seriesTemp.tooltipText = '[bold]{name}: {valueY} ºC[/]';
			// seriesTemp.legendSettings.itemValueText = '{valueY} ºC';
			seriesTemp.legendSettings.valueText = '{valueY.close} ºC';
			seriesTemp.strokeWidth = 2;
			seriesTemp.interpolationDuration = 500;
			seriesTemp.defaultState.transitionDuration = 2;
			seriesTemp.tensionX = 0.8;

			const seriesHum = chart.series.push(new am4charts.LineSeries());
			seriesHum.yAxis = valueAxisHum;
			seriesHum.dataFields.dateX = 'date';
			seriesHum.dataFields.valueY = 'value';
			seriesHum.name = 'RH01';
			seriesHum.tooltipText = '[bold]{name}: {valueY} %[/]';
			// seriesHum.legendSettings.itemValueText = '{valueY} %';
			seriesHum.legendSettings.valueText = '{valueY.close} %';
			seriesHum.strokeWidth = 2;
			seriesHum.interpolationDuration = 500;
			seriesHum.defaultState.transitionDuration = 2;
			seriesHum.tensionX = 0.8;

			// series label color
			valueAxisTemp.renderer.labels.template.fill = seriesTemp.stroke;
			valueAxisHum.renderer.labels.template.fill = seriesHum.stroke;

			chart.events.on('datavalidated', function() {
				dateAxis.zoom({ start: 1 / 15, end: 1.2 }, false, true);
			});

			const bulletTemp = seriesTemp.bullets.push(new am4charts.Bullet());
			bulletTemp.width = 13;
			bulletTemp.height = 13;
			bulletTemp.horizontalCenter = 'middle';
			bulletTemp.verticalCenter = 'middle';
			bulletTemp.states.create('hover');

			const rectangleTemp = bulletTemp.createChild(am4core.Rectangle);
			rectangleTemp.stroke = interfaceColors.getFor('background');
			rectangleTemp.strokeWidth = 2;
			rectangleTemp.width = 13;
			rectangleTemp.height = 13;

      const bulletHum = seriesHum.bullets.push(new am4charts.CircleBullet);
      bulletHum.circle.radius = 5;
      bulletHum.fillOpacity = 1;
			bulletHum.fill = interfaceColors.getFor('background');
			bulletHum.circle.strokeWidth = 2;
			bulletHum.states.create('hover');
			
			// add cursor
			const cursor = new am4charts.XYCursor();
			cursor.behavior = 'none';
			cursor.fullWidthLineX = true;

			chart.cursor = cursor;

			// add legend
			chart.legend = new am4charts.Legend();

      this.seriesTemp = seriesTemp;
      this.seriesHum = seriesHum;
			this.dateAxis = dateAxis;
			this.chart = chart;
		});
	}

	ngOnDestroy() {
		this.zone.runOutsideAngular(() => {
			if (this.chart) {
				this.chart.dispose();
			}
		});
	}
}
