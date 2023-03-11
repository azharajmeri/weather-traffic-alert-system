function divideRange(n) {
    const step = 1 / (n - 1);
    const result = [];

    for (let i = 0; i < n; i++) {
        result.push(i * step);
    }

    return result;
}

function makeCheckpoints(checkpoints_distance, lineString){
    for(let i = 0; i < checkpoints_distance.length; i++) {
        console.log(lineString.getCoordinateAt(checkpoints_distance[i]));
        // https://stackoverflow.com/questions/62358299/openlayers-6-marker-popup-without-nodejs
    }
}

function create_route(data, sections, details) {

    const excludedRanges = sections.map(item => [item.startPointIndex, item.endPointIndex]);

    const coordinates = data.map(item => [item.longitude, item.latitude]);

    // Convert the coordinates to the OpenLayers projection
    const olCoords = coordinates.map(coord => ol.proj.fromLonLat(coord));

    // Create a LineString geometry object
    const lineString = new ol.geom.LineString(olCoords);

    // Create a feature and add the LineString geometry to it
    const feature = new ol.Feature(lineString);
    feature.setStyle(styles.route);

    checkpoints_distance = divideRange( Math.floor(details.lengthInMeters / 1000))
    makeCheckpoints(checkpoints_distance, lineString)

    vectorSource.addFeature(feature);

    const subArrays = excludedRanges.map(range => {
        return coordinates.slice(range[0], range[1] + 1);
    });

    subArrays.map(item => {
        // Convert the coordinates to the OpenLayers projection
        const traffic_olCoords = item.map(coord => ol.proj.fromLonLat(coord));

        // Create a LineString geometry object
        const traffic_lineString = new ol.geom.LineString(traffic_olCoords);

        // Create a feature and add the LineString geometry to it
        const traffic_feature = new ol.Feature(traffic_lineString);
        traffic_feature.setStyle(styles.traffic_route);

        vectorSource.addFeature(traffic_feature);
    });
}