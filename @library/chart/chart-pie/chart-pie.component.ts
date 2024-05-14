import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import { EditableComponent } from '@library/library.interface';

@Component({
  selector: 'eg-chart-pie',
  templateUrl: './chart-pie.component.html',
  styleUrls: ['./chart-pie.component.scss']
})
export class ChartPieComponent implements OnInit, OnDestroy {
  @Input("config")    config    : EditableComponent;
  @Input("topic")     topic     : any;
  @Input("topicId")   topicId   : any;
  @Input("data")      data      : any = null;
  @Input("show_label")show_label: boolean = true;
  @Input("id")        id        : any = "chartdiv";
  @Output("callback") callback  = new EventEmitter();

  public root       : any;
  public container  : any;
  public series     : any;
  public icon       : any;
  public chart      : any;

  public isLoading  : boolean = true;
  constructor(private _cdr: ChangeDetectorRef){}


  ngOnInit(): void {
    setTimeout(() => {

    this.root = am5.Root.new(this.id);

    this.chart = this.root.container.children.push(am5percent.PieChart.new(this.root, {
      layout: this.root.verticalLayout,
      width: am5.percent(100),
      height: am5.percent(100),
    }));



    this._initChart();
    //console.log(this.chart)

    if(this.config != null){
      this._initChart();
      }
    }, 1000);

  }

  private _initChart(){

    this.series = this.chart.series.push(am5percent.PieSeries.new(this.root, {
      valueField    : "value",
      categoryField : "category",
      alignLabels   : false,
    }));

    if(this.show_label)
    {
      this.series.labels.setAll({
        textType          : "circular",
        centerX           : 0,
        centerY           : 0,
        disabled          : true,
        oversizedBehavior : "truncate",
        ellipsis          : "..."
      });
    }
    else
    {
      this.series.labels.template.set("visible", false);
      this.series.ticks.template.set("visible", false);
    }

    this.series?.data?.setAll(this.data);



    /* let legend = this.chart.children.push(am5.Legend.new(this.root, {
      centerX: am5.percent(50),
      x: am5.percent(50),
      marginTop: 15,
      marginBottom: 50
    }));

    legend.data.setAll(this.series.dataItems); */

    // Add an icon to node
    //this._getData(this.config);
    //this._fetchData();
    this.isLoading = false;
    this._cdr.detectChanges();
  }




  private _setImgToNode(){
  // Disable circles
    this.series.circles.template.set("forceHidden", true);
    this.series.outerCircles.template.set("forceHidden", true);

    // ... except for central node
    this. series.circles.template.adapters.add("forceHidden", function(forceHidden, target) {
      return target.dataItem.get("depth") == 0 ? false: forceHidden;
    });

    // Set up labels
    this.series.labels.template.setAll({
      fill: am5.color(0x000000),
      y: 45,
      oversizedBehavior: "none"
    });

    // Use adapter to leave central node label centered
    this.series.labels.template.adapters.add("forceHidden", function(forceHidden, target) {
      return target.dataItem.get("depth") == 0 ? false : forceHidden;
    });

    let that = this;
    this.series.nodes.template.setup = function(target) {
      target.events.on("dataitemchanged", function(ev) {
        //console.log(ev.target.dataItem.dataContext?.user?.picture)
        let icon = target.children.push(am5.Picture.new(that.root, {
          width: 70,
          height: 70,
          centerX: am5.percent(50),
          centerY: am5.percent(50),
          src: ev.target.dataItem.dataContext?.user?.picture
        }));
      });
    }

  }

  private _getData(config){
    config.api$({[this.topic]: this.topicId}).subscribe({
      next : (res) =>{
        //console.log(res.content.results[0]);
        this.data = res.content.results[0];

      },
      error : (err) => {},
      complete : () => {
        this.series.data.setAll([this.data]);
        this.series.set("selectedDataItem", this.series.dataItems[0]);
      }
    })
  }

  private _fetchData(){
    let maxLevels = 2;
    let maxNodes = 5;
    let maxValue = 100;

    let data2 = {
      name: "Root",
      children: []
    }
    this.data = generateLevel(data2, "", 0);
    //console.log(this.data);
    this.series.data.setAll([this.data]);
    this.series.set("selectedDataItem", this.series.dataItems[0]);

    function generateLevel(data, name, level) {
      for (var i = 0; i < Math.ceil(maxNodes * Math.random()) + 1; i++) {
        let nodeName = name + "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[i];
        let child;
        if (level < maxLevels) {
          child = {
            name: nodeName + level
          }

          if (level > 0 && Math.random() < 0.5) {
            child.value = Math.round(Math.random() * maxValue);
          }
          else {
            child.children = [];
            generateLevel(child, nodeName + i, level + 1)
          }
        }
        else {
          child = {
            name: name + i,
            value: Math.round(Math.random() * maxValue)
          }
        }
        data.children.push(child);
      }

      level++;
      return data;
    }
  }

  private _modifyData(){

  }

  ngOnDestroy(): void {

  }


}
