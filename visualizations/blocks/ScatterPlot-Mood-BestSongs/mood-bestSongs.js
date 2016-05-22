/* **************************************************** *
 *                 Private Functions                    *
 * **************************************************** */

 // Populates the dataset from a CSV file and creates the chart
 function createChart5(){

 	// Populates the dataset from a CSV file and creates
	d3.csv('best_songs_of_all_time.csv', function(error, data) {
		if(error){ 
			throw error;
		}

		var tempSongs = [];
		var classes = data.map(function(d, index) { 
			var similarSongs = [];
			var trackDecade, trackLinkItem;

			for(var i = 1; i < nearestNeighbors + 1; i++){
				trackDecade = getDecade(d['year similar song ' + i]);
				trackLinkItem = 'bsoat/' + trackDecade + '/' + d['similar artist ' + i] + ' - ' + d['similar song ' + i];
				similarSongs.push(trackLinkItem);

				currentObject = {
					'name': trackLinkItem,
					'imports': null,
					'class': trackDecade,
					'distance': d['distance ' + i]
				};
				tempSongs.push(currentObject);
			}
			
			return {
				'name': 'bsoat/bsoat/' + d['artist'] + ' - ' + d['title'],
				'imports': similarSongs,
				'class': 'bestSongs'
			};
		});

		classes = classes.concat(tempSongs);
		nodes = cluster.nodes(packageHierarchy(classes));
		links = packageImports(nodes);


		link.data(bundle(links))
			    .enter().append("path")
			      .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
			      .attr("class", "link")
			      .attr("data-source", function(d){
			      	return d.source.key;
			      })
			      .attr("data-target", function(d){
			      	return d.target.key;
			      })
			      .attr("d", line);

  		node.data(nodes.filter(function(n) { return !n.children; }))
			    .enter().append("text")
			      .attr("class", function(n) { 
			      	return "node " + n.class;
			      })
			      .attr("data-target", function(n){
			      	var targetString = "";
			      	if(n.imports !== null){
			      		for(var i = 0; i < n.imports.length; i++){
			      			var index = n.imports[i].lastIndexOf("/");
			      			targetString += n.imports[i].substring(index + 1) + " ";
			      		}
			      		return targetString;
			      	} else {
			      		return null;
			      	}
			      	
			      })
			      .attr("dy", ".31em")
			      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
			      .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
			      .text(function(d) { return d.key; })
			      .on("mouseover", mouseovered)
      			  .on("mouseout", mouseouted)
      			  .on("click", nodeClicked);
	});	
}

function getDecade(d){
	if(d < 1970){
		return '_60s';
	} 
	else if (1970 <= d && d < 1980){
		return '_70s';
	} 
	else if (1980 <= d && d < 1990){
		return '_80s';
	}
	else if (1990 <= d && d < 2000){
		return '_90s';
	}
	else if (2000 <= d && d < 2010){
		return '_00s';
	} 
	else if (2010 <= d){
		return '_10s';
	} else {
		console.log('Should never reach here!');
	}
}

