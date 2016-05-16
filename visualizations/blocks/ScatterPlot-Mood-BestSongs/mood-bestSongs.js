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
		dataset5 = data.map(function(d, index) { 
			clusters.push([
					{
						'Cluster index': index,
						'Class': 'cluster_element',
						'Artist': d['similar artist 1'],
						'Title': d['similar song 1'],
						'Valence': +d['valence similar song 1'],
						'Energy': +d['energy similar song 1'],
						'Year': +d['year similar song 1'],
						'Distance': +d['distance 1'],
						'Image URL': null
					},
					{
						'Cluster index': index,
						'Class': 'cluster_element',
						'Artist': d['similar artist 2'],
						'Title': d['similar song 2'],
						'Valence': +d['valence similar song 2'],
						'Energy': +d['energy similar song 2'],
						'Year': +d['year similar song 2'],
						'Distance': +d['distance 2'],
						'Image URL': null
					},
					{
						'Cluster index': index,
						'Class': 'cluster_element',
						'Artist': d['similar artist 3'],
						'Title': d['similar song 3'],
						'Valence': +d['valence similar song 3'],
						'Energy': +d['energy similar song 3'],
						'Year': +d['year similar song 3'],
						'Distance': +d['distance 3'],
						'Image URL': null
					},
					{
						'Cluster index': index,
						'Class': 'cluster_element',
						'Artist': d['similar artist 4'],
						'Title': d['similar song 4'],
						'Valence': +d['valence similar song 4'],
						'Energy': +d['energy similar song 4'],
						'Year': +d['year similar song 4'],
						'Distance': +d['distance 4'],
						'Image URL': null
					},
					{
						'Cluster index': index,
						'Class': 'cluster_element',
						'Artist': d['similar artist 5'],
						'Title': d['similar song 5'],
						'Valence': +d['valence similar song 5'],
						'Energy': +d['energy similar song 5'],
						'Year': +d['year similar song 5'],
						'Distance': +d['distance 5'],
						'Image URL': null
					}
				]);
			var centerCoords = {
				'Index': index,
				'Year': +d['year'],
				'Energy': +d['energy'],
				'Valence': +d['valence']
			};
			clusterCenterCoords.push(centerCoords);
			return {
				'Index': index,
				'Class': 'cluster_center',
				'Year': +d['year'],
				'Energy': +d['energy'],
				'Valence': +d['valence'],
				'Artist': d['artist'],
				'Title': d['title'],
				'Image URL': d['image_url'],
				'Distance': null
			};
		});


		for(var cluster in clusters){
			for(var item in clusters[cluster]){
				dataset5.push(clusters[cluster][item]);
			}			
		}

		// Scales
		xScale5 = d3.scale.linear().domain([-0.01, 1.01]).range([0, width5]);
		yScale5 = d3.scale.linear().domain([-0.01, 1.01]).range([height5, 0]);

		// Chart creation

		// Tooltip creation			
		createToolTip();
		// Axis label creation		
		createAxesLabels5();
		// Gridlines creation
		createGridAxis5();
		// Circles creation
		updatePatterns(dataset5);
		// Circles creation
		updateCircles5(dataset5);
		// Resize
		d3.select(window).on('resize', resize5); 
		resize5();
	});
}

// Update loop which builds the patterns elements (used to display the artist images)
function updatePatterns(dataset5) {
	var p = container5
		.select('.defs')
		.selectAll('pattern')
		.data(dataset5);  

	p.enter()
		.append('pattern')
		.attr('id', function(d) { 
			d['Artist'] = d['Artist'].replace("'", "");
			return camelize(d['Artist']) + '-img'
		})
		.attr('patternContentUnits', 'objectBoundingBox')
		.attr('height', '100%')
		.attr('width', '100%')
			.append('image')
			.attr('width', '1')
			.attr('height', '1')
			.attr('preserveAspectRatio', 'none') // xMidYMid slice
			.attr('xlink:href', function(d) {return d['Image URL'];});

	p.exit().remove();	
}

