var Data = [
  {
    name: "Manufacturing",
    YearlyData: [
      { year: "01 Jan 2010", value: 285.35618992718 },
      { year: "01 Feb 2011", value: 294.22817962918 },
      { year: "01 Mar 2012", value: 289.07607303006 },
      { year: "01 Apr 2013", value: 283.20624651788 },
      { year: "01 May 2014", value: 307.20617507638 },
      { year: "01 Jun 2015", value: 327.82006600121 },
      { year: "01 Jul 2016", value: 347.94271153089 },
      { year: "01 Aug 2017", value: 398.2045374828 },
      { year: "01 Sep 2018", value: 402.237315047 },
      { year: "01 Oct 2019", value: 381.51253297601 },
      { year: "01 Nov 2020", value: 365.03002076389 },
      { year: "01 Dec 2021", value: 443.9116565106 },
    ],
  },
];

function fnDrawMultiLineChart(Data, DivID, RevenueName) {
  var margin = { top: 20, right: 80, bottom: 30, left: 50 },
    width = 750 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  var parseDate = d3.time.format("%Y");

  var x = d3.scale.ordinal().rangeRoundBands([0, width]);

  var y = d3.scale.linear().range([height, 0]);

  var color = d3.scale.category10();

  var xAxis = d3.svg.axis().scale(x).orient("bottom");

  var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);

  // xData gives an array of distinct 'years' for which trends chart is going to be made.
  var xData = Data[0].YearlyData.map(function (d) {
    return parseDate(new Date(d.year));
  });
  //console.log(xData);

  var line = d3.svg
    .line()
    //.interpolate("basis")
    .x(function (d) {
      return x(parseDate(new Date(d.year))) + x.rangeBand() / 2;
    })
    .y(function (d) {
      return y(d.value);
    });

  var svg = d3
    .select("#" + DivID)
    .append("svg")
    .style("fill", "white")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  color.domain(
    Data.map(function (d) {
      return d.name;
    })
  );

  x.domain(xData);

  var valueMax = d3.max(Data, function (r) {
    return d3.max(r.YearlyData, function (d) {
      return d.value;
    });
  });
  var valueMin = d3.min(Data, function (r) {
    return d3.min(r.YearlyData, function (d) {
      return d.value;
    });
  });
  y.domain([valueMin, valueMax]);

  //Drawing X Axis
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .style("fill", "white")
    .call(xAxis);

  // Drawing Horizontal grid lines.
  svg
    .append("g")
    .attr("class", "GridX")
    .selectAll("line.grid")
    .style("fill", "white")
    .data(y.ticks())
    .enter()
    .append("line")
    .attr({
      class: "grid",
      x1: x(xData[0]),
      x2: x(xData[xData.length - 1]) + x.rangeBand() / 2,
      y1: function (d) {
        return y(d);
      },
      y2: function (d) {
        return y(d);
      },
    });
  // Drawing Y Axis
  svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .style("fill", "white")
    .text(RevenueName);

  // Drawing Lines for each segments
  var segment = svg
    .selectAll(".segment")
    .data(Data)
    .style("fill", "white")
    .enter()
    .append("g")
    .attr("class", "segment")
    .style("fill", "white");

  segment
    .append("path")
    // .style("fill", "white")
    .attr("class", "line")
    .attr("id", function (d) {
      return d.name;
    })
    .attr("visible", 1)

    .attr("d", function (d) {
      return line(d.YearlyData);
    })
    .style("stroke", function (d) {
      return color(d.name);
    });
  // Creating Dots on line
  segment
    .selectAll("dot")
    .data(function (d) {
      return d.YearlyData;
    })
    .enter()
    .append("circle")
    .attr("r", 5)
    .attr("cx", function (d) {
      return x(parseDate(new Date(d.year))) + x.rangeBand() / 2;
    })
    .attr("cy", function (d) {
      return y(d.value);
    })
    .style("stroke", "white")
    .style("fill", function (d) {
      return color(this.parentNode.__data__.name);
    })
    .on("mouseover", mouseover)
    .on("mousemove", function (d) {
      divToolTip
        .text(this.parentNode.__data__.name + " : " + d.value)
        .style("left", d3.event.pageX + 15 + "px")
        .style("top", d3.event.pageY - 10 + "px");
    })
    .on("mouseout", mouseout);

  segment
    .append("text")
    .style("fill", "white")
    .datum(function (d) {
      return { name: d.name, RevData: d.YearlyData[d.YearlyData.length - 1] };
    })
    .attr("transform", function (d) {
      var xpos = x(parseDate(new Date(d.RevData.year))) + x.rangeBand() / 2;
      return "translate(" + xpos + "," + y(d.RevData.value) + ")";
    })
    .attr("x", 3)
    .attr("dy", ".35em")
    .attr("class", "segmentText")
    .attr("Segid", function (d) {
      return d.name;
    })
    .text(function (d) {
      return d.name;
    });

  d3.selectAll(".segmentText").on("click", function (d) {
    var tempId = d3.select(this).attr("Segid");
    var flgVisible = d3.select("#" + tempId).attr("visible");

    var newOpacity = flgVisible == 1 ? 0 : 1;
    flgVisible = flgVisible == 1 ? 0 : 1;

    // Hide or show the elements
    d3.select("#" + tempId)
      .style("opacity", newOpacity)
      .attr("visible", flgVisible);
  });
  // Adding Tooltip
  var divToolTip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 1e-6);

  function mouseover() {
    divToolTip.transition().duration(500).style("opacity", 1);
  }
  function mouseout() {
    divToolTip.transition().duration(500).style("opacity", 1e-6);
  }
}

// Calling function
fnDrawMultiLineChart(Data, "divChartTrends", "Billions of US $");
