import { Subject } from 'rxjs/Subject';
import { map as _map, maxBy as _maxBy, minBy as _minBy } from "lodash";
import { Component, OnInit, ViewChild, ElementRef, OnDestroy, Input } from '@angular/core';
import { DatePipe } from "@angular/common";
import * as d3 from "d3";
import { colors, dtToTimezone } from "app/shared/globals";
import { FleetService } from "app/forms/user/fleet/fleet.service";

@Component({
  selector: 'logbook-timescalebar',
  templateUrl: './timescalebar.Component.html'
})

export class TimescalebarComponent implements OnInit, OnDestroy {

  @ViewChild('timeScale') timeScaleRef: ElementRef;

  ngUnsubscribe: Subject<void> = new Subject<void>();

  svgGraph: any = null;
  logbookData: any = null;
  displayData: any = null;
  loadingTimescale: boolean = false;

  selectedTripIndex: number = null;

  constructor(
    private fleetService: FleetService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.loadingTimescale = true;
    this.fleetService.subscribeToLoading().takeUntil(this.ngUnsubscribe).subscribe(
      res => this.loadingTimescale = res,
      err => this.loadingTimescale = false);

    this.fleetService.subscribeToVehicleDetail().takeUntil(this.ngUnsubscribe).subscribe(res => {
      this.logbookData = res ? res.data : res;
      this.destroyGraph();
      if (this.logbookData && this.logbookData.VehicleTrips) {
        this.loadingTimescale = false;
        let trips = this.logbookData.VehicleTrips;

        let data = [];
        let allTrips = [];

        _map(trips, (v, i) => {
          let items = [];
          _map(v.DeviceMessages, d => {
            let obj = {
              x: new Date(d.UpdateTimeUTC),
              y: d.Speed
            };
            items.push(obj);
            allTrips.push(obj);
          });
          if (items.length > 0)
            data.push(items);
        });

        if (data.length > 0) {
          let startDt = new Date(trips[0]['JourneyStartDate']).setHours(0, 0, 0, 0);

          let endDt = null;
          if (trips[trips.length - 1]['JourneyEndDate'])
            endDt = new Date(trips[trips.length - 1]['JourneyEndDate']).setHours(23, 59, 59, 999);
          else {
            let deviceMsg = trips[trips.length - 1]['DeviceMessages'];
            endDt = new Date(deviceMsg[deviceMsg.length - 1]['UpdateTimeUTC']).setHours(23, 59, 59, 999);
          }

          this.loadGraph(data, allTrips, startDt, endDt);
        }
      }
    }, err => this.loadingTimescale = false);

  }