// Update loop for the circles
function updateCircles5(dataset, clusters) {
	var u = container5
		.select('.circles')
		.selectAll('circle')
		.data(dataset);

	u.enter()
		.append('circle')
		.attr('class', function(d) {return d['Class'];})
		.attr('cx', function(d) {
			if(d['Class'] == 'cluster_center'){
				return xScale5(d['Valence']);
			} else {
				console.log(d.collide(0.5));
				var itemR = radiusScale5(d['Distance']),
					itemX = d['Valence'];
				var ix1 = itemX - itemR,
			    	ix2 = itemX + itemR;
				var clusterIndex = d['Cluster index'];
				var clusterCenterX = clusterCenterCoords[clusterIndex]['Valence'];
				var nx1 = clusterCenterX - radius5,
			    	nx2 = clusterCenterX + radius5;

				var overlapXUp = ix1 <= nx2  ? true : false;
				var overlapXDown = ix2 >= nx1 ? true : false;
				if(overlapXUp){
					var cx = nx2 + itemR;
					return xScale5(cx);
				} else if(overlapXDown){
					var cx = nx1 - itemR;
					return xScale5(cx);
				} else {
					return xScale5(d['Valence']);
				}
			}
		})
		.attr('cy', function(d) {
			if(d['Class'] == 'cluster_center'){
				return xScale5(d['Energy']);
			} else {
				var itemR = radiusScale5(d['Distance'])
					itemY = d['Energy'];
				var iy1 = itemY - itemR,
			    	iy2 = itemY + itemR;
				var clusterIndex = d['Cluster index'];
				var clusterCenterY = clusterCenterCoords[clusterIndex]['Valence'];
				var ny1 = clusterCenterY - radius5,
			    	ny2 = clusterCenterY + radius5;

				var overlapY = (iy1 <= ny2 || iy2 >= ny1) ? true : false;
				if(overlapY){
return xScale5(d['Energy']);
				} else {
					return xScale5(d['Energy']);
				}
			}
		})
		.attr('r', function(d) {
			if(d['Class'] == 'cluster_center'){
				return radius5;
			} else {
				return radiusScale5(d['Distance']);
			}
		}) 
		.style('stroke-width', function(d) {
			if(d['Class'] == 'cluster_center'){
				return '2px';
			}
		})
		.style('stroke', function(d) {
			if(d['Class'] == 'cluster_center'){
				return '#656D78';
			}
		})
		.style('fill', function(d, i) {
			if(d['Class'] == 'cluster_center'){
				return 'url(#' + camelize(d['Artist']) + '-img)';
			}
			else {
				return color(d['Cluster index']);
			}
			
		});

	u.exit().remove();

	container5.selectAll('.cluster_center')
				.each(function(){
					d3.select(this).moveToFront();
				});

	u.on('mouseover', function(d) {

		var selectedCircle = d3.select(this);
		var allCircles = container5.selectAll('circle');

		// All other circles are faded out
		allCircles.filter(function(x) { return d['Artist'] != x['Artist']; })
		        .style('opacity', 0.2);				

		selectedCircle.transition()
			.duration(200)
			.attr('r', hoveredRadius5)
			.each("end", function(d){ return tip5.show(d, this); });

		selectedCircle.moveToFront();		

/*
		var selectedCircle = d3.select(this);
		if(selectedCircle.classed('tracksToDisplay')){			

			selectedCircle.transition()
				.duration(200)
				.attr('r', hoveredRadius5)
				.each("end", function(d){ 	
					pauseIcon.style('display', 'none');
					var r_glyph = +selectedCircle.attr('r');
					var x_glyph = +selectedCircle.attr('cx') - r_glyph / 2;
					var y_glyph = +selectedCircle.attr('cy') - r_glyph / 2;	
					if(selectedCircle.classed('playing')){
						playingIcon.style('display', 'none');
						pauseIcon.attr("y", y_glyph)
						   .attr("x", x_glyph)
						   .style('display', 'block');
					} 
					else {
						playIcon.attr("y", y_glyph)
						   .attr("x", x_glyph)
						   .style('display', 'block');
					}
					
					return tip.show(d, this); 
				});

			selectedCircle.moveToFront();
		}*/
	});

	u.on('mouseout', function(d) {
		/*var selectedCircle = d3.select(this);
		if(selectedCircle.classed('tracksToDisplay') && !(selectedCircle.classed('playing'))){		
			selectedCircle.attr('r', radiusValues5['Big'])
							.transition()
							.duration(200);
			
			playIcon.style('display', 'none');
			tip.hide(d);
			selectedCircle.moveToBack();
		}
		else if(selectedCircle.classed('playing')){
			var r_glyph = +selectedCircle.attr('r');
			var x_glyph = +selectedCircle.attr('cx') - r_glyph / 2;
			var y_glyph = +selectedCircle.attr('cy') - r_glyph / 2;	
			pauseIcon.style('display', 'none');
			playingIcon.attr("y", y_glyph)
						.attr("x", x_glyph)
						.style('display', 'block');
		}	*/
		var selectedCircle = d3.select(this);
		
		var allCircles = container5.selectAll('circle')
						.style('opacity', 1);

		selectedCircle.attr('r', radius5)
						.transition()
						.duration(200);
		
		selectedCircle.moveToBack();
		tip5.hide(d);	
	});

	u.on('click', function(d) {
		var selectedCircle = d3.select(this);

		playingIcon.style('display', 'none');
		playIcon.style('display', 'none');
		pauseIcon.style('display', 'none');

		var playingItems = d3.selectAll('.playing');
		playingItems.attr('r', radiusValues5['Big'])
						.transition()
						.duration(200);

		if(selectedCircle.classed('tracksToDisplay')){	
			spotifyApi.searchTracks(d['Artist'] + ' ' + d['Title'] , {limit: 1})
				.then(function(data) {
					var previousUrl = d3.select('#audio-player-best')
										.select('source.mpeg')
										.attr('src');

					var previewUrl = data.tracks.items[0].preview_url;

					var r_glyph = +selectedCircle.attr('r');
					var x_glyph = +selectedCircle.attr('cx') - r_glyph / 2;
					var y_glyph = +selectedCircle.attr('cy') - r_glyph / 2;

					if(previousUrl != previewUrl){
						playingItems.classed('playing', false);
						d3.select('#audio-player-best')
							.selectAll('source').attr('src', previewUrl);

						d3.select('#audio-player-best')[0][0].load();
						d3.select('#audio-player-best')[0][0].play();
						selectedCircle.classed('playing', true);

					    playingIcon.attr("y", y_glyph)
					    		.attr("x", x_glyph)
					    		.style('display', 'block');
									 
						d3.select('#audio-player-best').classed('active', true);
						
					} else {
						var hasClass = d3.select('#audio-player-best').classed('active');
						d3.select('#audio-player-best').classed('active', !hasClass);

						if(hasClass){
							playingIcon.style('display', 'none');
							d3.select('#audio-player-best')[0][0].pause();
							selectedCircle.classed('playing', false);
							selectedCircle.attr('r', radiusValues5['Big'])
										.transition()
										.duration(200);
						} else {
							d3.select('#audio-player-best')[0][0].play();
							selectedCircle.classed('playing', true);

							playingIcon.attr("y", y_glyph)
					    		.attr("x", x_glyph)
					    		.style('display', 'block');
						}
					}

					d3.select('#audio-player-best').on('ended', function(){
						playingIcon.style('display', 'none');
						selectedCircle.classed('playing', false);
						selectedCircle.attr('r', radiusValues5['Big'])
										.transition()
										.duration(200);
			
						tip.hide(d);
						selectedCircle.moveToBack();
					});
				});
		}
	});

}


