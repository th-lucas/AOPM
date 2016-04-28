/* **************************************************** *
 *                 Private Functions                    *
 * **************************************************** */

 // Populates the dataset from a CSV file and creates the chart
 function createChart4(){
 	/*var nbOfArtists = d3.select('#numberOfArtistsSelector')
						.selectAll('.active')
						.attr('data-val');

 	nbOfArtists = parseInt(nbOfArtists);

 	valueToDisplay = d3.select('#hotttnessOrFamiliaritySelector')
						.selectAll('.active')
						.attr('data-val');
	setXValues(valueToDisplay);*/

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
		// Resize
		d3.select(window).on('resize', resize4); 
		resize4();
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

	var decadeData = [];	

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

        	var matches = d['Artist(s)'].match(/.*(rihanna|eminem|mariah carey|madonna|elton john|the beatles).*/i);
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
		//.style('stroke', '#656D78');

	u.on('mouseover', function(d) {
		var selectedCircle = d3.select(this);
		if(selectedCircle.classed('tracksToDisplay')){				

			selectedCircle.transition()
				.duration(200)
				.attr('r', hoveredRadius4)
				.each("end", function(d){ return tip.show(d, this); });

			selectedCircle.moveToFront();
		}
	});

	u.on('mouseout', function(d) {
		var selectedCircle = d3.select(this);
		if(selectedCircle.classed('tracksToDisplay')){		

			selectedCircle.attr('r', radiusValues4['Big'])
							.transition()
							.duration(200);
			
			tip.hide(d);
		}		
	});

	u.on('click', function(d) {
		var selectedCircle = d3.select(this);
		if(selectedCircle.classed('tracksToDisplay')){	
			spotifyApi.searchTracks(d['Lead Artist(s)'] + ' ' + d['Title'] , {limit: 1})
				.then(function(data) {
					var previousUrl = d3.select('#audio-player')
										.select('source.mpeg')
										.attr('src');

					var previewUrl = data.tracks.items[0].preview_url;

					if(previousUrl != previewUrl){
						d3.select('#audio-player')
							.selectAll('source').attr('src', previewUrl);

						d3.select('#audio-player')[0][0].load();
						d3.select('#audio-player')[0][0].play();
						selectedCircle.classed('playing', true);
					} else {
						var hasClass = d3.select('#audio-player').classed('active');
						d3.select('#audio-player').classed('active', !hasClass);

						if(hasClass){
							d3.select('#audio-player')[0][0].pause();
						} else {
							d3.select('#audio-player')[0][0].play();
						}
					}
				});
		}
	});

	/*u.on('click', function(d) {
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
	});*/
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
			.tickFormat(formatPercent4)
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
			.tickFormat(formatPercent4)
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
	tip = d3.tip()
	    .attr('class', 'd3-tip')
	    .offset([-10, 0])
	    .html(function(d) {
			return "<div><span class='tooltipTitle'>" + d['Artist(s)']+ "</span></div>" +
			      "<div><span>Track:</span> <span class='tooltipContents'>" + d['Title']+ "</span></div>" +
			     "<div><span>Year:</span> <span class='tooltipContents'>" + d['Year']+ "</span></div>" + 
			     "<div><span>Valence:</span> <span class='tooltipContents'>" + d['Valence']+ "</span></div>" +
			     "<div><span>Energy:</span> <span class='tooltipContents'>" + d['Energy']+ "</span></div>";
		});

	container4.call(tip);
}

// Resize function which makes the graph responsive
function resize4() {
	/*valueToDisplay = d3.select('#hotttnessOrFamiliaritySelector')
						.selectAll('.active')
						.attr('data-val');
	setXValues(valueToDisplay);*/

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

	//var jitterIndex = 0;

	// Update the range of the scales with new width/height
	/*var xMax = d3.max(dataset, function(d) { return d[valueToDisplay]; });
	var xMin = d3.min(dataset, function(d) { return d[valueToDisplay]; });
	xScale = d3.scale.linear().domain([xMin - 0.02, xMax + 0.02]).range([0, width]);
	yScale.range([height, 0]);*/

	// Update all the existing elements (gridlines, axis text, circles)
	gridXAxis4.scale(xScale4);
	gridYAxis4.scale(yScale4);

	container4.select('#gridY4')
			.attr('transform', 'translate(0, '+height4+')')
			.call(gridXAxis4.tickSize(-height4 - 15, 0, 0));

	container4.select('#gridX4')
			.call(gridYAxis4.tickSize(-width4, 0, 0));

	container4.select('.x.label')
	    .attr('x', width4)
	    .attr('y', height4 + 30);

	container4.select('.y.label');

	/* container4.selectAll('circle')
		.transition()
		.duration(1000)
		.attr('cx', function(d) {
			if(d3.select(this).classed('multipleArtists')){
				var x_jitter = Math.pow(-1, jitterIndex) * jitter - Math.pow(-1, jitterIndex) * (jitter / 2);
				jitterIndex++;
				return xScale(d[valueToDisplay]) + x_jitter;
			} else {
				return xScale(d[valueToDisplay]);
			}
		})
		.attr('cy', function(d) {return yScale(d['Dominance Max'].value);})
		.attr('r', radius);*/
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

var radius4 = null;
var hoveredRadius4 = null;
if(((width4 + margin4.left + margin4.right) >= 1500) && ((height4 + margin4.top + margin4.bottom) >= 700)){
	radius4 = radiusValues4['Big'];
	hoveredRadius4 = hoveredRadiusValues4['Big'];
} else if (((width4 + margin4.left + margin4.right) <= 500) && ((height4 + margin4.top + margin4.bottom) <= 400)){
	radius4 = radiusValues4['Small'];
	hoveredRadius4 = hoveredRadiusValues4['Small'];
} 
else {
	radius4 = radiusValues4['Medium'];
	hoveredRadius4 = hoveredRadiusValues4['Medium'];
} 

//var jitter = 10;

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
			.attr('r', radius4);

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
	}	
});




// Close button for the artist details area
/*d3.select('.close').on('click', function(){
	goToByScroll('chart'); 
	d3.select('.artistDetails').style('display', 'none'); 
});

// Slider 
var sliderDateRange = new Slider('#dateRangeSlider');
var dateRange = sliderDateRange.getValue();

sliderDateRange.on('slideStop', function(){
	dateRange = sliderDateRange.getValue();
	clearGraph();
	createChart();
});
*/
// Instantiate Spotify wrapper
var spotifyApi = new SpotifyWebApi();

// Dataset init and chart creation
var dataset4 = [];
createChart4();

