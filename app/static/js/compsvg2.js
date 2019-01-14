vis.compsvg2 = function() {

	var compsvg2 = {},
		container = null,
		flag = false;
		data = {},
		size = [940, 580],
	 	margin = {left:80, top:50, right:50, bottom:80},
		dispatch = d3.dispatch("select", "mouseover", "mouseout");

	compsvg2.container = function(_) {
		if (!arguments.length) return container;
		container = _;
		return compsvg2;
	};

	compsvg2.data = function(_) {
		if (!arguments.length) return data;
		data = _;
		return compsvg2;
	};

	compsvg2.size = function(_) {
		if (!arguments.length) return size;
		size = _;
		return compsvg2;
	};

	compsvg2.margin = function(_) {
		if (!arguments.length) return margin;
		margin = _;
		return compsvg2;
	};

	compsvg2.dispatch = dispatch;

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
	compsvg2.render = function() {

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

		return compsvg2.update();
	};
 
	// calculate data and draw the view
	compsvg2.update = function() {

		//read data
        var url_pro = '/data/level3'
       d3.json(url_pro, function(error, data) {
		if (error) {
			console.log(error)
			return;
		}

		// console.log(data);
		//Filter other departments except CSE
	    function is_cse(element, index, array){
			return element.dept=="CSE";
		}
		var csenodes = data.nodes.filter(is_cse);
		// console.log(csenodes);
		for(var i = 0; i < csenodes.length; i++){
			csenodes[i]['size'] = 0;
		}
		var edges = [];
		var max_weight = 0;
		
		var x = 0;
		var y;

		for(var i = 0; i < data.edges.length; i++){
		    flag = false;
			temp = {};

			for(var j = 0; j < csenodes.length; j++)
			{
				if(data.edges[i]['source'] == csenodes[j]['id'])
				{
					temp["source"] = j;
					flag = true;
					break;
			    }
			}

			for(var j = 0; j < csenodes.length; j++)
			{
				if(data.edges[i]['target'] == csenodes[j]['id'] && flag == true)
				{
					csenodes[temp['source']]['size'] = csenodes[temp['source']]['size'] + 1;
					temp["target"] = j;
					temp['value'] = data.edges[i]['publications'].length;
			 		if(temp["value"] > max_weight)
                 	{
					 	max_weight = temp["value"];
					 }
					 var temp1 = [];
					 temp1["source"] = temp["target"]
					 temp1["target"] = temp["source"]
					 temp1["value"] = temp["value"]
					 edges.push(temp);
					 edges.push(temp1);
				 	break;
				}
				
			}
		}
		//   console.log(edges);
		 
		var svg = container.select(".svg");
		var width = size[0] - margin.left - margin.right;
		var height = size[1] - margin.top - margin.bottom;
		var graphwidth = 50;
		var graphheight = 500;
		var simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function(d) { return d.index }))
            .force("collide",d3.forceCollide( function(d){return d.size}).iterations(16) )
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(graphwidth / 2, graphheight / 2))
            .force("y", d3.forceY(0))
			.force("x", d3.forceX(0))

		var link = svg.append('g')
		           .attr('class', 'line')
		            .selectAll('line')
					.data(edges)
					.enter()
					.append('line')
					.attr('stroke-width', 1)
					.attr('stroke', '#111')

		var color = d3.scaleOrdinal(d3.schemeCategory20);

        var node = svg.append('g')
		            .attr('class', 'nodes')
		            .selectAll("circle")
					.data(csenodes)
					.enter()
					.append('circle')
					.attr('id', function(d, i){
						return "c" + d.id;
					})
					.attr('r', function(d){ return (d.size) })
					.attr('fill', function(d, i){ return color(5)})
					.on("mouseover", function(d, i){
						d3.select(this).style("fill", "red");
						var s = '.r' + d.id
						d3.selectAll(s).style('fill','red');
						var l = '.l' + d.id
						d3.selectAll(l).style('fill','red');
					})
					.on("mouseout", function(d, i){
						d3.select(this).style('fill', function(d, i){ return color(5)})
						var s = '.r' + d.id
						d3.selectAll(s).style('fill','green');
						var l = '.l' + d.id
						d3.selectAll(l).style('fill','green');
					})

		

		var ticked = function(){
		node
			.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; });
		link
			.attr("x1", function(d) { //console.log(d.source.x);
				 return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });

		}
		simulation.nodes(csenodes)
					.on("tick", ticked)
					
		simulation.force("link")
					.links(edges);

		

      var draw = function(){
		const adjacencyMatrix = d3.adjacencyMatrixLayout();
		
		adjacencyMatrix.size([450, 450])
					.nodes(csenodes)
					.links(edges)
					.nodeID(d=>d.fullname);

		const matrixData = adjacencyMatrix();

		// console.log(matrixData);
		var matrix = svg.append('g')
						.attr('transform', 'translate(320,60)')
						.attr('id', 'adjacencyG')
						.selectAll('rect')
						.data(matrixData)
						.enter()
						.append('rect')
						.attr('class', function(d, i){
							return (("r" + d.source['id']) + " "+("l" + d.target['id']));
						})
						.attr('width', d=>d.width)
						.attr('height', d=>d.height)
						.attr('x', d=>d.x)
						.attr('y', d=>d.y)
						.style('stroke', 'black')
						.style('stroke-width', '1px')
						.style('stroke-opacity', .1)
						.style('fill', "green")
						.style('fill-opacity', d=>d.weight * 1.0/max_weight)
		                .on('mouseover', function(d, i){
							d3.select(this).style('fill','red');
							var s = d.source["id"];
							var t = d.target["id"];
							d3.select('#c'+s).style('fill','red');
							d3.select('#c'+t).style('fill', 'red');
						})
						.on("mouseout", function(d, i){
							d3.select(this).style('fill', "green");
							var s = d.source["id"];
							var t = d.target["id"];
							d3.select('#c'+s).style('fill', function(d, i){ return color(5)});
							d3.select('#c'+t).style('fill', function(d, i){ return color(5)});
						})

					d3.select('#adjacencyG')
					.call(adjacencyMatrix.xAxis);

					d3.select('#adjacencyG')
					.call(adjacencyMatrix.yAxis);
				}

				draw();
		var button = svg.append('g')
						.attr('transform', 'translate(200,60)')
						.append('rect')
						.attr('width', "50px")
						.attr('height', "10px")
						.style("fill", "blue")
						.on("click", function(){
							var compare = function(a, b){
								var va = a["size"],
								    vb = b["size"];
						        return va - vb;
							}
							csenodes.sort(compare);
							d3.select('#adjacencyG').remove();
							draw();

						})
						
		var text = svg.append("text")
		                .attr('transform', 'translate(200,60)')
						.text("Sort")
						.attr("x",0)
    					.attr('y',0)
					    .attr('text-anchor',"left")
						.attr('dy','.50em')
						.style("fill", "yellow");
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

	return compsvg2;
};