function mouseovered(d) {
	var currentTextWidth = d3.select(this).node().getBBox().width + 5;

	if(d3.select(this).classed('playing')){
		playingIconBest.style('display', 'none');
		pauseIconBest.attr("transform", function() { 
			return "rotate(" + (d.x - 90) + ")translate(" + (d.x < 180 ? (d.y + currentTextWidth + 8) : (d.y + currentTextWidth + 8 + 30)) + "," + (d.x < 180 ? -16 : 16) + ")" + (d.x < 180 ? "" : "rotate(180)"); 
		})
			.style('display', 'block');
	} else {
		playIconBest.attr("transform", function() { 
			return "rotate(" + (d.x - 90) + ")translate(" + (d.x < 180 ? (d.y + currentTextWidth + 8) : (d.y + currentTextWidth + 8 + 30)) + "," + (d.x < 180 ? -16 : 16) + ")" + (d.x < 180 ? "" : "rotate(180)"); 
		})
			.style('display', 'block');
	}
	
	var selectedItem = d3.select(this);
	container5.selectAll('path').each(function(){
		var curentLink = d3.select(this);
		if(curentLink.attr('data-target') === d.key){
			curentLink.classed("link--target", true);
		} 
		else if(curentLink.attr('data-source') === d.key){
			curentLink.classed("link--source", true);
		}
	});

	container5.selectAll('text.node')
				.style('opacity', 0.2);
	container5.selectAll('text.node').each(function(){
		var currentNode = d3.select(this);
		if(selectedItem.attr('data-target') !== null && selectedItem.attr('data-target').indexOf(currentNode.text()) > -1){
			currentNode.classed("node--target", true)
						.style('opacity', 1);
		} 
		else if(currentNode.attr('data-target') !== null && currentNode.attr('data-target').indexOf(d.key) > -1){
			currentNode.classed("node--target", true)
						.style('opacity', 1);
		} 
		else if(currentNode.text() === d.key){
			currentNode.classed("node--source", true)
						.style('opacity', 1);
		} 
		
	});
}

function mouseouted(d) {
	playIconBest.style('display', 'none');
	pauseIconBest.style('display', 'none');

	if(d3.select(this).classed('playing')){
		playingIconBest.style('display', 'block');
	}

	container5.selectAll('path')
				.classed("link--target", false)
      			.classed("link--source", false);

    container5.selectAll('text')
				.classed("node--target", false)
      			.classed("node--source", false);

    container5.selectAll('text.node')
				.style('opacity', 1);
}

function nodeClicked(d){
	var clickedNode = d3.select(this);
	var currentTextWidth = clickedNode.node().getBBox().width + 5;

	var track = d.key.split('-')[1];
	var leadArtist = d.key.split('-')[0].split('featuring')[0];
	spotifyApi.searchTracks(leadArtist + ' ' + track, {limit: 1})
		.then(function(data) {
			var playingItems = d3.selectAll('.playing');

			var previousUrl = d3.select('#audio-player-best')
								.select('source.mpeg')
								.attr('src');

			var previewUrl = data.tracks.items[0].preview_url;

			if(previousUrl != previewUrl){
				playingItems.classed('playing', false);

				d3.select('#audio-player-best')
					.selectAll('source').attr('src', previewUrl);

				d3.select('#audio-player-best')[0][0].load();
				d3.select('#audio-player-best')[0][0].play();

				playIconBest.style('display', 'none');
				pauseIconBest.style('display', 'none');
				playingIconBest.attr("transform", function() { 
					return "rotate(" + (d.x - 90) + ")translate(" + (d.x < 180 ? (d.y + currentTextWidth + 8) : (d.y + currentTextWidth + 8 + 30)) + "," + (d.x < 180 ? -16 : 16) + ")" + (d.x < 180 ? "" : "rotate(180)"); 
					})
					.style('display', 'block');

				d3.select('#audio-player-best').classed('active', true);
				clickedNode.classed('playing', true);	
			} else {
				var hasClass = d3.select('#audio-player-best').classed('active');
				d3.select('#audio-player-best').classed('active', !hasClass);

				if(hasClass){
					clickedNode.classed('playing', false);
					playingIconBest.style('display', 'none');
					d3.select('#audio-player-best')[0][0].pause();
				} else {
					playIconBest.style('display', 'none');
					pauseIconBest.style('display', 'none');
					playingIconBest.attr("transform", function() { 
						return "rotate(" + (d.x - 90) + ")translate(" + (d.x < 180 ? (d.y + currentTextWidth + 8) : (d.y + currentTextWidth + 8 + 30)) + "," + (d.x < 180 ? -16 : 16) + ")" + (d.x < 180 ? "" : "rotate(180)"); 
					})
						.style('display', 'block');
					d3.select('#audio-player-best')[0][0].play();
					clickedNode.classed('playing', true);
				}
			}

			d3.select('#audio-player-best').on('ended', function(){
				playingIconBest.style('display', 'none');
				d3.select(this).classed('playing', false);
			});
		});
}

