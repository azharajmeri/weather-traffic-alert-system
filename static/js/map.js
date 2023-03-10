let current_location_coordinates;
let map;
let url_osrm_route = 'https://router.project-osrm.org/route/v1/driving/';
// let url_osrm_route = 'https://routing.openstreetmap.de/routed-bike/route/v1/driving/';  // Routing option 2
let url_osrm_map_route = '//router.project-osrm.org/route/v1/driving/';
let olview;
let source_location;
let destination_location;
let source_location_marker;
let destination_location_marker;
let map_route;
let msg_el = $("#error_message");


function getLocation() {
    if (navigator.geolocation) {
        return navigator.geolocation.getCurrentPosition(showPosition, showError);
    }
}

function showPosition(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    current_location_coordinates = [lon, lat];
    create_map(utils.to3857([lon, lat]));
    utils.create_current_location_marker([lon, lat]);
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            break;
        case error.POSITION_UNAVAILABLE:
            break;
        case error.TIMEOUT:
            break;
        case error.UNKNOWN_ERROR:
            break;
    }
    create_map([8078795.833261827, 2632691.5825704993]);
}

let vectorSource = new ol.source.Vector(),
    vectorLayer = new ol.layer.Vector({
        source: vectorSource
    }),
    styles = {
        route: new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 6, color: [60, 223, 225, 1]
            })
        }),
        traffic_route: new ol.style.Style({
            stroke: new ol.style.Stroke({
                width: 6, color: [255, 0, 0, 0.8]
            })
        }),
        icon: new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                src: icon_url
            })
        }),
        source_icon: new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                src: source_icon_url
            })
        }),
        my_current_location_icon: new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                src: current_location_icon
            })
        }),
        geoMarker: new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                src: current_location_icon
            })
        }),

        sun: new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                src: sun
            })
        }),
        cloudy: new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                src: cloudy
            })
        }),
        fog: new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                src: fog
            })
        }),
        wind: new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                src: wind
            })
        }),
        rain: new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                src: rain
            })
        }),
        snow: new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                src: snow
            })
        }),
        storm: new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                src: storm
            })
        }),
    };

function create_map(map_center) {
    olview = new ol.View({
        center: map_center,
        zoom: 15
    });

    map = new ol.Map({
        target: 'map',
        view: olview,
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            vectorLayer
        ],
    });

    map.on('click', function (evt) {
        let coord4326 = utils.to4326(evt.coordinate);
        // utils.createFeature(coord4326);
        console.log(coord4326)
    });
}

let utils = {
    createFeature: function (coord) {
        let feature = new ol.Feature({
            type: 'place',
            geometry: new ol.geom.Point(ol.proj.fromLonLat(coord))
        });
        feature.setStyle(styles.icon);
        vectorSource.clear();
        vectorSource.addFeature(feature);
        utils.create_current_location_marker(current_location_coordinates);
    },
    createRoute: function () {
        //get the route
        var source = source_location.join();
        var destination = destination_location.join();
        set_map_route()
        features = []

        fetch("https://api.tomtom.com/routing/1/calculateRoute/\
51.489781282368824,-0.4953619084322423:51.322840967165035,-0.4519033135884203/json?\
instructionsType=text&language=en-US\
&vehicleHeading=90&sectionType=traffic\
&report=effectiveSettings&routeType=eco\
&traffic=true&avoid=unpavedRoads\
&travelMode=car&vehicleMaxSpeed=120\
&vehicleCommercial=false&vehicleEngineType=combustion\
&key=BxcdOf71w25PiGF7okaiVl4DiuW6qQUc").then(function (r) {
            return r.json();
        }).then(function (json) {
            create_route(json.routes[0].legs[0].points, json.routes[0].sections)
        })
    },
    create_current_location_marker: function (coord) {
        let feature = new ol.Feature({
            type: 'place',
            geometry: new ol.geom.Point(ol.proj.fromLonLat(coord))
        });
        feature.setStyle(styles.my_current_location_icon);
        vectorSource.addFeature(feature);
    }

    ,
    to4326: function (coord) {
        return ol.proj.transform([
            parseFloat(coord[0]), parseFloat(coord[1])
        ], 'EPSG:3857', 'EPSG:4326');
    }
    ,
    to3857: function (coord) {
        return ol.proj.transform([
            parseFloat(coord[0]), parseFloat(coord[1])
        ], 'EPSG:4326', 'EPSG:3857');
    }
    ,

    createSourceFeature: function (coord) {
        let feature = new ol.Feature({
            type: 'place',
            geometry: new ol.geom.Point(ol.proj.fromLonLat(coord))
        });
        feature.setStyle(styles.source_icon);
        vectorSource.clear();
        source_location_marker = feature;
        vectorSource.addFeature(feature);
        if (destination_location !== undefined) {
            utils.createOnlyDestinationFeature(destination_location);
            utils.createRoute();
        }
        map.getView().fit(vectorLayer.getSource().getExtent(), {
            size: map.getSize(),
            maxZoom: 16,
            padding: [60, 60, 60, 60],
            constrainResolution: false
        });
        utils.create_current_location_marker(current_location_coordinates);
    }
    ,
    createDestinationFeature: function (coord) {
        let feature = new ol.Feature({
            type: 'place',
            geometry: new ol.geom.Point(ol.proj.fromLonLat(coord))
        });
        feature.setStyle(styles.icon);
        vectorSource.clear();
        destination_location_marker = feature;
        vectorSource.addFeature(feature);
        if (source_location !== undefined) {
            utils.createOnlySourceFeature(source_location);
            utils.createRoute();
        }
        map.getView().fit(vectorLayer.getSource().getExtent(), {
            size: map.getSize(),
            maxZoom: 16,
            padding: [60, 60, 60, 60],
            constrainResolution: false
        });
        utils.create_current_location_marker(current_location_coordinates);
    }
    ,
    createOnlySourceFeature: function (coord) {
        let feature = new ol.Feature({
            type: 'place',
            geometry: new ol.geom.Point(ol.proj.fromLonLat(coord))
        });
        feature.setStyle(styles.source_icon);
        source_location_marker = feature;
        vectorSource.addFeature(feature);
    }
    ,
    createOnlyDestinationFeature: function (coord) {
        let feature = new ol.Feature({
            type: 'place',
            geometry: new ol.geom.Point(ol.proj.fromLonLat(coord))
        });
        feature.setStyle(styles.icon);
        destination_location_marker = feature;
        vectorSource.addFeature(feature);
    }
    ,
};

getLocation()


function set_map_route() {
    //get the route
    var source = source_location.join();
    var destination = destination_location.join();

    fetch(url_osrm_map_route + source + ';' + destination).then(function (r) {
        return r.json();
    }).then(function (json) {
        if (json.code !== 'Ok') {
            msg_el.innerHTML = 'No route found.';
            return;
        }
        msg_el.innerHTML = 'Route added';
        //points.length = 0;

        let polyline = json.routes[0].geometry;
        // route is ol.geom.LineString
        map_route = new ol.format.Polyline({
            factor: 1e5
        }).readGeometry(polyline, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });
    });
}