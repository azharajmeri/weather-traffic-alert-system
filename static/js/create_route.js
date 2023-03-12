function divideRange(n) {
    const step = 1 / (n - 1);
    const result = [];

    for (let i = 0; i < n; i++) {
        result.push(i * step);
    }

    return result;
}

function makeCheckpoints(checkpoints_distance, lineString) {
    for (let i = 0; i < checkpoints_distance.length; i++) {
        const Coordinate = lineString.getCoordinateAt(checkpoints_distance[i]);
        const coordinate_to4326 = utils.to4326(Coordinate);
        if (i === 0 || i === 1)
            start_end_flag = true
        else
            start_end_flag = false
        fetch_weather(coordinate_to4326[1], coordinate_to4326[0], start_end_flag);
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

    let checkpoint_count = Math.floor(details.lengthInMeters / 2000);
    if (checkpoint_count < 3)
        checkpoint_count = 3
    let checkpoints_distance = divideRange(checkpoint_count);
    makeCheckpoints(checkpoints_distance, lineString);

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