// function used to start kmeans simmulation

var radius = 5;
var width = 900;
var height = 400;

function startKMeans(){
  //console.log(document.getElementById("numberOfClusters"));
  //console.log(document.getElementById("numberOfPoints"));
  var clusters = parseInt(document.getElementById("numberOfClusters").value);
  var numberOfPoints = parseInt(document.getElementById("numberOfPoints").value);
  //console.log("starting KMeans algorithm");
  var arrayOfPoints = generateRandomPoints(radius, width - radius, radius, height - radius, numberOfPoints);
  plotPoints(arrayOfPoints);
}

function getRandomInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomPoints(min_x, max_x, min_y, max_y, size){
  var points = [];
  for (i = 0; i < size; i++){
    var point = {'x_axis': getRandomInt(min_x, max_x), 'y_axis': getRandomInt(min_y, max_y)}
    points.push(point);
  }
  return points;
}

function plotPoints(points){
  // remove old svg element before plotting a new one
  d3.select("svg").remove();
  var svgContainer = d3.select("#kmeans-board").append("svg")
                                       .attr("width", width)
                                       .attr("height", height);

  var circles = svgContainer.selectAll("circle")
                            .data(points)
                            .enter()
                            .append("circle");

  var circleAttributes = circles
                         .attr("cx", function (d) { return d.x_axis; })
                         .attr("cy", function (d) { return d.y_axis; })
                         .attr("r", radius)
                         .style("fill", "blue");

}