// Axis label creation
function createAxesLabels5() {
	container5.select('.x.axis')
		.append('text')
	    .attr('class', 'x label')
	    .attr('text-anchor', 'end')
	    .attr('x', width5)
	    .attr('y', height5 + 30)
	    .text('Valence');

	 container5.select('.y.axis')
		.append('text')
	    .attr('class', 'y label')
	    .attr('text-anchor', 'end')
	    .attr('y', -35)
	    .attr('dy', '.75em')
	    .attr('transform', 'rotate(-90)')
	    .text('Energy');
}

// Grid lines creation
function createGridAxis5() {
	// Define vertical grid lines
	gridXAxis5 = d3.svg.axis()
			.scale(xScale5)
			.orient('bottom')
			.ticks(5);

	container5.select('.grids')
		.append('g')         
		.attr('class', 'grid')
		.attr('id', 'gridY')
		.attr('transform', 'translate(0, '+height5+')')
		.style('stroke-dasharray', ('2, 2'))
		.call(gridXAxis5.tickSize(-height5 - 15, 0, 0));

	// Define horizontal grid lines
	gridYAxis5 = d3.svg.axis()
			.scale(yScale5)
			.orient('left')
			.ticks(5);

	container5.select('.grids')
		.append('g')         
		.attr('class', 'grid')
		.attr('id', 'gridX')
		.attr('transform', 'translate(0, 0)')
		.style('stroke-dasharray', ('2, 2'))
		.call(gridYAxis5.tickSize(-width5, 0, 0));
}