// Lazily construct the package hierarchy from class names.
function packageHierarchy(classes) {
    var map = {};

    function find(name, data) {
        var node = map[name], i;
        if (!node) {
            node = map[name] = data || { name: name, children: [] };
            if (name.length) {
                i = name.lastIndexOf("/");
                if(i > -1){
                    node.parent = find(name.substring(0, i));
                	node.parent.children.push(node);
                	node.key = name.substring(i + 1);
                } else {
                	node.parent=null;
                }
            }
        }
        return node;
    }

    classes.forEach(function (d) {
        if(typeof d.children === 'undefined'){
            d.children=[];
        }
        find(d.name, d);
    });

    return map["bsoat"];
}


// Return a list of imports for the given array of nodes.
function packageImports(nodes) {
  var map = {},
      imports = [];

  // Compute a map from name to node.
  nodes.forEach(function(d) {
    map[d.name] = d;
  });

  // For each import, construct a link from the source to target node.
  nodes.forEach(function(d) {
    if (d.imports) d.imports.forEach(function(i) {
      imports.push({source: map[d.name], target: map[i]});
    });
  });

  return imports;
}



/* **************************************************** *
 *                 		   Main                         *
 * **************************************************** */

// Chart info
var margin5 = {top: 40, right: 40, bottom: 40, left: 40},
    width5 = parseInt(d3.select('#chart5').style('width')) - margin5.left - margin5.right,
    height5 = parseInt(d3.select('#chart5').style('height')) - margin5.top - margin5.bottom;

var diameterValues = {'Small': 450, 'Medium': 600, 'Big': 750};

var diameter = null;
if(((width5 + margin5.left + margin5.right) >= 1500) && ((height5 + margin5.top + margin5.bottom) >= 700)){
	diameter = diameterValues['Big'];
} else if (((width5 + margin5.left + margin5.right) <= 500) && ((height5 + margin5.top + margin5.bottom) <= 400)){
	diameter = diameterValues['Small'];
} 
else {
	diameter = diameterValues['Medium'];
} 

var radius5 = diameter / 2,
    innerRadius = radius5 - 100;

 var cluster = d3.layout.cluster()
    .size([360, innerRadius])
    .sort(null)
    .value(function (d) { return d.size; });

var bundle = d3.layout.bundle();

var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(.85)
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });


var svg5 = d3.select('#chart5')
	.attr("preserveAspectRatio", "xMinYMin meet")
	.attr("viewBox", "-600 -600 1200 1000")
   //class to make it responsive
   .classed("svg-content-responsive", true); 
		  
var container5 = svg5.select('g.chart-wrapper');

var link = container5.select("g.link").selectAll('g'),
    node = container5.select("g.node").selectAll('g');

var nodes = [],
	links = [];

// Glyphicons
var playingIconBest = container5.select('.node')
					.append("svg:foreignObject")
						.attr("width", 20)
						.attr("height", 20)
						.attr("id", "playingIcon-best")
						.style('display', 'none');
playingIconBest.append("xhtml:span")
		.attr("class", "control glyphicon glyphicon-volume-up");

var playIconBest = container5.select('.node')
						.append("svg:foreignObject")
							.attr("width", 20)
							.attr("height", 20)
							.attr("id", "playIcon")
							.style('display', 'none');
playIconBest.append("xhtml:span")
		.attr("class", "control glyphicon glyphicon-play");

var pauseIconBest = container5.select('.node')
						.append("svg:foreignObject")
							.attr("width", 20)
							.attr("height", 20)
							.attr("id", "pauseIcon")
							.style('display', 'none');
pauseIconBest.append("xhtml:span")
		.attr("class", "control glyphicon glyphicon-pause");

// Instantiate Spotify wrapper
var spotifyApi = new SpotifyWebApi();

// Dataset init and chart creation
var nearestNeighbors = 5;
var classes;
createChart5();

