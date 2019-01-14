vis.compsvg1 = function() {

	var compsvg1 = {},
		container = null,
		flag = false;
		data = {},
		size = [940, 580],
	 	margin = {left:80, top:50, right:50, bottom:80},
		dispatch = d3.dispatch("select", "mouseover", "mouseout");

	compsvg1.container = function(_) {
		if (!arguments.length) return container;
		container = _;
		return compsvg1;
	};

	compsvg1.data = function(_) {
		if (!arguments.length) return data;
		data = _;
		return compsvg1;
	};

	compsvg1.size = function(_) {
		if (!arguments.length) return size;
		size = _;
		return compsvg1;
	};

	compsvg1.margin = function(_) {
		if (!arguments.length) return margin;
		margin = _;
		return compsvg1;
	};

	compsvg1.dispatch = dispatch;

	///////////////////////////////////////////////////
	// Private Parameters

	var trans = [0,0],
		scale = 1,
		zoom = d3.zoom().on("zoom", function() {
            scale = d3.event.scale;
            trans = d3.event.translate;
            container
            	.select(".svg")
				.attr("transform", d3.event.transform)
        });

	///////////////////////////////////////////////////
	// Public Function
	compsvg1.render = function() {

		if(!container) {
			return;
		}

		container.attr("width", size[0]).attr("height", size[1]);

		container.selectAll(".svg, .backrect, defs").remove();

		// initiate a zooming pannel
		container.append("rect")
			.attr("class", "backrect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", size[0])
			.attr("height", size[1])
			.attr("fill", 'lightgrey')
			.on('dblclick', function(d){
				   container.select(".svg")
					.attr("transform", d3.event.transform)
			})
			.call(zoom).on("dblclick", null);

		// create the rendering pannel
		container.append("g")
			.attr("class", "svg")
			.attr("transform", "translate(" + (margin.left + trans[0]) + "," + (margin.top + trans[1]) + ") scale(" + scale + ")");

		return compsvg1.update();
	};
 
	// calculate data and draw the view
	compsvg1.update = function() {

		//read data
        var url_pro = '/data/level1'
        d3.csv(url_pro, function(error,testdata){
		//console.log(testdata);
		data = testdata;
            if(error){
                console.log(error);
                return;
				};

		// calculate the max and min temperature value of each month
		var monthdata_min = [];
		var yeardata_min = [];
		var monthdata_max = [];
		var yeardata_max = [];
		var monthdata = []; 
		var yeardata = [];
		var daydata = [];
		var year_label = [];
		var month_label = ["January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		var tempmin = [];
		var tempmax = [];
		var linedata = [];
		var curyear = data[0]["date"].split("-")[0];
		var curmonth = data[0]["date"].split("-")[1];
		var curday = 0;

		year_label.push(curyear);

		function check_add(day)
		{
			// console.log("day:" + day)
			// console.log("curday:" + curday)
			delta = day - curday;
			
			
			if(delta >= 2)
			{	
				for(var p = 0; p < delta; p++)
				{
					temp_daydata = {};
					temp_daydata["year"] = year;
					temp_daydata["month"] = month;
					temp_daydata["day"] = curday + p;
					temp_daydata["min"] = parseInt(data[i]["min_temperature"]);
					temp_daydata["max"] = parseInt(data[i]["max_temperature"]);
					daydata.push(temp_daydata);
				}
			}
			else
			{
				temp_daydata = {};
				temp_daydata["year"] = year;
				temp_daydata["month"] = month;
				temp_daydata["day"] = day;
				temp_daydata["min"] = parseInt(data[i]["min_temperature"]);
				temp_daydata["max"] = parseInt(data[i]["max_temperature"]);	
				daydata.push(temp_daydata);
			}
			curday = day;
		}

		for(var i = 0; i < data.length; i++)
		{
			year = data[i]['date'].split("-")[0];
			month = data[i]['date'].split("-")[1];
			day = parseInt(data[i]['date'].split("-")[2]);
			if(year == curyear)
			{
				if(month == curmonth)
				{
					tempmin.push(data[i]["min_temperature"]);
					tempmax.push(data[i]["max_temperature"]);
                    check_add(day);
				}
				else
				{
					var min = Math.min.apply(null, tempmin);
					var max = Math.max.apply(null, tempmax);
					monthdata_min.push(min);
					monthdata_max.push(max);
					tempmin = [];
					tempmax = [];
					tempmin.push(data[i]["min_temperature"]);
					tempmax.push(data[i]["max_temperature"]);
					curmonth = month;

					monthdata.push(daydata);
					daydata = [];
					curday = 0;
					check_add(day, curday);
					
				}

			}
			else
			{
					var min = Math.min.apply(null, tempmin);
					var max = Math.max.apply(null, tempmax);
					monthdata_min.push(min);
					monthdata_max.push(max);
					tempmin = [];
					tempmax = [];
					curmonth = month;
					monthdata.push(daydata);

					daydata = [];
					curday = 0;
					check_add(day);
					
				yeardata_min.push(monthdata_min);
				yeardata_max.push(monthdata_max);
				yeardata.push(monthdata);
				monthdata = [];
			
				monthdata_min = [];
				monthdata_max = [];
				curyear = year;	
				year_label.push(curyear);
			}
		}
			var min = Math.min.apply(null, tempmin);
			var max = Math.max.apply(null, tempmax);
			monthdata_min.push(min);
			monthdata_max.push(max);
			monthdata.push(daydata)
		    
		    yeardata_min.push(monthdata_min);
			yeardata_max.push(monthdata_max);
			yeardata.push(monthdata);
		
        draw = []
		for(var i = 0; i < yeardata_min.length; i++)
			for(var j = 0; j < yeardata_min[0].length; j++)
			 	{
					temp = {};
					temp['year'] = i;
					temp['month'] = j;
					temp['min'] = yeardata_min[i][j];
					temp['max'] = yeardata_max[i][j];
					temp['date'] = year_label[i] + "-" + ( "0000000000000000" + (j+1) ).substr( -2);
					draw.push(temp);
				}
		         
		//darw axis
		var svg = container.select(".svg");
		var width = size[0] - margin.left - margin.right;
		var height = size[1] - margin.top- margin.bottom;
		var gridwidth = Math.floor(width/year_label.length);
		var gridheight = Math.floor(height/month_label.length);

		var yScale = d3.scaleBand()
					   .domain(month_label)
					   .range([0, height]);

		var yAxis = d3.axisLeft()
					  .scale(yScale);

		var xScale = d3.scaleBand()
					  .domain(year_label)
					  .range([0, width]);

	    var xAxis = d3.axisTop()
					 .scale(xScale);

		svg.append("g")
		   .attr("class", "axis")
		   .call(yAxis);

		   svg.append("g")
		   .attr("class", "axis")
		   .call(xAxis);

     //draw tootip
		var div = d3.select("#mainview")
		.append("div")
		.attr("class", "tooltip")
		.style("opacity", 0)	

	// draw rectangle
		var delta_x = 5;
		var delta_y = 3;
		// var colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4"];
		var colors = ["#5e4fa2", "#3288bd","#66c2a5","#abdda4", "#e6f598","#fee08b","#fdae61","#f46d43","#d53e4f","#9e0142"];
		var colorScale = d3.scaleQuantile()
						//    .domain([d3.min(yeardata_min.flat()), d3.max(yeardata_max.flat())])
						.domain([0, 40])
						   .range(colors);

		var rects = svg.selectAll(".Rect")
					   .data(draw)

		rects.enter()
		.append("rect")
		.attr("x", function(d){
			return delta_x + d.year * gridwidth;
		})
		.attr("y", function(d){
			return delta_y +  d.month * gridheight;
		})
		.attr("width", gridwidth-delta_x)
		.attr("height", gridheight-delta_y)
		.style("fill", function(d){
			if(!flag)
			return colorScale(d.min);
			else
			return colorScale(d.max);
		})
		.attr("rx", 4)
		.attr("ry", 4)
		.attr("class", "rect")
		.on('click', function(d){
			compsvg1.update();
			flag = !flag;
		})
		.on("mouseover", function(d){
			div.transition()
			.duration(20)
			.style("opacity", 0.9);

			div.html("Data:" + d.date + ", min:" + d.min + ", max:" + d.max)
			.style("left", (d3.event.pageX) + "px")
			.style("top", (d3.event.pageY) + "px");
		})
		.on("mouseout", function(d){
			div.transition(100)
			.style("opacity", 0)
		})
       
		//draw legend
		var legendelement_width = gridwidth
		var legend = svg.selectAll(".legned")
						.data([0].concat(colorScale.quantiles()), function(d){ return d;})
		
		legend.enter().append("g")
			  .append("rect")
		      .attr("x", function(d, i){
				  return legendelement_width*i;
			  })
			  .attr("y", height + gridheight/2)
			  .attr("width", legendelement_width)
			  .attr("height", gridheight/2)
			  .style("fill", function(d, i){
				  return colors[i];
			  })
			  
		legend.enter().append("g")
		      .append("text")
			  .attr("class", "mono")
			  .attr("x", function(d,i){
				  return legendelement_width * i;
			  })
			  .attr("y", height + gridheight*1.5)
              .attr("dy", ".35em")
			  .text(function(d){
				  return ">= " + Math.round(d); 
			  })


		//draw line chart
		// console.log(yeardata)
        //set the ranges
		// maxday = Math.max.apply(Math, yeardata[0][0].map(function(d){return d.day;}))
		maxday = 31;
		maxvalue = 40; 
		var x = d3.scaleLinear().domain([0, maxday]).range([0, gridwidth-delta_x])
		var y = d3.scaleLinear().domain([0, maxvalue]).range([gridheight-delta_y,0])

		// console.log(maxday)
		// console.log(maxvalue)
		// console.log(x(yeardata[0][0][0]["day"]))
		// console.log(y(yeardata[0][0][0]["min"]))
		function draw_line(i, j)
		{
			//define the line
			var line = d3.line()
						.x(function(d){return x(d.day)})
						.y(function(d){return y(d.min)});
            var line1 = d3.line()
						.x(function(d){return x(d.day)})
						.y(function(d){return y(d.max)});
			//define lines
			var lines = svg.append("g")
			.attr("transform", "translate(" + (i * gridwidth+delta_x) + "," + (j * gridheight + delta_y) + ")")
						.datum(yeardata[i][j])
						.append("path")
						.style("fill", "none")
						.attr("stroke-width", 2)
						.attr("stroke", "lightsteelblue")
						.attr("d", function(d){
							// console.log(line(d))
							return line(d);
						})

			var lines1 = svg.append("g")
			.attr("transform", "translate(" + (i * gridwidth + delta_x)+ "," + j * gridheight + ")")
						.datum(yeardata[i][j])
						.append("path")
						.style("fill", "none")
						.attr("stroke-width", 2)
						.attr("stroke", "green")
						.attr("d", function(d){
							// console.log(line(d))
							return line1(d);
						})
			}		 


		for(var i = 0; i < 10; i++)
			  for(var j = 0; j < 12; j++)
			  {
				  draw_line(i, j);
			  }
	
		});
		
	};

	

	  
	///////////////////////////////////////////////////
	// Private Functions

	function private_function1() {

	};

	function private_function2() {

	};

	function private_function3() {

	};

	return compsvg1;
};