// Tooltip creation (uses the .tip() function from the d3-tip js library)
function createToolTip(){
	tip5 = d3.tip()
	    .attr('class', 'd3-tip')
	    .offset([-10, 0])
	    .html(function(d) {
			return "<div><span class='tooltipTitle'>" + d['Artist']+ "</span></div>" +
			      "<div><span>Track:</span> <span class='tooltipContents'>" + d['Title']+ "</span></div>" +
			     "<div><span>Year:</span> <span class='tooltipContents'>" + d['Year']+ "</span></div>" + 
			     "<div><span>Valence:</span> <span class='tooltipContents'>" + d['Valence']+ "</span></div>" +
			     "<div><span>Energy:</span> <span class='tooltipContents'>" + d['Energy']+ "</span></div>";
		});

	container5.call(tip5);
}

// Resize function which makes the graph responsive
function resize5() {

	// Find the new window dimensions 
    var width5 = parseInt(d3.select('#chart5').style('width')) - margin5.left - margin5.right,
    	height5 = parseInt(d3.select('#chart5').style('height')) - margin5.top - margin5.bottom;

    var minDistance = d3.min(dataset5, function(d) { return d['Distance']; });
    var maxDistance = d3.max(dataset5, function(d) { return d['Distance']; });
    console.log(minDistance);
    console.log(maxDistance);
	radiusScale5.domain([maxDistance, minDistance]);


    if(((width5 + margin5.left + margin5.right) >= 1500) && ((height5 + margin5.top + margin5.bottom) >= 700)){
		radius5 = radiusValues5['Big'];
		hoveredRadius5 = hoveredRadiusValues5['Big'];
	} else if (((width5 + margin5.left + margin5.right) <= 500) && ((height5 + margin5.top + margin5.bottom) <= 400)){
		radius5 = radiusValues5['Small'];
		hoveredRadius5 = hoveredRadiusValues5['Small'];
	} 
	else {
		radius5 = radiusValues5['Medium'];
		hoveredRadius5 = hoveredRadiusValues5['Medium'];
	} 


	// Update the range of the scales with new width/height
	xScale5.range([0, width5]);
	yScale5.range([height5, 0]);

	// Update all the existing elements (gridlines, axis text, circles)
	gridXAxis5.scale(xScale5);
	gridYAxis5.scale(yScale5);

	container5.select('#gridY')
			.attr('transform', 'translate(0, '+height5+')')
			.call(gridXAxis5.tickSize(-height5 - 15, 0, 0));

	container5.select('#gridX')
			.call(gridYAxis5.tickSize(-width5, 0, 0));

	container5.select('.x.label')
	    .attr('x', width5)
	    .attr('y', height5 + 30);

	container5.selectAll('.cluster_center')
		.attr('cx', function(d) {return xScale5(d['Valence']);})
		.attr('cy', function(d) {return yScale5(d['Energy']);})
		.attr('r', radius5); 

}

function clearGraph(){
	clearGrids();
	clearPatterns();
	clearCircles();
	clearAxisTitles();
}

function clearGrids(){
	d3.select('.grids').selectAll('g').remove();
}

function clearPatterns(){
	d3.select('.defs').selectAll('pattern').remove();
}

function clearCircles(){
	d3.select('.circles').selectAll('circle').remove();
}

function clearAxisTitles(){
	d3.select('.x.axis').selectAll('text').remove();
	d3.select('.y.axis').selectAll('text').remove();
}

// Function which takes a string and return its camelized version (useful for DOM elements ID)
function camelize(str) {
	return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    	if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces
    	return index == 0 ? match.toLowerCase() : match.toUpperCase();
  	});
}

// Function which put the current element to the front.
// This is useful as d3 renders the last inserted element on the front.
d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
		this.parentNode.appendChild(this);
	});
};

// Function which put the current element to the back
d3.selection.prototype.moveToBack = function() { 
    return this.each(function() { 
        var firstChild = this.parentNode.firstChild; 
        if (firstChild) { 
            this.parentNode.insertBefore(this, firstChild); 
        } 
	}); 
};

