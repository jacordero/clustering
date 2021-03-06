// object that helps with the data visualization process
var Visualizer = {

    draw: function (data, blackboardElementId){
        d3.select("svg").remove();

        var svgContainer = d3.select(blackboardElementId).append("svg")
            .attr("width", canvasInfo.width)
            .attr("height", canvasInfo.height);

        var circles = svgContainer.selectAll("circle")
            .data(data)
            .enter()
            .append("circle");

        var circleAttributes = circles
            .attr("cx", function (d) { return d.x_axis; })
            .attr("cy", function (d) { return d.y_axis; })
            .attr("r", function (d) {return d.radius})
            .style("fill", function(d) { return d.color_value});
    }
}

/**
 Need to protect against division by zero and integer overflow
 **/
function arrayOfZeros(size){
    var zeros = [];
    for (i = 0; i < size; i++){
        zeros.push(0);
    }
    return zeros;
}

// get random number from min to max (inclusive)
function getRandomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sampleWeightedArray(weightedArray){
  var cdn = [];
  var sum = 0.0;
  for (i = 0; i < weightedArray.length; i++){
    sum += weightedArray[i];
    cdn.push(sum);
  }

  var randomValue = Math.random();
  var index = cdn.length - 1;
  for (i = 0; i < cdn.length; i++){
    if (randomValue < cdn[i]){
      index = i;
      break;
    }
  }
  var lastValue = cdn[cdn.length - 1];
  console.log("cdn last: " + lastValue.toString());
  console.log("cdn index: " + index.toString());
  return index;
}

function generateRandomPoints(min_x, max_x, min_y, max_y, size){
    var points = [];
    for (i = 0; i < size; i++){
        var point = {'x_axis': getRandomInt(min_x, max_x), 'y_axis': getRandomInt(min_y, max_y), 'radius': 4, 'color_value': 'black'}
        points.push(point);
    }
    return points;
}

function initializeCentroids(data, min_x, max_x, min_y, max_y, size, initMethod){
  console.log(initMethod);
  if (initMethod == "smart"){
    console.log("smartInitialization");
    return smartInitialization(data, size);
  }
  return randomInitialization(min_x, max_x, min_y, max_y, size);
}

function smartInitialization(data, size){
  // Choose first centroid uniformly at random from data points
  var centroids = []
  var dataPosition = getRandomInt(0, data.length - 1);
  var selectedPoint = data[dataPosition];
  var newCentroid = {
    'x_axis': selectedPoint.x_axis,
    'y_axis': selectedPoint.y_axis,
    'radius': 8,
    'color_value': colors[0]
  }
  newCentroid.radius = 8;
  centroids.push(newCentroid);

  for (k = 1; k < size; k++){
    // for each obs x, compute distance d(x) to nearest cluster center
    var distances = [];
    for (i = 0; i < data.length; i++){
      distance = computeDistance(data[i], centroids[0]);
      for (j = 1; j < centroids.length; j++){
        var newDistance = computeDistance(data[i], centroids[j]);
        if (newDistance < distances[i]){
          distance = newDistance;
        }
      }
      distances.push(distance);
    }

    // choose new centroid from amongst data points, with probability of x being
    // chosen proportional to d(x)**2
    sum_squared_distances = 0.0;
    for (i = 0; i < distances.length; i++){
      sum_squared_distances += (distances[i] * distances[i]);
    }

    var probs = [];
    for (i = 0; i < distances.length; i++){
      probs.push((distances[i] * distances[i]) / sum_squared_distances);
    }

    var index = sampleWeightedArray(probs);
    selectedPoint = data[index];
    newCentroid = {
      'x_axis': selectedPoint.x_axis,
      'y_axis': selectedPoint.y_axis,
      'radius': 8,
      'color_value': colors[k]
    }
    centroids.push(newCentroid);
  }

  //console.log(centroids);
  return centroids;
}


function randomInitialization(min_x, max_x, min_y, max_y, size){
    var centroids = [];
    for (i = 0; i < size; i++){
        var centroid = {'x_axis': getRandomInt(min_x, max_x), 'y_axis': getRandomInt(min_y, max_y), 'radius':8,  'color_value': colors[i]}
        centroids.push(centroid);
    }
    return centroids;
}

function generateEmptyCentroids(size){
    var centroids = [];
    for (i = 0; i < size; i++){
        var centroid = {'x_axis': 0.0, 'y_axis': 0.0, 'radius':8,  'color_value': colors[i]}
        centroids.push(centroid);
    }
    //console.log(centroids);
    return centroids;
}

function arraysAreEquals(firstArray, secondArray){
  if (firstArray.length != secondArray.length){
    return false;
  }

  for (i = 0; i < firstArray.length; i++){
    if (firstArray[i] != secondArray[i]){
      return false;
    }
  }

  console.log("arrays are equals");
  return true;
}


