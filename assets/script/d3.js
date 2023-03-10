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
    .style("fill", "#c62a88")
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
    .style("fill", "#c62a88")
    .call(xAxis);

  // Drawing Horizontal grid lines.
  svg
    .append("g")
    .attr("class", "GridX")
    .selectAll("line.grid")
    .style("fill", "#c62a88")
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
    .style("fill", "#c62a88")
    .text(RevenueName);

  // Drawing Lines for each segments
  var segment = svg
    .selectAll(".segment")
    .data(Data)
    .style("fill", "#c62a88")
    .enter()
    .append("g")
    .attr("class", "segment")
    .style("fill", "#c62a88");

  segment
    .append("path")
    // .style("fill", "#c62a88")
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
    .style("stroke", "#FFF")
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
    .style("fill", "#c62a88")
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
fnDrawMultiLineChart(Data, "manufacturing-chart", "Billions of US $");

var co2 = [
  {
    date: "2010-12-31",
    value: 1.41,
  },
  {
    date: "2011-12-31",
    value: 1.48,
  },
  {
    date: "2012-12-31",
    value: 1.6,
  },
  {
    date: "2013-12-31",
    value: 1.63,
  },
  {
    date: "2014-12-31",
    value: 1.73,
  },
  {
    date: "2015-12-31",
    value: 1.73,
  },
  {
    date: "2016-12-31",
    value: 1.74,
  },
  {
    date: "2017-12-31",
    value: 1.82,
  },
  {
    date: "2018-12-31",
    value: 1.89,
  },
  {
    date: "2019-12-31",
    value: 1.87,
  },
  {
    date: "2020-12-31",
    value: 1.73,
  },
  {
    date: "2021-12-31",
    value: 1.9,
  },
];

var manufacturing_data = [
  {
    date: "2010-12-31",
    value: 285.35618992718,
  },
  {
    date: "2011-12-31",
    value: 294.22817962918,
  },
  {
    date: "2012-12-31",
    value: 289.07607303006,
  },
  {
    date: "2013-12-31",
    value: 283.20624651788,
  },
  {
    date: "2014-12-31",
    value: 307.20617507638,
  },
  {
    date: "2015-12-31",
    value: 327.82006600121,
  },
  {
    date: "2016-12-31",
    value: 347.94271153089,
  },
  {
    date: "2017-12-31",
    value: 398.2045374828,
  },
  {
    date: "2018-12-31",
    value: 402.237315047,
  },
  {
    date: "2019-12-31",
    value: 381.51253297601,
  },
  {
    date: "2020-12-31",
    value: 365.03002076389,
  },
  {
    date: "2021-12-31",
    value: 443.9116565106,
  },
];
var x_axis_label = "Metric Tons of CO2";
$(document).ready(function () {
  init();
  render();

  d3.select("#toggleData").on("click", function () {
    if (currentData == "co2") {
      d3.select(this).text("Show CO2 Emissions");
      updateData(manufacturing_data);
      currentData = "manufacturing_data";
    } else if (currentData == "manufacturing_data") {
      updateData(co2);
      d3.select(this).text("Show Manufacturing Viz");
      currentData = "co2";
      x_axis_label = "Billions of US $";
    }
  });

  d3.select(window).on("resize", function () {
    resize();
  });
});

var chartContainer;
var svg;
var marginContainer;
var x;
var y;
var xAxis;
var yAxis;
var width;
var height;
var line;
var area;
var startData;
var currentData = "co2";

var margin = { top: 20, right: 30, bottom: 30, left: 40 };
var maxWidth = 800 - margin.left - margin.right;

var detailWidth = 150;
var detailHeight = 75;
var detailMargin = 15;

function init() {
  chartContainer = d3.select(".manufacturing-co2-chart");
  svg = chartContainer.append("svg");
  marginContainer = svg.append("g").attr("class", "margin-container");
}

function render() {
  var data = eval(currentData);

  var parse = d3.time.format("%Y-%m-%d").parse;

  data = data.map(function (datum) {
    if (typeof datum.date == "string") {
      datum.date = parse(datum.date);
    }

    return datum;
  });

  getDimensions();

  svg
    .attr("width", width + margin.left + margin.right)
    .style("fill", "#c62a88")
    .attr("height", height + margin.top + margin.bottom);

  marginContainer.attr(
    "transform",
    "translate(" + margin.left + "," + margin.top + ")"
  );

  x = d3.time.scale().range([0, width]);
  y = d3.scale.linear().range([height, 0]);
  x.domain(
    d3.extent(data, function (d) {
      return d.date;
    })
  );
  y.domain([
    0,
    d3.max(data, function (d) {
      return d.value;
    }) * 1.25,
  ]);

  area = d3.svg
    .area()
    .x(function (d) {
      return x(d.date);
    })
    .y0(height)
    .y1(function (d) {
      return y(d.value);
    });

  line = d3.svg
    .area()
    .x(function (d) {
      return x(d.date);
    })
    .y(function (d) {
      return y(d.value);
    });

  startData = data.map(function (datum) {
    return {
      date: datum.date,
      value: 0,
    };
  });

  xAxis = d3.svg.axis().scale(x).orient("bottom");

  yAxis = d3.svg.axis().scale(y).orient("left");

  marginContainer
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  marginContainer
    .append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", "1.5em")
    .style("text-anchor", "end")
    .text("Metric Tons of CO2 / Billions of US $");

  marginContainer
    .append("path")
    .datum(startData)
    .attr("class", "line")
    .attr("d", line)
    .transition()
    .duration(500)
    .ease("quad")
    .attrTween("d", function () {
      var interpolator = d3.interpolateArray(startData, data);

      return function (t) {
        return line(interpolator(t));
      };
    })
    .each("end", function () {
      drawCircles(data, marginContainer);
    });

  marginContainer
    .append("path")
    .datum(startData)
    .attr("class", "area")
    .attr("d", area)
    .transition()
    .duration(500)
    .ease("quad")
    .attrTween("d", function () {
      var interpolator = d3.interpolateArray(startData, data);

      return function (t) {
        return area(interpolator(t));
      };
    });
}

