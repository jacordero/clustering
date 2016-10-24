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

// object that helps with the data visualization process
var Visualizer = {

    draw: function (data, blackboardElementId){
        d3.select("svg").remove();

        var svgContainer = d3.select(blackboardElementId).append("svg")
            .attr("width", width)
            .attr("height", height);

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

var KMeans = {

    iterations: 10,

    computeDistance : function(point1, point2){
        return Math.sqrt(Math.pow(point1.x_axis - point2.x_axis, 2) + Math.pow(point1.y_axis - point2.y_axis, 2))
    },

    assignCentroids : function (data, initialCentroids){
        var self = this;
        var assignedCentroids = []
        for (i = 0; i < data.length; i++){
            // iterate per centroids
            centroid_index = 0
            centroid_distance = self.computeDistance(data[i], initialCentroids[0]);
            //console.log("centroid_distance");
            //console.log(centroid_distance);
            for (j = 1; j < initialCentroids.length; j++){
                var distance = self.computeDistance(data[i], initialCentroids[j]);
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
    },

    updateCentroids : function (data, assignments, numberOfCentroids){
        //console.log("number of centroids");
        //console.log(numberOfCentroids);
        var newCentroids = generateEmptyCentroids(numberOfCentroids);
        //console.log(newCentroids);
        var pointsPerCentroid = arrayOfZeros(numberOfCentroids);
        for (i = 0; i < data.length; i++){
            var currentCentroid = newCentroids[assignments[i]];
            var point = data[i];
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
    },

    run : function(data, numberOfClusters, visualizer, blackboardElement, interval, verbose){
        var centroids = generateRandomCentroids(radius, width - radius, radius, height - radius, numberOfClusters);
        //console.log(centroids);
        visualizer.draw(data.concat(centroids), blackboardElement);
        var self = this;

        interval = setInterval(function(){
            if (self.iterations <= 0){
                clearInterval(interval);
                return;
            }

            [assignments, data] = self.assignCentroids(data, centroids);
            centroids = self.updateCentroids(data, assignments, numberOfClusters);
            visualizer.draw(data.concat(centroids), blackboardElement);
            self.iterations -= 1;

            if (verbose){
                console.log("remaining iterations: " + self.iterations.toString());
            }
        }, intervalDuration);
    }
}

// function used to start kmeans simulation
var radius = 5;
var width = 500;
var height = 400;
var minClusters = 3;
var maxClusters = 12;
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

   if (numberOfClusters < minClusters){
      alert("Number of clusters must be greater or equal to " + minClusters.toString());
      return;
   }

   if (numberOfClusters > maxClusters){
       alert("Number of clusters must be less than or equal to " + maxClusters.toString());
       return;
   }

   // select the colors to use in the visualization
   colors = colorPalette[numberOfClusters - 3];
  //console.log(numberOfClusters);

  var numberOfPoints = parseInt(document.getElementById("numberOfPoints").value);
  var data = generateRandomPoints(radius, width - radius, radius, height - radius, numberOfPoints);

    var visualizer = Object.create(Visualizer);
    var kmeans = Object.create(KMeans);
    kmeans.run(data, numberOfClusters, visualizer, '#kmeans-board', interval, true);
}





