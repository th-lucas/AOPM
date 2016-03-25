/* **************************************************** *
 *                 Private Functions                    *
 * **************************************************** */

 // Populates the dataset from a CSV file and creates the chart
 function createChart(){
 	var nbOfArtists = d3.select('#numberOfArtistsSelector')
						.selectAll('.active')
						.attr('data-val');

 	nbOfArtists = parseInt(nbOfArtists);

 	// Populates the dataset from a CSV file and creates
	d3.csv('billboard_data.csv', function(error, data) {
		if(error){ 
			throw error;
		}

		dataset = data.slice(0, nbOfArtists + 1).map(function(d, index) { 
			return {
				'Artist(s)': d['Artist(s)'],
				'Counts': +d['Counts'],
				'Rank': +d['Rank'],
				'Years of presence': +d['Years of presence'],
				'Image URL': d['Image URL'],
				'List of songs': JSON.parse('[' + d['List of songs'].split(',-,').toString() + ']')

			};
		});
		
		// Scales
		var countMax = d3.max(dataset, function(d) { return d['Counts']; });
		var countMin = d3.min(dataset, function(d) { return d['Counts']; });
		xScale = d3.scale.linear().domain([countMin - 2, countMax + 2]).range([0, width]);

		var yearsOfPresenceMax = d3.max(dataset, function(d) { return d['Years of presence']; });
		var yearsOfPresenceMin = d3.min(dataset, function(d) { return d['Years of presence']; });
		var lowerBound = (yearsOfPresenceMin > 2) ? yearsOfPresenceMin - 2 : 0;
		yScale = d3.scale.linear().domain([lowerBound, yearsOfPresenceMax + 2]).range([height, 0]);

		// Chart creation

		// Tooltip creation			
		createToolTip();
		// Axis label creation		
		createAxesLabels();
		// Gridlines creation
		createGridAxis();
		// Patterns creation
		updatePatterns(dataset);
		// Circles creation
		updateCircles(dataset);
		// Resize
		d3.select(window).on('resize', resize); 
		resize();	
	});
}