function computeDistance (point1, point2){
  return Math.sqrt(Math.pow(point1.x_axis - point2.x_axis, 2) + Math.pow(point1.y_axis - point2.y_axis, 2));
}

function computeCentroids (data, initialCentroids){
  var assignedCentroids = []
  for (i = 0; i < data.length; i++){
      // iterate per centroids
      centroid_index = 0
      centroid_distance = computeDistance(data[i], initialCentroids[0]);
      //console.log("centroid_distance");
      //console.log(centroid_distance);
      for (j = 1; j < initialCentroids.length; j++){
          var distance = computeDistance(data[i], initialCentroids[j]);
          //console.log("distance");
          //console.log(distance);
          if (distance < centroid_distance){
              centroid_index = j
              centroid_distance = distance;
          }
      }
      data[i].color_value = initialCentroids[centroid_index].color_value;
      assignedCentroids.push(centroid_index);
  }
  return [assignedCentroids, data];
}

function moveCentroids (data, assignments, numberOfCentroids){
  var newCentroids = generateEmptyCentroids(numberOfCentroids);
  //console.log(newCentroids);
  var pointsPerCentroid = arrayOfZeros(numberOfCentroids);
  for (i = 0; i < data.length; i++){
      var currentCentroid = newCentroids[assignments[i]];
      var point = data[i];
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

// function used to start kmeans simulation
function runKMeans(data, numberOfClusters, visualizer, blackboardElement, iterations, initMethod, verbose){
  console.log(centroids);
  visualizer.draw(data.concat(centroids), blackboardElement);
  var lastAssignments = [];

  interval = setInterval(function(){
      if (iterations <= 0){
          clearInterval(interval);
          return;
      }

      [assignments, data] = computeCentroids(data, centroids, numberOfClusters);
      console.log(assignments);
      centroids = moveCentroids(data, assignments, numberOfClusters);
      visualizer.draw(data.concat(centroids), blackboardElement);

      if (lastAssignments.length > 0 && arraysAreEquals(lastAssignments, assignments)){
            clearInterval(interval);
            console.log("None of the cluster assignments changed, stopping the algorithm");
            return;
      }

      lastAssignments = assignments;
      iterations -= 1;
      if (verbose){
          console.log("remaining iterations: " + iterations.toString());
      }
  }, intervalDuration);
}

var canvasInfo = {
  radius: 5,
  width: 500,
  height: 400
}

var clusteringInfo = {
  minClusters: 3,
  maxClusters: 12,
  maxIterations: 50
}

var intervalDuration = 1500;
var colors;

var colorPalette = [
    ['#e41a1c','#377eb8','#4daf4a'], // three colors
    ['#e41a1c','#377eb8','#4daf4a','#984ea3'], // four colors
    ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00'], // five colors
    ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33'], // six colors
    ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628'], // seven colors
    ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf'], // eight colors
    ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'], // nine colors
    ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a'], // ten colors
    ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99'], // eleven colors
    ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928'] // twelve colors
];

// variable used to manage the animation timer
var interval;


// implement a better way to stop the running algorithm
function stopKMeans(){
    console.log("stopping animation");
    clearInterval(interval);
}

function startKMeans(){
  clearInterval(interval);

  // validate number of cluster restriction
  var numberOfClusters = parseInt(document.getElementById("numberOfClusters").value);

   if (numberOfClusters < clusteringInfo.minClusters){
      alert("Number of clusters must be greater or equal to " + clusteringInfo.minClusters.toString());
      return;
   }

   if (numberOfClusters > clusteringInfo.maxClusters){
       alert("Number of clusters must be less than or equal to " + clusteringInfo.maxClusters.toString());
       return;
   }

   // select the colors to use in the visualization
   colors = colorPalette[numberOfClusters - 3];
  //console.log(numberOfClusters);

  var numberOfPoints = parseInt(document.getElementById("numberOfPoints").value);
  if (numberOfPoints < numberOfClusters){
    alert("Number of points must be greater or equal to the number of clusters");
    return;
  }

  var initializationMethod = document.getElementById("initializationMethod").value;
  console.log(initializationMethod);
  if (initializationMethod != "smart" && initializationMethod != "random"){
    alert("The only initialization methods allowed  are smart and random");
    return;
  }

  var data = generateRandomPoints(canvasInfo.radius, canvasInfo.width - canvasInfo.radius, canvasInfo.radius, canvasInfo.height - canvasInfo.radius, numberOfPoints);

    var visualizer = Object.create(Visualizer);
    runKMeans(data, numberOfClusters, visualizer, "#kmeans-board", clusteringInfo.maxIterations, initializationMethod, true);
}