  loadGraph(data, allTrips, startDt, endDt) {
    // Reference links: 
    // https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172
    // https://bl.ocks.org/alandunning/cfb7dcd7951826b9eacd54f0647f48d3
    // https://bl.ocks.org/larsenmtl/e3b8b7c2ca4787f77d78f58d41c3da91#index.html

    let main = this;
    var svg = d3.select("#timeScale");
    this.svgGraph = svg;
    let diffDate = main.datePipe.transform(startDt, 'dd') != main.datePipe.transform(endDt, 'dd');

    var graphWidth = this.timeScaleRef.nativeElement.clientWidth,
      graphHeight = this.timeScaleRef.nativeElement.clientHeight,
      margin = { top: 10, right: 20, bottom: 25, left: 30 },
      width = graphWidth - margin.left - margin.right,
      height = graphHeight - margin.top - margin.bottom,
      defaultTransform = "translate(" + margin.left + "," + margin.top + ")";

    var x = d3.scaleTime().range([0, width]),
      x2 = d3.scaleTime().range([0, width]),
      y = d3.scaleLinear().range([height, 0]);

    x.domain([startDt, endDt]);
    y.domain([0, 150]);
    x2.domain(x.domain());

    var xAxis = d3.axisBottom(x),
      yAxis = d3.axisLeft(y).ticks(4);

    var line = d3.line().x(function (d) { return x(d.x); }).y(function (d) { return y(d.y); });
    var area = d3.area().x(function (d) { return x(d.x); }).y0(height).y1(function (d) { return y(d.y); });
    var bisectDate = d3.bisector(function (d) { return d.x; }).left;

    svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(30," + (height + margin.top) + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", defaultTransform)
      .call(yAxis)
      .append("text")
      .attr("class", "axis-y-title")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .text("Speed (Km)");;

    var graph = svg.append("g")
      .attr("clip-path", "url(#clip)")
      .attr("transform", defaultTransform);

    // draw graph
    data.map((x, i) => {
      graph.append("path")
        .datum(x)
        .attr("class", `area${i}`)
        .attr("stroke-width", `0`)
        .attr("fill", `${colors[i % colors.length]}`)
        .attr("fill-opacity", '0.3')
        .attr("d", area);
      graph.append("path")
        .datum(x)
        .attr("fill", 'none')
        .attr("class", `line line${i}`)
        .attr("stroke", `${colors[i % colors.length]}`)
        .attr("stroke-width", 1.5)
        .attr("d", line);
    });

    var graphInfo = svg.append("g")
      .style("display", "none")
      .attr("transform", defaultTransform);

    // vertical line to follow mouse
    graphInfo.append("path")
      .attr("class", "mouse-line");

    // circle to dislay speed
    graphInfo.append("circle")
      //.attr("class", "circle")
      .attr("r", 6)
      .attr("transform", defaultTransform);

    // information box to display speed/hr
    graphInfo.append("foreignObject")
      .attr("dy", ".31em")
      .append("xhtml:body")
      .attr("class", "d3Info");

    // display graph information on hover
    function displayInfo(that: any) {

      var mouse = d3.mouse(that)[0];
      var x0 = x.invert(mouse),
        i = bisectDate(allTrips, x0, 1),
        d0 = allTrips[i - 1],
        d1 = allTrips[i] ? allTrips[i] : d0,
        d = x0 - d0.x > d1.x - x0 ? d1 : d0;

      var lineOnGraph = false;
      var lineOnGraphIndex = null;
      data.map((d, i) => {
        graph.select(`.line${i}`).attr("stroke-width", 1.5);
        var startDate = d[0].x,
          endDate = d[d.length - 1].x,
          date = x0;
        if (startDate <= date && date <= endDate) {
          lineOnGraph = true;
          lineOnGraphIndex = i;
        }
      });

      graphInfo.select("foreignObject")
        .attr("transform", "translate(" + (x(x0) - (diffDate ? 55 : 40)) + "," + y(160) + ")");
      graphInfo.select(".d3Info")
        .html(function () {
          return `<div class="info-box" style="width:${diffDate ? '110px' : '80px'}; color: ${lineOnGraph ? colors[lineOnGraphIndex % colors.length] : '#222'}; border-color: ${lineOnGraph ? colors[lineOnGraphIndex % colors.length] : '#999'}">
          <div class="speed-info">${lineOnGraph ? d.y : 0} km/h</div>
          <div class="hr-info">${
            (diffDate ? main.datePipe.transform((lineOnGraph ? d.x : x0), 'dd MMM') + ', ' : '') +
            main.datePipe.transform((lineOnGraph ? d.x : x0), 'jm')}</div>
          </div>`
        });

      graphInfo.select(".mouse-line").attr("stroke", `${lineOnGraph ? colors[lineOnGraphIndex % colors.length] : '#000'}`);

      if (lineOnGraph) {
        graphInfo.select("circle")
          .attr("opacity", "1")
          .attr("fill", `${colors[lineOnGraphIndex % colors.length]}`)
          .attr("fill-opacity", '0.3')
          .attr("stroke", `${colors[lineOnGraphIndex % colors.length]}`)
          .attr("transform", "translate(" + x(d.x) + "," + y(d.y) + ")");

        graph.select(`.line${lineOnGraphIndex}`).attr("stroke-width", 3.5);
      }
      else {
        graphInfo.select("circle").attr("opacity", "0");
        if (main.selectedTripIndex != null)
          graph.select(`.line${main.selectedTripIndex}`).attr("stroke-width", 3.5);
      }

      if (main.displayData != d.x && lineOnGraph) {
        main.displayData = d.x;
        main.fleetService.setVehiclePosition(d.x);
      }
      else if (main.displayData && !lineOnGraph) {
        main.displayData = null;
        main.fleetService.setVehiclePosition(null);
      }

      d3.select(".mouse-line")
        .attr("d", function () {
          var d = "M" + mouse + "," + height;
          d += " " + mouse + "," + 0;
          return d;
        });
    }

    // bind graph zoom event
    function zoomGraph() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush

      var t = d3.event.transform;
      x.domain(t.rescaleX(x2).domain());

      data.map((d, i) => {
        graph.select(`.line${i}`).attr("d", line);
        graph.select(`.area${i}`).attr("d", area);
      });
      svg.select(".axis--x").call(xAxis);

      displayInfo(this);
    }

