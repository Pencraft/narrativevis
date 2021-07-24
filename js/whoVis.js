// Import WHO dataset
let WHO = d3.csv("resources/who_suicide_statistics.csv", (d) => {
    return {
        country: d.country,
        year: +d.year,
        sex: d.sex,
        age: d.age.split(" ")[0],
        suicides: (d.suicides_no == "NA" ? NaN : +d.suicides_no),
        population: (d.population == "NA" ? NaN : +d.population)
    };
});

// Data processing
WHO.then(function (data) {
    data = d3.filter(data, (d) => d.year != 2016);
    const USA = getCountry(data, "United States of America");

    console.log(USA);
    drawSuicidesPlot(USA);
    drawSexPlot(USA);
    drawAgePlot(USA);
    addMenuItems(data);
    draw4Plot("United States of America", "suicides");
});

var drawSuicidesPlot = function(data, slide = "#Slide1") {
    d3.select(slide)
        .selectAll("svg")
        .remove();

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
        .text("Victims");

    // Colour by increasing/decreasing
    var colour = d3.scaleOrdinal()
        .domain(["increasing", "decreasing"])
        .range([ "#E69F00", "#619CFF"]);

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
    d3.select(slide)
        .selectAll("svg")
        .remove();

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
        .text("Victims");

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

    const categories = ["Male", "Female"];
    // Plot data
    svg.append("g")
        .selectAll("dot")
        .data(sdata)
        .enter()
        .append("circle")
        .attr("cx", (d) => x(d.year))
        .attr("cy", (d) => y(d.total))
        .attr("r", 5)
        .style("fill", (d) => colour(d.colour));

    // Add legend
    svg.append("g")
        .attr("transform", "translate(5, -20)")
        .append("rect")
        .attr("width", 80)
        .attr("height", 80)
        .style("fill", "white");

    svg.append("g")
        .attr("transform", "translate(25)")
        .selectAll("dot")
        .data(categories)
        .enter()
        .append("circle")
        .attr("cx", 0)
        .attr("cy", (d, i) => i * 25)
        .attr("r", 5)
        .style("fill", (d) => colour(d));

    svg.append("g")
        .attr("transform", "translate(35)")
        .selectAll("dot")
        .data(categories)
        .enter()
        .append("text")
        .attr("y", (d, i) => 5 + i * 25)
        .style("fill", (d) => colour(d) )
        .text((d) => d);

    svg.append("g")
        .selectAll("column")
        .data(Array.from(d3.group(sdata, (d) => d.year), ([key, value]) => ({key, value})))
        .enter()
        .append("rect")
        .attr("x", (d) => x(d.key) - 5)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", height)
        .attr("class", "column")
        .style("fill","aquamarine")
        .style("fill-opacity", 0)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove);
}

var drawAgePlot = function(data, slide = "#Slide3") {
    d3.select(slide)
        .selectAll("svg")
        .remove();

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

    let sdata = Array.from(d3.rollup(data, (l) => d3.sum(l, (d) => d.suicides), (d) => d.year, (d) => d.age),
        ([key, value]) => ({key, value}));
    sdata = d3.map(sdata, (d) => d3.map(d.value.entries(), ([k, v]) => ({
        "year": d.key,
        "colour": k,
        "total": v
    })))
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
        .text("Victims");

    // Colour by increasing/decreasing
    const categories = ["5-14", "15-24", "25-34", "35-54", "55-74", "75+"];
    var colour = d3.scaleOrdinal()
        .domain(categories)
        .range(["#E87D72", "#B4A033", "#53B74C", "#56bcc2", "#705BF8", "#E46DDD"]);

    // Create tooltip
    var tooltip = d3.select(slide)
        .append("div")
        .attr("id", "Tooltip3")
        .style("position", "absolute")
        .style("opacity", 0);

    const mouseover = function(event, d) {
        d3.selectAll(`.tooltip-${d.colour.slice(0, -1)}[cx="${x(d.year)}"]`)
            .style("opacity", 1);

        tooltip.selectAll("text").remove();
        tooltip.style("opacity", 1)
            .attr("width", 50)
            .attr("height", 50)
            .style("background-color", colour(d.colour))
            .style("color", "white")
            .text(`${d.colour} year old victims in ${d.year}: ${d.total}`);
    };

    const mouseout = function(event, d) {
        tooltip.style("opacity", 0);
        d3.selectAll(`.tooltip-${d.colour.slice(0, -1)}[cx="${x(d.year)}"]`)
            .style("opacity", 0);
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
        .style("fill", (d) => colour(d.colour));

    // Add legend
    svg.append("g")
        .attr("transform", "translate(5, -20)")
        .append("rect")
        .attr("width", 80)
        .attr("height", 165)
        .style("fill", "white");

    svg.append("g")
        .attr("transform", "translate(25)")
        .selectAll("dot")
        .data(categories)
        .enter()
        .append("circle")
        .attr("cx", 0)
        .attr("cy", (d, i) => i * 25)
        .attr("r", 5)
        .style("fill", (d) => colour(d));

    svg.append("g")
        .attr("transform", "translate(35)")
        .selectAll("dot")
        .data(categories)
        .enter()
        .append("text")
        .attr("y", (d, i) => 5 + i * 25)
        .style("fill", (d) => colour(d) )
        .text((d) => d);

    // Plot tooltip points
    svg.append("g")
        .selectAll("dot")
        .data(sdata)
        .enter()
        .append("circle")
        .attr("class", (d) => `tooltip-${d.colour.slice(0, -1)}`)
        .attr("cx", (d) => x(d.year))
        .attr("cy", (d) => y(d.total))
        .attr("r", 5)
        .style("fill", (d) => "aquamarine")
        .style("opacity", 0)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove);
}

var draw4Plot = async function(country, plot) {
    let header = d3.select("#SearchHeader");
    header.text(`Country: ${country}`);

    let data = getCountry(await WHO, country);
    drawPlot[plot](data, "#Slide4");
}

var drawPlot = {
    "suicides": drawSuicidesPlot,
    "sex": drawSexPlot,
    "age": drawAgePlot
}

var whichPlot = "suicides";
var whichCountry = "United States of America";

var getCountry = function(data, name) {
    data = d3.filter(data, (d) => d.year != 2016);
    return d3.filter(data, (d) => d.country == name);
}

var addMenuItems = function(data) {
    d3.select("#CountryMenu")
        .selectAll("option")
        .data(d3.group(data, (d) => d.country).keys())
        .enter()
        .append("li")
        .append("button")
        .attr("class", "CountryLink")
        .attr("id", (d) => d)
        .attr("onclick", (d) => `whichCountry="${d}";draw4Plot(whichCountry, whichPlot)`)
        .text((d) => d);
}

var filterCountries = function() {
    let input = d3.select("#CountrySearch")
        .node()
        .value
        .toUpperCase();

    let links = d3.selectAll(".CountryLink");

    links.data(d3.map(links.nodes(), (l) => l.id))
        .style("display", function(d) {
            if (!input || d.toUpperCase().includes(input)) {
                return "";
            } else {
                return "none";
            }
        })
}
