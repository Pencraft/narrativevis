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
    drawSexPlot(USA);
});

var drawSuicidesPlot = function(data, slide = "#Slide1") {
    // set dimensions
    var margin = {top: 10, right: 30, bottom: 40, left: 60},
        width = 520 - margin.left - margin.right,
        height = 520 - margin.top - margin.bottom;

    // append svg to Slide
    let svg = d3.select(slide)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height",  height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let sdata = Array.from(d3.rollup(data, (l) => d3.sum(l, (d) => d.suicides), (d) => d.year),
        ([key, value]) => ({key, value}));
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
    var tooltip = d3.select(slide)
        .append("div")
        .attr("id", "Tooltip1")
        .style("position", "absolute")
        .style("opacity", 0);

    const mouseover = function(event, d) {
        d3.selectAll(`.tooltip[cx="${x(d.year)}"]`)
            .style("visibility", null);

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
        d3.selectAll(`.tooltip[cx="${x(d.year)}"]`)
            .style("visibility", "hidden");
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

    // Plot tooltip points
    svg.append("g")
        .selectAll("dot")
        .data(sdata)
        .enter()
        .append("circle")
        .attr("class", "tooltip")
        .attr("cx", (d) => x(d.year))
        .attr("cy", (d) => y(d.total))
        .attr("r", 5)
        .style("fill", (d) => "aquamarine")
        .style("visibility", "hidden")
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove);
}

var drawSexPlot = function(data, slide = "#Slide2") {
    // set dimensions
    var margin = {top: 10, right: 30, bottom: 40, left: 60},
        width = 520 - margin.left - margin.right,
        height = 520 - margin.top - margin.bottom;

    // append svg to Slide
    let svg = d3.select(slide)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height",  height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let sdata = Array.from(d3.rollup(data, (l) => d3.sum(l, (d) => d.suicides), (d) => d.year, (d) => d.sex),
        ([key, value]) => ([{
            "year": key,
            "colour": "female",
            "total": value.get("female")
        },{
            "year": key,
            "colour": "male",
            "total": value.get("male")
        }]))
        .flat();

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
        .domain(["male", "female"])
        .range([ "#F8766D", "#619CFF"]);

    // Create tooltip
    var tooltip = d3.select(slide)
        .append("div")
        .attr("id", "Tooltip2")
        .style("position", "absolute")
        .style("opacity", 0);

    const pie = d3.pie()
        .value((d) => d.total);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(60)

    const mouseover = function(event, d) {
        // Highlight column
        d3.selectAll(`.column[x="${x(d.key) - 5}"]`)
            .style("fill-opacity", 0.5);

        tooltip.selectAll("svg").remove();
        tooltip.selectAll("text").remove();

        // Draw pie chart
        let ydata = pie(d3.filter(sdata, (s) => s.year == d.key));
        let ytotal = d3.sum(ydata, (y) => y.data.total);
        let ttsvg = tooltip.style("opacity", 1)
            .append("svg")
            .attr("width", 250)
            .attr("height", 250);

        ttsvg.append("g")
            .attr("transform", "translate(70,70)")
            .selectAll("slices")
            .data(ydata)
            .enter()
            .append("path")
            .attr('d', arc)
            .attr('fill', (y) => colour(y.data.colour))
            .attr("stroke", "white")
            .style("stroke-width", "2px")

        // Add pie chart annotations
        ttsvg.append("g")
            .attr("transform", "translate(70,70)")
            .selectAll("slices")
            .data(ydata)
            .enter()
            .append("text")
            .text((y) => d3.format(".1%")(y.data.total / ytotal))
            .attr("transform", (y) => "translate(" + arc.centroid(y) + ")")
            .style("text-anchor", "middle")
            .style("fill", "white")
            .style("font-size", 12);
    };

    const mouseout = function(event, d) {
        tooltip.style("opacity", 0);
        d3.selectAll(`.column[x="${x(d.key) - 5}"]`)
            .style("fill-opacity", 0);
    };

    const mousemove = function(event, d) {
        tooltip.style('left', `${event.pageX + 5}px`)
            .style('top', `${event.pageY + 5}px`);
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

    svg.append("g")
        .selectAll("column")
        .data(Array.from(d3.group(sdata, (d) => d.year), ([key, value]) => ({key, value})))
        .enter()
        .append("rect")
        .attr("x", (d) => x(d.key) - 5)
        .attr("y", -10)
        .attr("width", 10)
        .attr("height", height)
        .attr("class", "column")
        .style("fill","aquamarine")
        .style("fill-opacity", 0)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove);
}

var drawAgePlot = function(data, slide = "Slide3") {

}