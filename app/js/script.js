// function used to start kmeans simulation

var radius = 5;
var width = 500;
var height = 400;
var colors = ["#641e16", "#512e5f", "#154360", "#0e6251", "#145a32", " #7d6608", "#784212", " #7b7d7d", "#4d5656", "#1b2631"];

var iterations;

// variable used to manage the animation timer
var interval;

function stopKMeans(){
    clearInterval(interval);
}

function startKMeans(){
  clearInterval(interval);

  iterations = 10;
  // validate number of cluster restriction
  var numberOfClusters = parseInt(document.getElementById("numberOfClusters").value);
  if (numberOfClusters > colors.length){
    alert("Number of clusters must be lesser or equal to 10");
    return;
  }
  //console.log(numberOfClusters);

  var numberOfPoints = parseInt(document.getElementById("numberOfPoints").value);

  // kmeans initialization
  var arrayOfPoints = generateRandomPoints(radius, width - radius, radius, height - radius, numberOfPoints);
  var centroids = generateRandomCentroids(radius, width - radius, radius, height - radius, numberOfClusters);
  //console.log(centroids);
  plotPoints(arrayOfPoints.concat(centroids));

  interval = setInterval(function(){
      if (iterations <= 0){
        clearInterval(interval);
      }
      [assignments, arrayOfPoints] = assignCentroids(arrayOfPoints, centroids);
      console.log("remaining iterations: " + iterations.toString());
      centroids = updateCentroids(arrayOfPoints, assignments, numberOfClusters);
      plotPoints(arrayOfPoints.concat(centroids));
      iterations -= 1;
    }, 5000);
}



function assignCentroids(points, centroids){
    // iterate per point
    var assignedCentroids = []
    for (i = 0; i < points.length; i++){
      // iterate per centroids
      centroid_index = 0
      centroid_distance = compute_distance(points[i], centroids[0]);
      //console.log("centroid_distance");
      //console.log(centroid_distance);
      for (j = 1; j < centroids.length; j++){
          var distance = compute_distance(points[i], centroids[j]);
          //console.log("distance");
          //console.log(distance);
          if (distance < centroid_distance){
            centroid_index = j
            centroid_distance = distance;
        }
      }
      points[i].color_value = centroids[centroid_index].color_value;
      assignedCentroids.push(centroid_index);
    }
    return [assignedCentroids, points];
}

function compute_distance(point, centroid){
  return Math.sqrt(Math.pow(point.x_axis - centroid.x_axis, 2) + Math.pow(point.y_axis - centroid.y_axis, 2))
}

/**
Need to protect against division by zero and integer overflow
**/

function updateCentroids(points, assignments, numberOfCentroids){
  //console.log("number of centroids");
  //console.log(numberOfCentroids);
  var newCentroids = generateEmptyCentroids(numberOfCentroids);
  //console.log(newCentroids);
  var pointsPerCentroid = arrayOfZeros(numberOfCentroids);
  for (i = 0; i < points.length; i++){
    var currentCentroid = newCentroids[assignments[i]];
    var point = points[i];
    //console.log(currentCentroid);
    //console.log(point);
    currentCentroid.x_axis += point.x_axis;
    currentCentroid.y_axis += point.y_axis;
    pointsPerCentroid[assignments[i]] += 1.0;
  }

  for (i = 0; i < newCentroids.length; i++){
    newCentroids[i].x_axis /= pointsPerCentroid[i];
    newCentroids[i].y_axis /= pointsPerCentroid[i];
  }

  return newCentroids;
}

function arrayOfZeros(size){
  var zeros = [];
  for (i = 0; i < size; i++){
    zeros.push(0);
  }
  return zeros;
}

function getRandomInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomPoints(min_x, max_x, min_y, max_y, size){
  var points = [];
  for (i = 0; i < size; i++){
    var point = {'x_axis': getRandomInt(min_x, max_x), 'y_axis': getRandomInt(min_y, max_y), 'radius': 4, 'color_value': 'black'}
    points.push(point);
  }
  return points;
}

function generateRandomCentroids(min_x, max_x, min_y, max_y, size){
  var centroids = [];
  for (i = 0; i < size; i++){
    var centroid = {'x_axis': getRandomInt(min_x, max_x), 'y_axis': getRandomInt(min_y, max_y), 'radius':8,  'color_value': selectColor(i + 1, size)}
    centroids.push(centroid);
  }
  return centroids;
}

function generateEmptyCentroids(size){
  var centroids = [];
  for (i = 0; i < size; i++){
    var centroid = {'x_axis': 0.0, 'y_axis': 0.0, 'radius':8,  'color_value': selectColor(i + 1, size)}
    centroids.push(centroid);
  }
  //console.log(centroids);
  return centroids;
}

function selectColor(index, max_index){
  //console.log(index % max_index);
  return colors[index % max_index];
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
                         .attr("r", function (d) {return d.radius})
                         .style("fill", function(d) { return d.color_value});
}
