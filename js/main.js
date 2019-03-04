require([
	"esri/Map",
	"esri/views/MapView",
	"esri/layers/FeatureLayer",
	"esri/layers/GraphicsLayer",
	"esri/widgets/Locate",
	"esri/widgets/Home",
	"esri/geometry/Circle",
	"esri/Graphic",
	"esri/tasks/QueryTask",
	"esri/tasks/support/Query",
	"dojo/on"
], function(Map, MapView, FeatureLayer, GraphicsLayer, Locate, Home, Circle, Graphic, QueryTask, QueryParameters, on) {

	var hospital_url = "https://services1.arcgis.com/Hp6G80Pky0om7QvQ/ArcGIS/rest/services/Hospitals/FeatureServer";

	var template = { // autocasts as new PopupTemplate()
		title: "{Name}",
		content: [{
		  type: "fields",
		  fieldInfos: [{
		    fieldName: "Website",
		    label: "Website",
		    visible: true,
		  }, {
		    fieldName: "Type",
		    label: "Hospital Type",
		    visible: true,
		  }, {
		    fieldName: "Telephone",
		    label: "Telephone",
		    visible: true
		  }, {
		    fieldName: "Address",
		    label: "Address",
		    visible: true,
		  }, {
		    fieldName: "City",
		    label: "City",
		    visible: true,
		  }, {
		    fieldName: "State",
		    label: "State",
		    visible: true,
		  }, {
		    fieldName: "ZIP",
		    label: "Zip Code",
		    visible: true,
		  }, {
		    fieldName: "Beds",
		    label: "Beds Available",
		    visible: true,
		  }, {
		    fieldName: "ALT_NAME",
		    label: "Alternate Name",
		    visible: true,
		  }, {
		    fieldName: "Status",
		    label: "Operational Status",
		    visible: true,
		  }, {
		    fieldName: "Latitude",
		    label: "Latitude",
		    visible: true,
		  }, {
		    fieldName: "Longitude",
		    label: "Longitude",
		    visible: true,
		  }]
		}]
	};

    var symbol = {
      type: "simple-fill",
      // size: 48,
      outline: {
      	color: "red",
      	width: 3
      }
    };

    var queryTask = new QueryTask({
    	url: "https://services1.arcgis.com/Hp6G80Pky0om7QvQ/ArcGIS/rest/services/Hospitals/FeatureServer/0"
    });

    var queryParams = new QueryParameters({
    	where: "1=1",
    	returnGeometry: true,
    	outFields: ["*"],
    	units: "miles"
    });

	var feature_layer = new FeatureLayer({
		url: hospital_url,
		outFields: ["*"],
		popupTemplate: template,
		visible: true,
		minScale: 60000
		// definitionExpression: "ID < 10"
	});

	var display_layer = new GraphicsLayer();

	var map = new Map({
		basemap: "streets",
		layers: [feature_layer, display_layer]
	});

	var view = new MapView({
		container: "viewDiv",
		map: map,
		zoom: 5,
		center: [-95, 40]
	});

	// Locate Me Widget
	var locate_me = new Locate({
		view: view
	});
	view.ui.add(locate_me, "top-left");

	// Home Extent Widget
	var tree_home_extent = new Home({
		view: view
	});
	// Appending the widget
	view.ui.add(tree_home_extent, "top-left");

	var create_graphics_list = function(feature_points) {
		var graphic_points = [];
		for (var i = 0; i < feature_points.length; i++) {
			var new_graphic = new Graphic({
				attributes: {
					"id": feature_points[i].attributes.ID
				},
				geometry: feature_points[i].geometry,
				symbol: {
					type: "simple-marker",
					color: "black",
					size: 10,
					outline: {
						color: "black",
						width: 0 // Set to zero to hide outline
					}
				}
			});
			graphic_points.push(new_graphic);
		}
		return graphic_points;
	};

	var display_hospitals = function(queryparams) {
		queryTask.execute(queryparams).then(function(response){
			if (response.features.length == 0){
				alert("No hospitals within "+radius+" miles from the selected point");
			} else {
				var hospitals = create_graphics_list(response.features)
				display_layer.addMany(hospitals);
			}
		});
	};

	var radius = 0;
	$("#radius").change(function(){
		radius = $(this).val();
		if (radius == ""){
			radius = 0;
		} else {
			radius = parseInt(radius);
		}
	});

	var view_listener = on.pausable(view, "click", function(evt){
      	var graphic = new Graphic({
        	geometry: new Circle({//circle constructor
          	center: evt.mapPoint,//pass the pointer-down event X Y as a starting point
            radius: radius,
            radiusUnit: "miles"
          }),
          symbol: {//circle design
          	type: "simple-fill",
            color: [135,206,250,0.4],
            outline:{
            	color:"darkblue",
              width: 1
            }
          }
        });
		display_layer.removeAll();
		display_layer.add(graphic);
		queryParams.geometry = graphic.geometry;
		display_hospitals(queryParams);
	});

	$("#search").on("click", function(){
		if ($("#search").html() === "Search Hospitals") {
			view_listener.resume();
			$("#search").html("See Details");
		} else if ($("#search").html() === "See Details") {
			view_listener.pause();
			$("#search").html("Search Hospitals");
		}
	});

});