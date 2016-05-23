/* **************************************************** *
 *                 Private Functions                    *
 * **************************************************** */

 // Populates the dataset from a CSV file and creates the chart
 function createChart4(){

 	// Populates the dataset from a CSV file and creates
	d3.csv('billboard_df-final.csv', function(error, data) {
		if(error){ 
			throw error;
		}
		dataset4 = data.map(function(d, index) { 
			return {
				'Year': +d['Year'],
				'Energy': +d['energy'],
				'Valence': +d['valence'],
				'Artist(s)': d['Artist(s)'],
				'Title': d['Title'],
				'Lead Artist(s)': d['Lead Artist(s)']
			};
		});

		d3.csv('best_songs_of_all_time.csv', function(error, data) {
			if(error){ 
				throw error;
			}

			var bestSongs = data.map(function(d, index) { 
				return {
					'Year': +d['year'],
					'Energy': +d['energy'],
					'Valence': +d['valence'],
					'Artist(s)': d['artist'],
					'Title': d['title'],
					'Lead Artist(s)': d['artist'],
					'Image URL': d['image_url'],
					'Class': 'bestSongs'
				};
			});

			// Scales
			xScale4 = d3.scale.linear().domain([-0.01, 1.01]).range([0, width4]);
			yScale4 = d3.scale.linear().domain([-0.01, 1.01]).range([height4, 0]);

			// Chart creation

			// Tooltip creation			
			createToolTip();
			// Axis label creation		
			createAxesLabels4();
			// Gridlines creation
			createGridAxis4();
			// Average lines creation
			createAverageLines(dataset4);
			// Circles creation
			updateCircles4(dataset4);

			// Image circle creation
			updatePatterns(bestSongs);
			// Best songs circles creation
			updateBestSongs(bestSongs);

			// Resize
			d3.select(window).on('resize', resize4); 
			resize4();
		});
	});
}

// Average lines creation
function createAverageLines(dataset){
	var l = container4
		.select('.averageLines');

	var mean_x = d3.mean(dataset, function(d) { return +d['Valence']});
	var mean_y = d3.mean(dataset, function(d) { return +d['Energy']});	

	l.append('line')
			.attr('id', 'mean_x_all')
	     	.attr('x1', function() { return xScale4(mean_x); })
	     	.attr('y1', function() { return yScale4(-0.01); })
	     	.attr('x2', function() { return xScale4(mean_x); })
	     	.attr('y2', function() { return yScale4(1.01); })
	     	.attr('stroke-width', 2)
	        .attr('class', 'all')
	        .style('display', 'block');

	l.append('line')
		.attr('id', 'mean_y_all')
     	.attr('x1', function() { return xScale4(-0.01); })
     	.attr('y1', function() { return yScale4(mean_y); })
     	.attr('x2', function() { return xScale4(1.01); })
     	.attr('y2', function() { return yScale4(mean_y); })
     	.attr('stroke-width', 2)
        .attr('class', 'all')
        .style('display', 'block');	

	decadeData['_60s'] = dataset.filter(function(d) { return d['Year'] < 1970; });
	decadeData['_70s'] = dataset.filter(function(d) { return d['Year'] >= 1970 && d['Year'] < 1980; });
	decadeData['_80s'] = dataset.filter(function(d) { return d['Year'] >= 1980 && d['Year'] < 1990; });
	decadeData['_90s'] = dataset.filter(function(d) { return d['Year'] >= 1990 && d['Year'] < 2000; });
	decadeData['_00s'] = dataset.filter(function(d) { return d['Year'] >= 2000 && d['Year'] < 2010; });	
	decadeData['_10s'] = dataset.filter(function(d) { return d['Year'] >= 2010; });	

	decadeData.sort();

	for(var decade in decadeData){
		mean_x = d3.mean(decadeData[decade], function(d) { return +d['Valence']});
		mean_y = d3.mean(decadeData[decade], function(d) { return +d['Energy']});

		l.append('line')
			.attr('id', 'mean_x' + decade)
	     	.attr('x1', function() { return xScale4(mean_x); })
	     	.attr('y1', function() { return yScale4(-0.01); })
	     	.attr('x2', function() { return xScale4(mean_x); })
	     	.attr('y2', function() { return yScale4(1.01); })
	     	.attr('stroke-width', 2)
	        .attr('class', decade)
	        .style('display', 'none');

		l.append('line')
			.attr('id', 'mean_y' + decade)
	     	.attr('x1', function() { return xScale4(-0.01); })
	     	.attr('y1', function() { return yScale4(mean_y); })
	     	.attr('x2', function() { return xScale4(1.01); })
	     	.attr('y2', function() { return yScale4(mean_y); })
	     	.attr('stroke-width', 2)
	        .attr('class', decade)
	        .style('display', 'none');
	}
		
}

