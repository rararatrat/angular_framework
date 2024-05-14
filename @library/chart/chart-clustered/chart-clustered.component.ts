import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import { EditableComponent } from '@library/library.interface';
import { ObjectUnsubscribedError } from 'rxjs';

@Component({
  selector: 'eg-chart-clustered',
  templateUrl: './chart-clustered.component.html',
  styleUrls: ['./chart-clustered.component.scss']
})
export class ChartClusteredComponent {

  @Input("config")    config    : EditableComponent;
  @Input("topic")     topic     : any;
  @Input("topicId")   topicId   : any;
  @Input("id")        id        : any = "chartdivbarchart";
  @Input("show_label")show_label: boolean = true;
  @Input("data")      data      : any = null;
  @Output("callback") callback  = new EventEmitter();

  public root       : any;
  public container  : any;
  public series     : any;
  public icon       : any;
  public chart      : any;
  public legend     : any;

  public isLoading  : boolean = true;
  constructor(private _cdr: ChangeDetectorRef){}

  public triggerChangeDetection() {
    this._cdr.markForCheck(); // Marks the component and its ancestors as dirty
    this._cdr.detectChanges(); // Triggers change detection for the component and its descendants
  }

  ngOnInit(): void {
    setTimeout(() => {
    //this.data = this._data();
    this.root = am5.Root.new(this.id);

    this.chart = this.root.container.children.push(am5xy.XYChart.new(this.root, {
      /* layout: this.root.verticalLayout, */
      crisp:true,
      width: am5.percent(100),
      height: am5.percent(100),
      marginLeft:0,
      layout: this.root.verticalLayout
    }));

    this.legend = this.chart.children.push(
      am5.Legend.new(this.root, {
        centerX: am5.p50,
        x: am5.p50
      }));

    this._initBarChart(this.root);

    if(this.config != null){
      this._initBarChart(this.root);
      this.triggerChangeDetection();

    }

    }, 500);

  }

  private _initBarChart(root){
    this.data = this._data();

    let xRenderer = am5xy.AxisRendererX.new(root, {
      cellStartLocation: 0.1,
      cellEndLocation: 0.9
    })

    let xAxis = this.chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      categoryField: "category",
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {})
    }));

    xRenderer.grid.template.setAll({
      location: 1
    })

    xAxis.data.setAll(this.data);

    let yAxis = this.chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {
        strokeOpacity: 0.1
      })
    }));



    setTimeout(() => {
      Object.keys(this.data[0]['value']).forEach(e => {
        this._makeSeries(e.charAt(0).toUpperCase()+ e.slice(1), e, xAxis, yAxis, this.chart, root, this.legend, this.data);
      })
      this.isLoading = false;
    }, 10);

    this._cdr.detectChanges();

  }

  private _data(){
    const _tmp = this.data.map(e => {
      if(typeof(e) == "object"){
        const _f = {...e, ...e['value']}
        delete e['value']
        return _f
      }
    });
      return _tmp;

  }

  private _makeSeries(name, fieldName, xAxis, yAxis, chart, root, legend, data){
    let series = chart.series.push(am5xy.ColumnSeries.new(root, {
      name: name,
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: fieldName,
      categoryXField: "category"
    }));

    series.columns.template.setAll({
      tooltipText: "{name}, {categoryX}:{valueY}",
      width: am5.percent(90),
      tooltipY: 0,
      strokeOpacity: 0
    });

    series.data.setAll(data);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear();

    series.bullets.push(function() {
      return am5.Bullet.new(root, {
        locationY: 0,
        sprite: am5.Label.new(root, {
          text: "{valueY}",
          fill: root.interfaceColors.get("alternativeText"),
          centerY: 0,
          centerX: am5.p50,
          populateText: true
        })
      });
    });

    legend.data.push(series);
  }

  ngOnDestroy(): void {

  }
}