// This is a functions that scrolls to #{blah}link
function goToByScroll(id){
    // Scroll
    $('html,body').animate({
        scrollTop: $("#"+id).offset().top}, 'slow');
}

function setXValues(valueToDisplay){
	if(valueToDisplay == "Hotttnesss"){
		xAxisValues = {'Small': 'Artist Hotttnesss', 'Medium': 'Artist Hotttnesss'};
	} else {
		xAxisValues = {'Small': 'Artist Familiarity', 'Medium': 'Artist Familiarity'};
	}
}

function decadeButtonsShowHideCircles(){
	d3.select('.circles')
		.selectAll('circle').style("opacity", 1);
	d3.select('.averageLines')
			.selectAll('line').style('display', 'block');

	var val = null;	
	d3.select('#decadeSelector').selectAll('label:not(.active_bis)').each(function(){
		val = d3.select(this).select('input').node().value;
		d3.select('.circles')
			.selectAll('circle.' + val).style('opacity', 0);
		d3.select('.averageLines')
			.selectAll('line.' + val).style('display', 'none');
	});
}

// Resolves collisions between d and all other circles.
function collide(alpha) {
  var quadtree = d3.geom.quadtree(graph.nodes);
  return function(d) {
    var rb = 2*radius + padding,
        nx1 = d.x - rb,
        nx2 = d.x + rb,
        ny1 = d.y - rb,
        ny2 = d.y + rb;
    quadtree.visit(function(quad, x1, y1, x2, y2) {
      if (quad.point && (quad.point !== d)) {
        var x = d.x - quad.point.x,
            y = d.y - quad.point.y,
            l = Math.sqrt(x * x + y * y);
          if (l < rb) {
          l = (l - rb) / l * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    });
  };
}

/* **************************************************** *
 *                 		   Main                         *
 * **************************************************** */

// Chart info
var margin5 = {top: 40, right: 40, bottom: 40, left: 40},
    width5 = parseInt(d3.select('#chart5').style('width')) - margin5.left - margin5.right,
    height5 = parseInt(d3.select('#chart5').style('height')) - margin5.top - margin5.bottom,
    padding = 1.5, // separation between same-color circles
    clusterPadding = 6,
    color = d3.scale.category10();;

var svg5 = d3.select('#chart5')
		    .attr('width', width5 + margin5.left + margin5.right)
		    .attr('height', height5 + margin5.top + margin5.bottom);
		  
var container5 = svg5.select('g.chart-wrapper')
		    .attr('transform', 'translate(' + margin5.left + ',' + margin5.top + ')');

// Radius details
var radiusValues5 = {'Small': 12, 'Medium': 17, 'Big': 30};
var hoveredRadiusValues5 = {'Small': 22, 'Medium': 30, 'Big': 40};

// Scales
var xScale5 = null;
var yScale5 = null;
var radius5 = null;
var hoveredRadius5 = null;
var radiusScale5 = null;
if(((width5 + margin5.left + margin5.right) >= 1500) && ((height5 + margin5.top + margin5.bottom) >= 700)){
	radius5 = radiusValues5['Big'];
	hoveredRadius5 = hoveredRadiusValues5['Big'];
	radiusScale5 = d3.scale.sqrt().range([10, 17]);
} else if (((width5 + margin5.left + margin5.right) <= 500) && ((height5 + margin5.top + margin5.bottom) <= 400)){
	radius5 = radiusValues5['Small'];
	hoveredRadius5 = hoveredRadiusValues5['Small'];
	radiusScale5 = d3.scale.sqrt().range([1, 7]);
} 
else {
	radius5 = radiusValues5['Medium'];
	hoveredRadius5 = hoveredRadiusValues5['Medium'];
	radiusScale5 = d3.scale.sqrt().range([5, 12]);
} 

// Tooltip
var tip5 = null;

// Grid lines
var gridXAxis5 = null;
var gridYAxis5 = null;
var formatPercent5 = d3.format(".0%");

// Event handlers for the button-group
var decadeButtons = d3.select('#decadeSelector')
						.selectAll('label:not(.btn-all)');

decadeButtons.on('click', function(){ 
	d3.select('.btn-all').classed('active', false);
	d3.select('.averageLines')
			.selectAll('line.all').style('display', 'none');

	d3.selectAll('.band-img').classed('active-artist', false);
	d3.select('.circles')
			.selectAll('circle')
			.attr('r', radius5);

	d3.select(this).classed('inactive', false);

	if(d3.select(this).classed('active_bis')){
		d3.select(this).classed('active_bis', false);
	} else {
		d3.select(this).classed('active_bis', true);
	}
	
	d3.select('#decadeSelector').selectAll('label:not(.active_bis)').classed('inactive', true);
	
	decadeButtonsShowHideCircles();
	
});

var allButton = d3.select('#decadeSelector')
						.select('.btn-all');

allButton.on('click', function(){ 
	decadeButtons.classed('inactive', false);
	decadeButtons.classed('active_bis', false);
	decadeButtons.classed('active', false);
	d3.select('.averageLines')
			.selectAll('line').style('display', 'none');	

	d3.selectAll('.band-img').classed('active-artist', false);
	d3.select('.circles')
			.selectAll('circle')
			.attr('r', radius5);

	if(d3.select(this).classed('active')){
		d3.select('.circles')
			.selectAll('circle').style('opacity', 0);
		d3.select('.averageLines')
			.selectAll('line.all').style('display', 'none');
	} else {
		d3.select('.circles')
			.selectAll('circle').style('opacity', 1);
		d3.select('.averageLines')
			.selectAll('line.all').style('display', 'block');
	}
});


// Representative artists logic
d3.selectAll('.band-img').on('mouseover', function(){
	d3.select(this).classed('grey-scale', false);
});

d3.selectAll('.band-img').on('mouseout', function(){
	d3.select(this).classed('grey-scale', true);
});

d3.selectAll('.band-img').on('click', function(){
	var clickedID = d3.select(this).attr('id');
	if(d3.select(this).classed('active-artist')){
		d3.select(this).classed('active-artist', false);
		d3.select('.circles')
			.selectAll('circle')
			.attr('r', radius5);
		d3.select('.circles')
			.selectAll('circle')
			.classed('tracksToDisplay', false);
		if(d3.select('.btn-all').classed('active')){
			d3.select('.circles')
						.selectAll('circle')
						.style('opacity', 1);
			d3.select('.averageLines')
				.selectAll('line').style('display', 'none');
			d3.select('.averageLines')
				.selectAll('line.all').style('display', 'block');
		} else{
			decadeButtonsShowHideCircles();
		}		
	} else {
		d3.selectAll('.band-img').classed('active-artist', false);
		d3.select(this).classed('active-artist', true);
		var tracksToDisplay = d3.select('.circles')
							.selectAll('circle')
							.filter(function() { 
								return d3.select(this).classed(clickedID); 
							});
		d3.select('.circles')
					.selectAll('circle')
					.style('opacity', 0.1);
		tracksToDisplay.style('opacity', 1)
					   .attr('r', radiusValues5['Big'])
					   .classed('tracksToDisplay', true)
					   .moveToFront();
		if(!d3.select('.btn-all').classed('active')){
			d3.select('#decadeSelector').selectAll('label:not(.active_bis)').each(function(){
				val = d3.select(this).select('input').node().value;
				d3.select('.circles').selectAll('circle.' + val).style('opacity', 0);
			});
		}
	}	
});

var playingIcon = container5.select('.circles')
						.append("svg:foreignObject")
							.attr("width", 20)
							.attr("height", 20)
							.attr("id", "playingIcon")
							.style('display', 'none');
playingIcon.append("xhtml:span")
		.attr("class", "control glyphicon glyphicon-volume-up");

var playIcon = container5.select('.circles')
						.append("svg:foreignObject")
							.attr("width", 20)
							.attr("height", 20)
							.attr("id", "playIcon")
							.style('display', 'none');
playIcon.append("xhtml:span")
		.attr("class", "control glyphicon glyphicon-play");

var pauseIcon = container5.select('.circles')
						.append("svg:foreignObject")
							.attr("width", 20)
							.attr("height", 20)
							.attr("id", "pauseIcon")
							.style('display', 'none');
pauseIcon.append("xhtml:span")
		.attr("class", "control glyphicon glyphicon-pause");

// Instantiate Spotify wrapper
var spotifyApi = new SpotifyWebApi();

// Dataset init and chart creation
var dataset5 = [];
var clusters = [];
var clusterCenterCoords = [];
var decadeData = [];
createChart5();