// Update loop which builds the patterns elements (used to display the artist images)
function updatePatterns(bestSongs) {
	var p = container4
		.select('.defs')
		.selectAll('pattern')
		.data(bestSongs);  

	p.enter()
		.append('pattern')
		.attr('id', function(d) { 
			d['Artist'] = d['Artist(s)'].replace("'", "");
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

// Update loop for the best songs circles
function updateBestSongs(bestSongs) {
	var u = container4
		.select('.bestSongsCircles')
		.selectAll('circle')
		.data(bestSongs);

	u.enter()
		.append('circle')
		.attr('class', function(d) {return d['Class'];})
		.attr('cx', function(d) {
			return xScale4(d['Valence']);
		})
		.attr('cy', function(d) {
			return yScale4(d['Energy']);
		})
		.attr('r', radiusBestSongs4) 
		.style('stroke-width', '2px')
		.style('stroke', '#656D78')
		.style('fill', function(d, i) {
			return 'url(#' + camelize(d['Artist']) + '-img)';	
		});

	u.exit().remove();

	u.on('mouseover', function(d) {
		var selectedCircle = d3.select(this);
		
		selectedCircle.transition()
			.duration(200)
			.attr('r', hoveredRadius4)
			.each("end", function(d){ 	
				return tip4.show(d, this); 
			});
		selectedCircle.moveToFront();

	});

	u.on('mouseout', function(d) {
		var selectedCircle = d3.select(this);
		if(!(selectedCircle.classed('playing'))){		
			selectedCircle.attr('r', radiusBestSongs4)
							.transition()
							.duration(200);
			
			tip4.hide(d);
			selectedCircle.moveToBack();
		}	
	});

	u.on('click', function(d) {
		var selectedCircle = d3.select(this);

		playingIcon.style('display', 'none');
		playIcon.style('display', 'none');
		pauseIcon.style('display', 'none');

		var playingItems = d3.selectAll('.playing');
		playingItems.attr('r', radiusBestSongs4)
						.transition()
						.duration(200);
	
		spotifyApi.searchTracks(d['Artist'] + ' ' + d['Title'] , {limit: 1})
			.then(function(data) {
				var previousUrl = d3.select('#audio-player')
									.select('source.mpeg')
									.attr('src');

				var previewUrl = data.tracks.items[0].preview_url;

				if(previousUrl != previewUrl){
					playingItems.classed('playing', false);
					d3.select('#audio-player')
						.selectAll('source').attr('src', previewUrl);

					d3.select('#audio-player')[0][0].load();
					d3.select('#audio-player')[0][0].play();
					selectedCircle.classed('playing', true);
								 
					d3.select('#audio-player').classed('active', true);
					
				} else {
					var hasClass = d3.select('#audio-player').classed('active');
					d3.select('#audio-player').classed('active', !hasClass);

					if(hasClass){
						d3.select('#audio-player')[0][0].pause();
						selectedCircle.classed('playing', false);
						selectedCircle.attr('r', radiusBestSongs4)
									.transition()
									.duration(200);
					} else {
						d3.select('#audio-player')[0][0].play();
						selectedCircle.classed('playing', true);
					}
				}

				d3.select('#audio-player').on('ended', function(){
					selectedCircle.classed('playing', false);
					selectedCircle.attr('r', radiusBestSongs4)
									.transition()
									.duration(200);
		
					tip4.hide(d);
					selectedCircle.moveToBack();
				});
			});
	});

}

// Update loop for the circles
function updateCircles4(dataset) {
	var u = container4
		.select('.circles')
		.selectAll('circle')
		.data(dataset);

	u.enter()
		.append('circle')
		.attr('class', function(d) {
			var currentClass = '';
			if(d['Year'] < 1970){
				currentClass = '_60s';
			} 
        	else if (1970 <= d['Year'] && d['Year'] < 1980){
        		currentClass = '_70s';
        	} 
        	else if (1980 <= d['Year'] && d['Year'] < 1990){
				currentClass = '_80s';
        	}
        	else if (1990 <= d['Year'] && d['Year'] < 2000){
        		currentClass = '_90s';
        	}
        	else if (2000 <= d['Year'] && d['Year'] < 2010){
        		currentClass = '_00s';
        	} 
        	else if (2010 <= d['Year']){
        		currentClass = '_10s';
        	}

        	var matches = d['Artist(s)'].match(/.*(rihanna|eminem|mariah carey|michael jackson|stevie wonder|the beatles).*/i);
			if(matches !== null){
				var tempClassName = matches[1].toLowerCase();
				currentClass += ' ' + tempClassName.replace(/ /g,"-");
			}
			return currentClass;
		});

	u.exit().remove();

	u.attr('cx', function(d) {return xScale4(d['Valence']);})
		.attr('cy', function(d) {return yScale4(d['Energy']);})
		.attr('r', radius4) 
		.style('stroke-width', '1px');

	u.on('mouseover', function(d) {
		var selectedCircle = d3.select(this);
		if(selectedCircle.classed('tracksToDisplay')){			

			selectedCircle.transition()
				.duration(200)
				.attr('r', hoveredRadius4)
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
					
					return tip4.show(d, this); 
				});

			selectedCircle.moveToFront();
		}
	});

	u.on('mouseout', function(d) {
		var selectedCircle = d3.select(this);
		if(selectedCircle.classed('tracksToDisplay') && !(selectedCircle.classed('playing'))){		
			selectedCircle.attr('r', radiusValues4['Big'])
							.transition()
							.duration(200);
			
			playIcon.style('display', 'none');
			tip4.hide(d);
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
		}		
	});

	u.on('click', function(d) {
		var selectedCircle = d3.select(this);

		playingIcon.style('display', 'none');
		playIcon.style('display', 'none');
		pauseIcon.style('display', 'none');

		var playingItems = d3.selectAll('.playing');
		playingItems.attr('r', radiusValues4['Big'])
						.transition()
						.duration(200);

		if(selectedCircle.classed('tracksToDisplay')){	
			spotifyApi.searchTracks(d['Lead Artist(s)'] + ' ' + d['Title'] , {limit: 1})
				.then(function(data) {
					var previousUrl = d3.select('#audio-player')
										.select('source.mpeg')
										.attr('src');

					var previewUrl = data.tracks.items[0].preview_url;

					var r_glyph = +selectedCircle.attr('r');
					var x_glyph = +selectedCircle.attr('cx') - r_glyph / 2;
					var y_glyph = +selectedCircle.attr('cy') - r_glyph / 2;

					if(previousUrl != previewUrl){
						playingItems.classed('playing', false);
						d3.select('#audio-player')
							.selectAll('source').attr('src', previewUrl);

						d3.select('#audio-player')[0][0].load();
						d3.select('#audio-player')[0][0].play();
						selectedCircle.classed('playing', true);

					    playingIcon.attr("y", y_glyph)
					    		.attr("x", x_glyph)
					    		.style('display', 'block');
									 
						d3.select('#audio-player').classed('active', true);
						
					} else {
						var hasClass = d3.select('#audio-player').classed('active');
						d3.select('#audio-player').classed('active', !hasClass);

						if(hasClass){
							playingIcon.style('display', 'none');
							d3.select('#audio-player')[0][0].pause();
							selectedCircle.classed('playing', false);
							selectedCircle.attr('r', radiusValues4['Big'])
										.transition()
										.duration(200);
						} else {
							d3.select('#audio-player')[0][0].play();
							selectedCircle.classed('playing', true);

							playingIcon.attr("y", y_glyph)
					    		.attr("x", x_glyph)
					    		.style('display', 'block');
						}
					}

					d3.select('#audio-player').on('ended', function(){
						playingIcon.style('display', 'none');
						selectedCircle.classed('playing', false);
						selectedCircle.attr('r', radiusValues4['Big'])
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
function createAxesLabels4() {
	container4.select('.x.axis')
		.append('text')
	    .attr('class', 'x label')
	    .attr('text-anchor', 'end')
	    .attr('x', width4)
	    .attr('y', height4 + 30)
	    .text('Valence');

	 container4.select('.y.axis')
		.append('text')
	    .attr('class', 'y label')
	    .attr('text-anchor', 'end')
	    .attr('y', -35)
	    .attr('dy', '.75em')
	    .attr('transform', 'rotate(-90)')
	    .text('Energy');
}

// Grid lines creation
function createGridAxis4() {
	// Define vertical grid lines
	gridXAxis4 = d3.svg.axis()
			.scale(xScale4)
			.orient('bottom')
			.ticks(5);

	container4.select('.grids')
		.append('g')         
		.attr('class', 'grid')
		.attr('id', 'gridY')
		.attr('transform', 'translate(0, '+height4+')')
		.style('stroke-dasharray', ('2, 2'))
		.call(gridXAxis4.tickSize(-height4 - 15, 0, 0));

	// Define horizontal grid lines
	gridYAxis4 = d3.svg.axis()
			.scale(yScale4)
			.orient('left')
			.ticks(5);

	container4.select('.grids')
		.append('g')         
		.attr('class', 'grid')
		.attr('id', 'gridX')
		.attr('transform', 'translate(0, 0)')
		.style('stroke-dasharray', ('2, 2'))
		.call(gridYAxis4.tickSize(-width4, 0, 0));
}

// Tooltip creation (uses the .tip() function from the d3-tip js library)
function createToolTip(){
	tip4 = d3.tip()
	    .attr('class', 'd3-tip')
	    .offset([-10, 0])
	    .html(function(d) {
			return "<div><span class='tooltipTitle'>" + d['Artist(s)']+ "</span></div>" +
			      "<div><span>Track:</span> <span class='tooltipContents'>" + d['Title']+ "</span></div>" +
			     "<div><span>Year:</span> <span class='tooltipContents'>" + d['Year']+ "</span></div>" + 
			     "<div><span>Valence:</span> <span class='tooltipContents'>" + d['Valence']+ "</span></div>" +
			     "<div><span>Energy:</span> <span class='tooltipContents'>" + d['Energy']+ "</span></div>";
		});

	container4.call(tip4);
}

// Resize function which makes the graph responsive
function resize4() {

	// Find the new window dimensions 
    var width4 = parseInt(d3.select('#chart4').style('width')) - margin4.left - margin4.right,
    	height4 = parseInt(d3.select('#chart4').style('height')) - margin4.top - margin4.bottom;

    if(((width4 + margin4.left + margin4.right) >= 1500) && ((height4 + margin4.top + margin4.bottom) >= 700)){
		radius4 = radiusValues['Big'];
		hoveredRadius4 = hoveredRadiusValues4['Big'];
	} else if (((width4 + margin4.left + margin4.right) <= 500) && ((height4 + margin4.top + margin4.bottom) <= 400)){
		radius4 = radiusValues4['Small'];
		hoveredRadius4 = hoveredRadiusValues4['Small'];
	} 
	else {
		radius4 = radiusValues4['Medium'];
		hoveredRadius4 = hoveredRadiusValues4['Medium'];
	} 


	// Update the range of the scales with new width/height
	xScale4.range([0, width4]);
	yScale4.range([height4, 0]);

	// Update all the existing elements (gridlines, axis text, circles)
	gridXAxis4.scale(xScale4);
	gridYAxis4.scale(yScale4);

	container4.select('#gridY')
			.attr('transform', 'translate(0, '+height4+')')
			.call(gridXAxis4.tickSize(-height4 - 15, 0, 0));

	container4.select('#gridX')
			.call(gridYAxis4.tickSize(-width4, 0, 0));

	container4.select('.x.label')
	    .attr('x', width4)
	    .attr('y', height4 + 30);

	container4.select('.circles').selectAll('circle')
		.attr('cx', function(d) {return xScale4(d['Valence']);})
		.attr('cy', function(d) {return yScale4(d['Energy']);})
		.attr('r', radius4); 

	container4.select('.bestSongsCircles').selectAll('circle')
		.attr('cx', function(d) {return xScale4(d['Valence']);})
		.attr('cy', function(d) {return yScale4(d['Energy']);})
		.attr('r', radiusBestSongs4); 

	var mean_x = d3.mean(dataset4, function(d) { return +d['Valence']});
	var mean_y = d3.mean(dataset4, function(d) { return +d['Energy']});	

	container4.select('#mean_x_all')
	     	.attr('x1', function() { return xScale4(mean_x); })
	     	.attr('y1', function() { return yScale4(-0.01); })
	     	.attr('x2', function() { return xScale4(mean_x); })
	     	.attr('y2', function() { return yScale4(1.01); });

	container4.select('#mean_y_all')
     	.attr('x1', function() { return xScale4(-0.01); })
     	.attr('y1', function() { return yScale4(mean_y); })
     	.attr('x2', function() { return xScale4(1.01); })
     	.attr('y2', function() { return yScale4(mean_y); });

	for(var decade in decadeData){
		mean_x = d3.mean(decadeData[decade], function(d) { return +d['Valence']});
		mean_y = d3.mean(decadeData[decade], function(d) { return +d['Energy']});

		container4.select('#mean_x' + decade)
	     	.attr('x1', function() { return xScale4(mean_x); })
	     	.attr('y1', function() { return yScale4(-0.01); })
	     	.attr('x2', function() { return xScale4(mean_x); })
	     	.attr('y2', function() { return yScale4(1.01); });

		container4.select('#mean_y' + decade)
	     	.attr('x1', function() { return xScale4(-0.01); })
	     	.attr('y1', function() { return yScale4(mean_y); })
	     	.attr('x2', function() { return xScale4(1.01); })
	     	.attr('y2', function() { return yScale4(mean_y); });
	}

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

/* **************************************************** *
 *                 		   Main                         *
 * **************************************************** */

// Chart info
var margin4 = {top: 40, right: 40, bottom: 40, left: 40},
    width4 = parseInt(d3.select('#chart4').style('width')) - margin4.left - margin4.right,
    height4 = parseInt(d3.select('#chart4').style('height')) - margin4.top - margin4.bottom;

var svg4 = d3.select('#chart4')
		    .attr('width', width4 + margin4.left + margin4.right)
		    .attr('height', height4 + margin4.top + margin4.bottom);
		  
var container4 = svg4.select('g.chart-wrapper')
		    .attr('transform', 'translate(' + margin4.left + ',' + margin4.top + ')');

// Radius details
var radiusValues4 = {'Small': 2, 'Medium': 4, 'Big': 6};
var hoveredRadiusValues4 = {'Small': 22, 'Medium': 30, 'Big': 40};

var radiusBestSongsValues4 = {'Small': 12, 'Medium': 17, 'Big': 30};

var radius4 = null;
var hoveredRadius4 = null;
var radiusBestSongs4 = null;
if (((width4 + margin4.left + margin4.right) <= 500) && ((height4 + margin4.top + margin4.bottom) <= 400)){
	radius4 = radiusValues4['Small'];
	hoveredRadius4 = hoveredRadiusValues4['Small'];
	radiusBestSongs4 = radiusBestSongsValues4['Small'];
} 
else if(((width4 + margin4.left + margin4.right) >= 1500) && ((height4 + margin4.top + margin4.bottom) >= 700)){
	radiusBestSongs4 = radiusBestSongsValues4['Big'];
	radius4 = radiusValues4['Medium'];
	hoveredRadius4 = hoveredRadiusValues4['Medium'];
} 
else {
	radius4 = radiusValues4['Medium'];
	hoveredRadius4 = hoveredRadiusValues4['Medium'];
	radiusBestSongs4 = radiusBestSongsValues4['Medium'];
} 

// Scales
var xScale4 = null;
var yScale4 = null;
var radiusScale4 = null;

// Tooltip
var tip4 = null;

// Grid lines
var gridXAxis4 = null;
var gridYAxis4 = null;
var formatPercent4 = d3.format(".0%");

// Event handlers for the button-group
var decadeButtons = d3.select('#decadeSelector')
						.selectAll('label:not(.btn-all)');

decadeButtons.on('click', function(){ 
	var bestSongsButton = d3.select('#bestSongsButton');
	if(bestSongsButton.classed('active')){
		bestSongsButton.classed('active', false);
		container4.select('.circles')
					.selectAll('circle')
					.style('display', 'block');
		container4.select('.bestSongsCircles')
					.style('display', 'none')
					.selectAll('circle')
					.style('display', 'none');
	}

	d3.select('.btn-all').classed('active', false);
	d3.select('.averageLines')
			.selectAll('line.all').style('display', 'none');

	d3.selectAll('.band-img').classed('active-artist', false);
	d3.select('.circles')
			.selectAll('circle')
			.attr('r', radius4);

	d3.select(this).classed('inactive', false);

	if(d3.select(this).classed('active_bis')){
		d3.select(this).classed('active_bis', false);
	} else {
		d3.select(this).classed('active_bis', true);
	}
	
	d3.select('#decadeSelector').selectAll('label:not(.active_bis)').classed('inactive', true);
	
	decadeButtonsShowHideCircles();
	bestSongsButton.attr('disabled', true);
	
});

var allButton = d3.select('#decadeSelector')
						.select('.btn-all');

allButton.on('click', function(){ 
	var bestSongsButton = d3.select('#bestSongsButton');
	if(bestSongsButton.classed('active')){
		bestSongsButton.classed('active', false);
		container4.select('.circles')
					.selectAll('circle')
					.style('display', 'block');
		container4.select('.bestSongsCircles')
					.style('display', 'none')
					.selectAll('circle')
					.style('display', 'none');
	}

	decadeButtons.classed('inactive', false);
	decadeButtons.classed('active_bis', false);
	decadeButtons.classed('active', false);
	d3.select('.averageLines')
			.selectAll('line').style('display', 'none');	

	d3.selectAll('.band-img').classed('active-artist', false);
	d3.select('.circles')
			.selectAll('circle')
			.attr('r', radius4);

	if(d3.select(this).classed('active')){
		d3.select(this).classed('inactive', true);
		d3.select(this).classed('active', false);
		d3.select(this).classed('active_bis', false);
		d3.select('.circles')
			.selectAll('circle').style('opacity', 0);
		d3.select('.averageLines')
			.selectAll('line.all').style('display', 'none');
		bestSongsButton.attr('disabled', true);
	} else {
		d3.select(this).classed('inactive', false);
		d3.select(this).classed('active_bis', true);
		d3.select(this).classed('active', true);
		d3.select('.circles')
			.selectAll('circle').style('opacity', 1);
		d3.select('.averageLines')
			.selectAll('line.all').style('display', 'block');
		bestSongsButton.attr('disabled', null);
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
	var bestSongsButton = d3.select('#bestSongsButton');
	if(bestSongsButton.classed('active')){
		bestSongsButton.classed('active', false);
		container4.select('.circles')
					.selectAll('circle')
					.style('display', 'block');
		container4.select('.bestSongsCircles')
					.style('display', 'none')
					.selectAll('circle')
					.style('display', 'none');
	}

	var clickedID = d3.select(this).attr('id');
	if(d3.select(this).classed('active-artist')){
		d3.select(this).classed('active-artist', false);
		d3.select('.circles')
			.selectAll('circle')
			.attr('r', radius4);
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

			bestSongsButton.attr('disabled', null);	
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
					   .attr('r', radiusValues4['Big'])
					   .classed('tracksToDisplay', true)
					   .moveToFront();
		if(!d3.select('.btn-all').classed('active')){
			d3.select('#decadeSelector').selectAll('label:not(.active_bis)').each(function(){
				val = d3.select(this).select('input').node().value;
				d3.select('.circles').selectAll('circle.' + val).style('opacity', 0);
			});
		}
		bestSongsButton.attr('disabled', true);
	}	
});

// Best songs of all time logic
var bestSongsButton = d3.select('#bestSongsButton');
bestSongsButton.on('click', function(){
	if(bestSongsButton.classed('active')){
		bestSongsButton.classed('active', false);
		container4.select('.circles')
					.selectAll('circle')
					.style('display', 'block');
		container4.select('.bestSongsCircles')
					.style('display', 'none')
					.selectAll('circle')
					.style('display', 'none');
	} else {
		bestSongsButton.classed('active', true);
		container4.select('.circles')
					.selectAll('circle')
					.style('display', 'none');
		container4.select('.bestSongsCircles')
					.style('display', 'block')
					.selectAll('circle')
					.style('display', 'block');
	}
});

// Glyphicon
var playingIcon = container4.select('.circles')
						.append("svg:foreignObject")
							.attr("width", 20)
							.attr("height", 20)
							.attr("id", "playingIcon")
							.style('display', 'none');
playingIcon.append("xhtml:span")
		.attr("class", "control glyphicon glyphicon-volume-up");

var playIcon = container4.select('.circles')
						.append("svg:foreignObject")
							.attr("width", 20)
							.attr("height", 20)
							.attr("id", "playIcon")
							.style('display', 'none');
playIcon.append("xhtml:span")
		.attr("class", "control glyphicon glyphicon-play");

var pauseIcon = container4.select('.circles')
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
var dataset4 = [];
var decadeData = [];
createChart4();