function drawCircle(datum, index) {
  circleContainer
    .datum(datum)
    .append("circle")
    .attr("class", "circle")
    .attr("r", 0)
    .attr("cx", function (d) {
      return x(d.date);
    })
    .attr("cy", function (d) {
      return y(d.value);
    })
    .on("mouseenter", function (d) {
      d3.select(this).attr("class", "circle active").attr("r", 7);

      d.active = true;

      showCircleDetail(d);
    })
    .on("mouseout", function (d) {
      d3.select(this).attr("class", "circle").attr("r", 6);

      if (d.active) {
        hideCircleDetails();

        d.active = false;
      }
    })
    .on("click touch", function (d) {
      if (d.active) {
        showCircleDetail(d);
      } else {
        hideCircleDetails();
      }
    })
    .transition()
    .delay(100 * index)
    .duration(750)
    .ease("elastic", 1.5, 0.75)
    .attr("r", 6);
}

function drawCircles(data, container) {
  circleContainer = container.append("g").attr("class", "circles");
  data.forEach(function (datum, index) {
    drawCircle(datum, index);
  });
}

function hideCircleDetails() {
  circleContainer.selectAll(".bubble").remove();
}

function showCircleDetail(data) {
  var details = circleContainer
    .append("g")
    .attr("class", "bubble")
    .attr("transform", function () {
      var result = "translate(";

      var xVal = x(data.date) - detailWidth / 2;
      if (xVal + detailWidth > width) {
        xVal = width - detailWidth;
      } else if (xVal < 0) {
        xVal = 0;
      }

      result += xVal;
      result += ", ";
      result += y(data.value) - detailHeight - detailMargin;
      result += ")";

      return result;
    });

  details
    .append("rect")
    .attr("width", detailWidth)
    .attr("height", detailHeight)
    .attr("rx", 5)
    .attr("ry", 5);

  var text = details.append("text").attr("class", "text");

  var dateFormat = d3.time.format("%m/%d/%Y");

  text
    .append("tspan")
    .attr("class", "price")
    .attr("x", detailWidth / 2)
    .attr("y", detailHeight / 3)
    .attr("text-anchor", "middle")
    .text("Price: " + data.value);

  text
    .append("tspan")
    .attr("class", "date")
    .attr("x", detailWidth / 2)
    .attr("y", (detailHeight / 4) * 3)
    .attr("text-anchor", "middle")
    .text("Date: " + dateFormat(data.date));
}

function updateData(data) {
  var parse = d3.time.format("%Y-%m-%d").parse;

  data = data.map(function (datum) {
    if (typeof datum.date == "string") {
      datum.date = parse(datum.date);
    }
    return datum;
  });

  getDimensions();

  svg
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  marginContainer.attr(
    "transform",
    "translate(" + margin.left + "," + margin.top + ")"
  );

  x = d3.time.scale().range([0, width]);
  y = d3.scale.linear().range([height, 0]);
  x.domain(
    d3.extent(data, function (d) {
      return d.date;
    })
  );
  y.domain([
    0,
    d3.max(data, function (d) {
      return d.value;
    }) * 1.25,
  ]);

  xAxis = d3.svg.axis().scale(x).orient("bottom");

  yAxis = d3.svg.axis().scale(y).orient("left");

  area = d3.svg
    .area()
    .x(function (d) {
      return x(d.date);
    })
    .y0(height)
    .y1(function (d) {
      return y(d.value);
    });

  line = d3.svg
    .area()
    .x(function (d) {
      return x(d.date);
    })
    .y(function (d) {
      return y(d.value);
    });

  startData = data.map(function (datum) {
    return {
      date: datum.date,
      value: 0,
    };
  });

  marginContainer
    .select(".x.axis")
    .transition()
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  marginContainer.select(".y.axis").transition().call(yAxis);

  marginContainer.select(".circles").remove();

  marginContainer
    .select(".line")
    .transition()
    .duration(500)
    .ease("quad")
    .attrTween("d", function () {
      var interpolator = d3.interpolateArray(startData, data);

      return function (t) {
        return line(interpolator(t));
      };
    })
    .each("end", function () {
      drawCircles(data, marginContainer);
    });

  marginContainer
    .select(".area")
    .transition()
    .duration(500)
    .ease("quad")
    .attrTween("d", function () {
      var interpolator = d3.interpolateArray(startData, data);

      return function (t) {
        return area(interpolator(t));
      };
    });
}

function getDimensions() {
  var containerWidth = parseInt(
    d3.select(".manufacturing-co2-chart").style("width")
  );
  margin.top = 20;
  margin.right = 30;
  margin.left = 40;
  margin.bottom = 30;

  width = containerWidth - margin.left - margin.right;
  if (width > maxWidth) {
    width = maxWidth;
  }
  height = 0.75 * width;
}

function resize() {
  updateData(eval(currentData));
}