// Update loop which builds the patterns elements (used to display the artist images)
function updatePatterns(dataset) {
	var p = container
		.select('.defs')
		.selectAll('pattern')
		.data(dataset);  

	p.enter()
		.append('pattern')
		.attr('id', function(d) {return camelize(d['Artist(s)']) + '-img'})
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
function updateCircles(dataset) {
	var jitterIndex = 0; 
	dataset.sort(function(a,b) {
		if(a['Counts'] > b['Counts']){ 
			return 1;
		}
		else if(b['Counts'] > a['Counts']) {
			return -1;
		}
		else{
			if(a['Years of presence'] > b['Years of presence']) {
				return 1;
			}
			else if(b['Years of presence'] > a['Years of presence']){
				return -1;
			} 
			else {
				return 0;
			}
		}
	});

	var u = container
		.select('.circles')
		.selectAll('circle')
		.data(dataset);

	u.enter()
		.append('circle')
		.attr('class', function(d) {
			var allCircles = d3.selectAll('circle');
			var filteredCircles = allCircles.filter(function(x) {
				return (d['Counts'] == x['Counts']) && (d['Years of presence'] == x['Years of presence']);
			});

			if(filteredCircles[0].length > 1){
				return 'multipleArtists';
			} else {
				return 'singleArtist';
			}
		});

	u.exit().remove();

	u.attr('cx', function(d) {
			if(d3.select(this).classed('multipleArtists')){
				var x_jitter = Math.pow(-1, jitterIndex) * jitter - Math.pow(-1, jitterIndex) * (jitter / 2);
				jitterIndex++;
				return xScale(d['Counts']) + x_jitter;
			} else {
				return xScale(d['Counts']);
			}
		})
		.attr('cy', function(d) {return yScale(d['Years of presence']);})
		.attr('r', radius) //function(d) {return radiusScale(1/d['Rank']);})
		.style('stroke-width', '2px')
		.style('fill', function(d) {return 'url(#' + camelize(d['Artist(s)']) + '-img)';});

	u.on('mouseover', function(d) {
		var selectedCircle = d3.select(this);
		var allCircles = d3.selectAll('circle');

		// All other circles are faded out
		allCircles.filter(function(x) { return d['Artist(s)'] != x['Artist(s)']; })
		        .style('opacity', 0.2);				

		selectedCircle.transition()
			.duration(200)
			.attr('r', hoveredRadius)
			.each("end", function(d){ return tip.show(d, this); });

		selectedCircle.moveToFront();		
	});

	u.on('mouseout', function(d) {
		var selectedCircle = d3.select(this);
		
		var allCircles = d3.selectAll('circle')
						.style('opacity', 1);

		selectedCircle.attr('r', radius)
						.transition()
						.duration(200);
		
		selectedCircle.moveToBack();
		tip.hide(d);
			
	});

	u.on('click', function(d) {
		var selectedCircle = d3.select(this);
		
		var artistDetails = d3.select('div.artistDetails').style('display', 'block');

		artistDetails.select('.artistNameTitle')
			.text(d['Artist(s)']);

		artistDetails.select('.artistNameImage')
			.attr('src', d['Image URL']);

		// Select the artist table
		var artistTable = d3.select('.artistSongListDiv table');

		// Clear the table body
		artistTable.select('tbody').selectAll('tr').remove();

		var newTableRow = null;
		d['List of songs'].forEach(function(songObject, index){
			spotifyApi.searchTracks(d['Artist(s)'] + ' ' + songObject.title, {limit: 1})
				.then(function(data) {
					newTableRow = artistTable.select('tbody').append('tr')
							.attr('id', 'song-' + index)
							.attr('class', 'song-row');

					var previewUrl = data.tracks.items[0].preview_url;
					newTableRow.append('td')
						.text(songObject.title);
					newTableRow.append('td')
						.text(songObject.year);
					newTableRow.append('td')
						.text('#' + songObject.rank);
					var playerCell = newTableRow.append('td');
					var audioControls = playerCell.append('audio')
						.attr('controls', '')
						.attr('id', 'audio-' + index)
						.on('ended', function() {
					          d3.select(this).currentTime = 0;
					          d3.select('#playDisplayButton-' + index).classed('active', false);
					     });
					audioControls.append('source')
						.attr('src', previewUrl)
						.attr('type', 'audio/mpeg');
					audioControls.append('source')
						.attr('src', previewUrl)
						.attr('type', 'audio/ogg');
					playerCell.append('button')
						.attr('class', 'playDisplayButton')
						.attr('id', 'playDisplayButton-' + index)
						.on('click', function(){
							var selectedID = d3.select(this).attr('id').split('playDisplayButton-')[1];
							d3.selectAll('.playDisplayButton.active').each(function(){
								var idToPause = d3.select(this).attr('id').split('playDisplayButton-')[1];
								if(selectedID != idToPause){
									d3.select(this).classed('active', false);
									d3.select('#audio-' + idToPause)[0][0].pause();
								}
							});
							hasClass = d3.select(this).classed('active');
							d3.select(this).classed('active', !hasClass);
							if(hasClass){
								d3.select('#audio-' + index)[0][0].pause();
							} else {
								d3.select('#audio-' + index)[0][0].play();
							}
						});

					if(songObject.rank == 1){
						newTableRow.attr('class', 'success');
					}
				}, function(err) {
					newTableRow = artistTable.select('tbody').append('tr')
							.attr('id', 'song-' + index);
					newTableRow.append('td')
						.text(songObject.title);
					newTableRow.append('td')
						.text(songObject.year);
					newTableRow.append('td')
						.text('#' + songObject.rank);
					newTableRow.append('td');

					if(songObject.rank == 1){
						newTableRow.attr('class', 'success');
					}
			});
		});

		goToByScroll('artistDetails');
	});
}

// Axis label creation
function createAxesLabels() {
	container.select('.x.axis')
		.append('text')
	    .attr('class', 'x label')
	    .attr('text-anchor', 'end')
	    .attr('x', width)
	    .attr('y', height + 30)
	    .text('# of songs in the Billboard Hot 100 (year end)');

	 container.select('.y.axis')
		.append('text')
	    .attr('class', 'y label')
	    .attr('text-anchor', 'end')
	    .attr('y', -35)
	    .attr('dy', '.75em')
	    .attr('transform', 'rotate(-90)')
	    .text('# of years of presence in the Billboard Hot 100 (year end)');
}

// Grid lines creation
function createGridAxis() {
	// Define vertical grid lines
	gridXAxis = d3.svg.axis()
			.scale(xScale)
			.orient('bottom')
			.ticks(5);

	container.select('.grids')
		.append('g')         
		.attr('class', 'grid')
		.attr('id', 'gridY')
		.attr('transform', 'translate(0, '+height+')')
		.style('stroke-dasharray', ('2, 2'))
		.call(gridXAxis.tickSize(-height - 15, 0, 0));

	// Define horizontal grid lines
	gridYAxis = d3.svg.axis()
			.scale(yScale)
			.orient('left')
			.ticks(5);

	container.select('.grids')
		.append('g')         
		.attr('class', 'grid')
		.attr('id', 'gridX')
		.attr('transform', 'translate(0, 0)')
		.style('stroke-dasharray', ('2, 2'))
		.call(gridYAxis.tickSize(-width, 0, 0));
}

// Tooltip creation (uses the .tip() function from the d3-tip js library)
function createToolTip(){
	tip = d3.tip()
	    .attr('class', 'd3-tip')
	    .offset([-10, 0])
	    .html(function(d) {
			return "<div><span class='tooltipTitle'>" + d['Artist(s)']+ "</span></div>" +
			      "<div><span># Songs:</span> <span class='tooltipContents'>" + d['Counts']+ "</span></div>" +
			     "<div><span># Years:</span> <span class='tooltipContents'>" + d['Years of presence']+ "</span></div>";
		});

	container.call(tip);
}

// Resize function which makes the graph responsive
function resize() {
	// Find the new window dimensions 
    var width = parseInt(d3.select('#chart').style('width')) - margin.left - margin.right,
    	height = parseInt(d3.select('#chart').style('height')) - margin.top - margin.bottom;

    var xAxisText = xAxisValues['Medium'];
    var yAxisText = yAxisValues['Medium'];
    if((height + margin.top + margin.bottom) <= 370){
		yAxisText = yAxisValues['Small'];
	}
    if(((width + margin.left + margin.right) >= 1500) && ((height + margin.top + margin.bottom) >= 700)){
		radius = radiusValues['Big'];
		hoveredRadius = hoveredRadiusValues['Big'];
	} else if (((width + margin.left + margin.right) <= 500) && ((height + margin.top + margin.bottom) <= 400)){
		radius = radiusValues['Small'];
		hoveredRadius = hoveredRadiusValues['Small'];
		xAxisText = xAxisValues['Small'];
		yAxisText= yAxisValues['Small'];
	} 
	else {
		radius = radiusValues['Medium'];
		hoveredRadius = hoveredRadiusValues['Medium'];
	} 

	var jitterIndex = 0;

	// Update the range of the scales with new width/height
	xScale.range([0, width]);
	yScale.range([height, 0]);

	// Update all the existing elements (gridlines, axis text, circles)
	container.select('#gridY')
			.attr('transform', 'translate(0, '+height+')')
			.call(gridXAxis.tickSize(-height - 15, 0, 0));

	container.select('#gridX')
			.call(gridYAxis.tickSize(-width, 0, 0));

	container.select('.x.label')
	    .attr('x', width)
	    .attr('y', height + 30)
	    .text(xAxisText);

	container.select('.y.label')
	    .text(yAxisText);

	container.selectAll('circle')
		.attr('cx', function(d) {
			if(d3.select(this).classed('multipleArtists')){
				var x_jitter = Math.pow(-1, jitterIndex) * jitter - Math.pow(-1, jitterIndex) * (jitter / 2);
				jitterIndex++;
				return xScale(d['Counts']) + x_jitter;
			} else {
				return xScale(d['Counts']);
			}
		})
		.attr('cy', function(d) {return yScale(d['Years of presence']);})
		.attr('r', radius);
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


/* **************************************************** *
 *                 		   Main                         *
 * **************************************************** */

// Chart info
var margin = {top: 40, right: 40, bottom: 40, left: 40},
    width = parseInt(d3.select('#chart').style('width')) - margin.left - margin.right,
    height = parseInt(d3.select('#chart').style('height')) - margin.top - margin.bottom;

var svg = d3.select('#chart')
		    .attr('width', width + margin.left + margin.right)
		    .attr('height', height + margin.top + margin.bottom);
		  
var container = svg.select('g.chart-wrapper')
		    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Radius details
var radiusValues = {'Small': 12, 'Medium': 17, 'Big': 30};
var hoveredRadiusValues = {'Small': 22, 'Medium': 30, 'Big': 40};

var radius = null;
var hoveredRadius = null;
if(((width + margin.left + margin.right) >= 1500) && ((height + margin.top + margin.bottom) >= 700)){
	radius = radiusValues['Big'];
	hoveredRadius = hoveredRadiusValues['Big'];
} else if (((width + margin.left + margin.right) <= 500) && ((height + margin.top + margin.bottom) <= 400)){
	radius = radiusValues['Small'];
	hoveredRadius = hoveredRadiusValues['Small'];
} 
else {
	radius = radiusValues['Medium'];
	hoveredRadius = hoveredRadiusValues['Medium'];
} 

var jitter = 10;

// Scales
var xScale = null;
var yScale = null;
var radiusScale = null;

// Tooltip
var tip = null;

// Grid lines
var gridXAxis = null;
var gridYAxis = null;

// Axis details
var xAxisValues = {'Small': '# of songs', 'Medium': '# of songs in the Billboard Hot 100 (year end)'};
var yAxisValues = {'Small': '# of years', 'Medium': '# of years of presence in the Billboard Hot 100 (year end)'};


// Event handlers for the button-group
var grouppedButtons = d3.select('#numberOfArtistsSelector')
						.selectAll('.btn');

grouppedButtons.on('click', function(){ 
	grouppedButtons.classed('active', false);
	
	d3.select(this).classed('active', true);
	clearGraph();
	createChart();
});

// Close button for the artist details area
d3.select('.close').on('click', function(){
	goToByScroll('chart'); 
	d3.select('.artistDetails').style('display', 'none'); 
});

// Instantiate Spotify wrapper
var spotifyApi = new SpotifyWebApi();

// Dataset init and chart creation
var dataset = [];
createChart();