
const margin = ({ top: 50, right: 40, bottom: 50, left: 40 })
const width = 700 - margin.left - margin.right,
    height = 850 - margin.top - margin.bottom;


let svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


function position(d) {
    const t = d3.select(this);
    switch (d.side) {
        case "top":
            t.attr("text-anchor", "middle").attr("dy", "-0.7em");
            break;
        case "right":
            t.attr("dx", "0.5em")
                .attr("dy", "0.32em")
                .attr("text-anchor", "start");
            break;
        case "bottom":
            t.attr("text-anchor", "middle").attr("dy", "1.4em");
            break;
        case "left":
            t.attr("dx", "-0.5em")
                .attr("dy", "0.32em")
                .attr("text-anchor", "end");
            break;
    }
};

function halo(text) {
    text
        .select(function () {
            return this.parentNode.insertBefore(this.cloneNode(true), this);
        })
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-width", 4)
        .attr("stroke-linejoin", "round");
}



d3.csv('driving.csv', d => {
    return d3.autoType(d)
}).then(data => {
    console.log("data: ", data)


    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.miles)).nice()
        .range([0, width])


    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.gas)).nice()
        .range([height, 0])

    let xAxis = d3.axisBottom()
        .scale(xScale)
        .ticks(5, ",f");
        
        
    let yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(null, "$.2f");

    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)
        .call(function (g) {
            g.select(".domain").remove();
        })
        .selectAll(".tick line")
        .clone()
        .attr("y2", -height)
        .attr("stroke-opacity", 0.1)

    svg.append("g")
        .attr("class", "axis y-axis")
        .call(yAxis)
        .call(function (g) {
            g.select(".domain").remove();
        }) 
        .selectAll(".tick line")
        .clone()
        .attr("x2", width)
        .attr("stroke-opacity", 0.1)

    

    svg.append("text")
        .attr("class", "y-label")
        .attr('x', 10)
        .attr('y', -5)
        .attr("class", "yax")
        .text("Cost per gallon");

    svg.append("text")
        .attr('x', width - 140)
        .attr('y', height -30)
        .text("Miles per person per year")

    const line = d3.line()
        .curve(d3.curveCatmullRom)
        .x(function (d) {
            return xScale(d.miles);
        })
        .y(function (d) {
            return yScale(d.gas);
        });

    const l = line(data).length;

    svg.append("path")
        .datum(data)
        .attr("stroke", "black")
        .attr("stroke-width", 3)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-dasharray", `0,${l}`)
        .attr("fill", "none")
        .attr("d", line)
        .transition()
        .duration(15000)
        .ease(d3.easeLinear)
        .attr("stroke-dasharray", `${l},${l}`);
    
        


    svg.append("g")
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", function(d){
            return xScale(d.miles);
        })
        .attr("cy", function(d){
            return yScale(d.gas);
        })
        .attr("r", 4)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    const label = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .selectAll("g")
        .data(data)
        .join("g")
        .attr("transform", d => `translate(${xScale(d.miles)},${yScale(d.gas)})`)
        .attr("opacity", 0);


    label.append("text")
        .text(function(d){
            return d.year;
        })
        .each(position)
        .call(halo)
        .attr("opacity",);

    label.transition()
        .delay((d, i) => line(data.slice(0, i + 1)).length / (l) * (6000 - 125))
        .attr("opacity", 1);
    
  

}) // end of csv
