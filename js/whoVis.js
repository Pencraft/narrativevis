// Import WHO dataset
let WHO = d3.csv("resources/who_suicide_statistics.csv", (d) => {
    return {
        country: d.country,
        year: +d.year,
        sex: d.sex,
        age: d.age,
        suicides: (d.suicides_no == "NA" ? NaN : +d.suicides_no),
        population: (d.population == "NA" ? NaN : +d.population)
    };
});

// Data processing
WHO.then(function (data) {
    data = d3.filter(data, (d) => d.year != 2016);
    const USA = d3.filter(data, (d) => d.country == "United States of America");

    drawSuicidesPlot(USA);
});

var drawSuicidesPlot = function(data) {
    // set dimensions
    var margin = {top: 10, right: 30, bottom: 40, left: 60},
        width = 520 - margin.left - margin.right,
        height = 520 - margin.top - margin.bottom;

    // append svg to Slide1
    let svg = d3.select("#Slide1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height",  height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let sdata = Array.from(d3.rollup(data, (l) => d3.sum(l, (d) => d.suicides), (d) => d.year),
        ([key, value]) => ({key, value}));
    console.log(sdata);
    sdata.forEach(function(d, i) {
        d.year = d.key;
        d.total = d.value;
        d.colour = (i == 0 || sdata[i-1].value > d.total ? "decreasing" : "increasing");
    });

    // Add X axis
    var x = d3.scaleLinear()
        .domain([1979, 2015])
        .range([0, width])
        .nice();

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(-height*1.3).ticks(10, "d"))
        .select(".domain").remove();

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([d3.min(sdata, (d) => d.total), d3.max(sdata, (d) => d.total)])
        .range([height, 0])
        .nice();

    svg.append("g")
        .call(d3.axisLeft(y).tickSize(-width*1.3).ticks(7))
        .select(".domain").remove()

    // Add X axis label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width/2 + margin.left/2)
        .attr("y", height + margin.top + 20)
        .text("Year");

    // Add Y axis label
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -margin.top - height/2 + 20)
        .text("Suicides");

    // Colour by increasing/decreasing
    var colour = d3.scaleOrdinal()
        .domain(["increasing", "decreasing"])
        .range([ "#F8766D", "#619CFF"]);

    // Create tooltip
    var tooltip = d3.select("#Slide1")
        .append("div")
        .attr("id", "Tooltip1")
        .style("position", "absolute")
        .style("opacity", 0);

    const mouseover = function(event, d) {
        tooltip.selectAll("text").remove();
        tooltip.style("opacity", 1)
            .attr("width", 50)
            .attr("height", 50)
            .style("background-color", colour(d.colour))
            .style("color", "white")
            .text(`Suicides in ${d.year}: ${d.total}`);
    };

    const mouseout = function(event, d) {
        tooltip.style("opacity", 0);
    };

    const mousemove = function(event, d) {
        tooltip.style('left', `${event.pageX +  10}px`)
            .style('top', `${event.pageY + 10}px`);
    }

    // Plot data
    svg.append("g")
        .selectAll("dot")
        .data(sdata)
        .enter()
        .append("circle")
        .attr("cx", (d) => x(d.year))
        .attr("cy", (d) => y(d.total))
        .attr("r", 5)
        .style("fill", (d) => colour(d.colour))
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove);
}