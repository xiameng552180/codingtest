var compsvg = vis.compsvg().size([940, 580]);
var compsvg1 = vis.compsvg1().size([940, 580]);
var compsvg2 = vis.compsvg2().size([940, 580]);


// layout UI and setup events
$(document).ready(function() {
	// init data list
	$.get("/list", function(d) {
		$("#dataset").empty();
		d = $.parseJSON(d);
		d.forEach(function(name) {
			$("#dataset").append(
				"<option>" + name + "</option>"
			);
		});
		display();
	});
	
	$("#tabs").tabs();
	$("#tablists").tabs();
	
	wire_events();
});

//////////////////////////////////////////////////////////////////////
// local functions
function wire_events() {
	// interaction interfaces (can be called by other components)
	compsvg.dispatch.on("select", function(d){
		console.log(d);
	})
	
};

function display() {
	// clean contents
	d3.select("#mainview").selectAll("*").remove();
	
	// load datasets
	var data = $('#dataset').val();
	if(!data || data == '') {
		return;
	}
	
	if (data == "level1")
	{
		compsvg.container(d3.select("#mainview").append("svg"));
		compsvg.render();
	}

	if(data == "level2"){
		compsvg1.container(d3.select("#mainview").append("svg"));
		compsvg1.render();
	}
	if(data == "level3"){
		compsvg2.container(d3.select("#mainview").append("svg"));
		compsvg2.render();
	}
	// compsvg.container(d3.select("#mainview").append("svg"));
	// var url = "data/" + data;
	// d3.json(url, function(error, d) {
	// 	if (error) {
	// 		console.log(error)
	// 		return;
	// 	}
	// 	compsvg.render();
	// 	// compsvg.data(d).layout().render();
	// });

    // var url_pro = '/data/procedures'
    // d3.csv(url_pro, function(error, d){
	//      if(error){
	// 		 console.log(error)
	// 		 return;
	// 	 }
	// 	 //console.log(d);
	// 	 compsvg.data(d);
	// })
};