    // bind mousedown event of graph
    function onMouseDown() {

      var mouse = d3.mouse(this)[0];
      var x0 = x.invert(mouse),
        i = bisectDate(allTrips, x0, 1),
        d0 = allTrips[i - 1],
        d1 = allTrips[i] ? allTrips[i] : d0,
        d = x0 - d0.x > d1.x - x0 ? d1 : d0;

      var lineOnGraph = false;
      var lineOnGraphIndex = null;
      data.map((d, i) => {
        var startDate = d[0].x,
          endDate = d[d.length - 1].x,
          date = x0;
        if (startDate <= date && date <= endDate) {
          lineOnGraph = true;
          lineOnGraphIndex = i;
        }
      });

      if (lineOnGraphIndex != null) {
        main.fleetService.setVehicleTrip(main.logbookData.VehicleTrips[lineOnGraphIndex]);
      }

    }

    // bind mouseover event of graph
    function onMouseOver() {
      graphInfo.style("display", "block");
    }

    // bind mouseout event of graph
    function onMouseOut() {
      graphInfo.style("display", "none");
      data.map((d, i) => graph.select(`.line${i}`).attr("stroke-width", 1.5));
      if (main.selectedTripIndex != null)
        graph.select(`.line${main.selectedTripIndex}`).attr("stroke-width", 3.5);
      main.displayData = null;
      main.fleetService.setVehiclePosition(null);
    }

    // perform zoom behavior
    var zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", zoomGraph);

    // perform drag behavior
    var drag = d3.drag().on("drag", function () { displayInfo(this) });

    // bind graph to div
    svg.append("rect")
      .attr("class", "zoom")
      .attr("transform", defaultTransform)
      .attr("width", width)
      .attr("height", height)
      .call(zoom)
      .call(drag)
      .on('mousedown', onMouseDown)
      .on("mouseover", onMouseOver)
      .on("mouseout", onMouseOut)
      .on("mousemove", function () { displayInfo(this) });

    // outer element to crop graph outside the area on zoom
    svg.append("defs").append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("id", "clip-rect")
      .attr("width", width)
      .attr("height", graphHeight);

    // highlight selected trip
    this.fleetService.subscribeToVehicleTrip().takeUntil(this.ngUnsubscribe).subscribe(res => {
      data.map((d, i) => graph.select(`.line${i}`).attr("stroke-width", 1.5));
      if (res) {
        this.selectedTripIndex = this.logbookData.VehicleTrips.findIndex(x => x.VehicleTripId == res.VehicleTripId);
        graph.select(`.line${this.selectedTripIndex}`).attr("stroke-width", 3.5);
      }
      else
        this.selectedTripIndex = null;
    });

    // highlight trip on hover of triplist    
    setTimeout(function () {
      main.logbookData.VehicleTrips.map((x, i) => {
        var tripElement = document.getElementById(x.VehicleTripId);
        if (tripElement) {
          data.map((d, i) => graph.select(`.line${i}`).attr("stroke-width", 1.5));
          tripElement.addEventListener("mouseenter", function () {
            graph.select(`.line${i}`).attr("stroke-width", 3.5);
          });
          tripElement.addEventListener("mouseleave", function () {
            if (main.selectedTripIndex != i) graph.select(`.line${i}`).attr("stroke-width", 1.5);
          });
        }
      });
    }, 500);

  }

  destroyGraph() {
    d3.selectAll("svg > *").remove();
    this.svgGraph = null;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
