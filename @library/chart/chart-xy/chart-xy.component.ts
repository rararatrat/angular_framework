import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import { EditableComponent } from '@library/library.interface';

@Component({
  selector: 'eg-chart-xy',
  templateUrl: './chart-xy.component.html',
  styleUrls: ['./chart-xy.component.scss']
})
export class ChartXyComponent {

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

  public isLoading  : boolean = true;
  constructor(private _cdr: ChangeDetectorRef){}

  public triggerChangeDetection() {
    this._cdr.markForCheck(); // Marks the component and its ancestors as dirty
    this._cdr.detectChanges(); // Triggers change detection for the component and its descendants
  }

  ngOnInit(): void {
    setTimeout(() => {

    this.root = am5.Root.new(this.id);

    this.chart = this.root.container.children.push(am5xy.XYChart.new(this.root, {
      /* layout: this.root.verticalLayout, */
      crisp:true,
      width: am5.percent(100),
      height: am5.percent(100),
      marginLeft:0
    }));



    this._initBarChart(this.root);



    if(this.config != null){
      this._initBarChart(this.root);
      this.triggerChangeDetection();

    }

    }, 500);

  }

  private _initBarChart(root){
    let chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
      pinchZoomX: true
    }));

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
    cursor.lineY.set("visible", false);


    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    let xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 });
    xRenderer.labels.template.setAll({
      rotation: -45,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 15,
      oversizedBehavior: "truncate",
      maxWidth: 50,
      ellipsis: "..."
    });

    xRenderer.grid.template.setAll({
      location: 1
    })


    let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      maxDeviation: 0.3,
      categoryField: "category",
      renderer: xRenderer,
      tooltip: am5.Tooltip.new(root, {})
    }));

    let yRenderer = am5xy.AxisRendererY.new(root, {})
    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: yRenderer
    }));
    if(!this.show_label){
   /*    xRenderer.labels.template.adapters.add("text", function(text) {
        return ""; // Hide X axis labels
      }); */
      xRenderer.labels.template.set('visible', false)
      yRenderer.labels.template.set('visible', false)

      xRenderer.grid.template.set("strokeOpacity", 0) ;
      yRenderer.grid.template.set("strokeOpacity", 0) ;
    }

    // Create series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    let series = chart.series.push(am5xy.ColumnSeries.new(root, {
      name: "Series 1",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "value",
      sequencedInterpolation: true,
      categoryXField: "category",
      tooltip: am5.Tooltip.new(root, {
        labelText: "{valueY}"
      })
    }));

    series.columns.template.setAll({ cornerRadiusTL: 5, cornerRadiusTR: 5, strokeOpacity: 0 });
    series.columns.template.adapters.add("fill", function(fill, target) {
      return chart.get("colors").getIndex(series.columns.indexOf(target));
    });

    series.columns.template.adapters.add("stroke", function(stroke, target) {
      return chart.get("colors").getIndex(series.columns.indexOf(target));
    });

    // Set Labels
    /* if(!this.show_label)
    {
      series.labels.template.set("visible", false);
      series.ticks.template.set("visible", false);
    } */

    // Set data
    let data = this._data() ;

    xAxis.data.setAll(data);
    series.data.setAll(data);


    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    series.appear(0);
    chart.appear(0, 10);

    this.isLoading = false;
    this._cdr.detectChanges();
  }

  private _data(){
    if(this.data != null){
      return this.data;
    }else{
      return [{
        category: "USA",
        value: 2025
      }, {
        category: "China",
        value: 1882
      }, {
        category: "Japan",
        value: 1809
      }, {
        category: "Germany",
        value: 1322
      }, {
        category: "UK",
        value: 1122
      }, {
        category: "France",
        value: 1114
      }, {
        category: "India",
        value: 984
      }, {
        category: "Spain",
        value: 711
      }, {
        category: "Netherlands",
        value: 665
      }, {
        category: "South Korea",
        value: 443
      }, {
        category: "Canada",
        value: 441
      }]
    }
  }
  ngOnDestroy(): void {

  }


}
