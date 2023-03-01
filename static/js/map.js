let current_location_coordinates;

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
                width: 6, color: [40, 40, 40, 0.8]
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
    };

let map;
let url_osrm_route = '//router.project-osrm.org/route/v1/driving/';
let olview;
let source_location;
let destination_location;
let source_location_marker;
let destination_location_marker;
let msg_el = $("#error_message");

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

    // map.on('click', function (evt) {
    //     let coord4326 = utils.to4326(evt.coordinate);
    //     utils.createFeature(coord4326);
    //     $("#id_long").val(coord4326[0].toString().slice(0, 9));
    //     $("#id_lat").val(coord4326[1].toString().slice(0, 9));
    // });
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

        fetch(url_osrm_route + source + ';' + destination).then(function (r) {
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
            var route = new ol.format.Polyline({
                factor: 1e5
            }).readGeometry(polyline, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            });
            var feature = new ol.Feature({
                type: 'route',
                geometry: route
            });
            feature.setStyle(styles.route);
            vectorSource.addFeature(feature);
            console.log(polyline);
            console.log(feature);
        });
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


$("#source-search-button"
).click(function (event) {
    event.preventDefault();
    event.stopPropagation();
    let input_destination = $("#source-search").val()
    $.ajax({
        url: "https://photon.komoot.io/api/?q=" + input_destination + "&limit=10&lang=en", success: function (t) {
            $("#source-location-list").html(``);
            t.features.map((function (t) {
                $("#source-location-list").append(`
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item" type="button" data-lon="${t.geometry.coordinates[0]}" data-lat="${t.geometry.coordinates[1]}" data-name="${t.properties.name}">
                        ${t.properties.name}<br>
                        postcode: ${t.properties.postcode}<br>
                        city: ${t.properties.city}<br>
                        state: ${t.properties.state}<br>
                        country: ${t.properties.country}<br>
                    </button>
                `);
            }));
        }
    });
});


$('#source-location-list').on('click', '.dropdown-item', function () {
    source_location = [$(this).data('lon'), $(this).data('lat')];
    map.getView().setCenter(ol.proj.transform(source_location, 'EPSG:4326', 'EPSG:3857'));
    map.getView().setZoom(15);
    utils.createSourceFeature(source_location);
    $("#source-dropdownMenu").text($(this).data('name'))
});


$("#destination-search-button").click(function (event) {
    event.preventDefault();
    event.stopPropagation();
    let input_destination = $("#destination-search").val()
    $.ajax({
        url: "https://photon.komoot.io/api/?q=" + input_destination + "&limit=10&lang=en", success: function (t) {
            $("#destination-location-list").html(``);
            t.features.map((function (t) {
                $("#destination-location-list").append(`
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item" type="button" data-lon="${t.geometry.coordinates[0]}" data-lat="${t.geometry.coordinates[1]}" data-name="${t.properties.name}">
                        ${t.properties.name}<br>
                        postcode: ${t.properties.postcode}<br>
                        city: ${t.properties.city}<br>
                        state: ${t.properties.state}<br>
                        country: ${t.properties.country}<br>
                    </button>
                `);
            }));
        }
    });
});


$('#destination-location-list').on('click', '.dropdown-item', function () {
    destination_location = [$(this).data('lon'), $(this).data('lat')];
    map.getView().setCenter(ol.proj.transform(destination_location, 'EPSG:4326', 'EPSG:3857'));
    map.getView().setZoom(15);
    utils.createDestinationFeature(destination_location);
    $("#destination-dropdownMenu").text($(this).data('name'));
});