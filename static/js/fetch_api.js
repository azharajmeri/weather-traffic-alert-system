function fetch_weather(lat, long, start_end_flag) {
    const api_url = "/map/weather/" + lat + "/" + long + "/"
    $.ajax({
        url: api_url, success: function (response) {
            set_weather_mark_with_checkpoint(lat, long, response.weather_code, start_end_flag);

            const city = response.location_details.address['city'];
            const place_name = response.location_details['name']
            const location_address = response.location_details['display_name']
            const temperature = response.temperature;
            const traffic = getTrafficLevel(response.traffic_speed);
            const weather_details = get_weather_mark(response.weather_code);
            const weather_marker = weather_details['marker'];
            const weather_info = weather_details['message'];
            const detail_card = create_alert_card(city, place_name, temperature, location_address, traffic, weather_marker, weather_info);
            $('#alert_log').prepend(detail_card);
        }
    });
}


function set_weather_mark_with_checkpoint(lat, long, weather_code, start_end_flag) {
    let feature = new ol.Feature({
        type: 'place',
        geometry: new ol.geom.Point(ol.proj.fromLonLat([long + 0.0009, lat + 0.0009]))
    });
    if (weather_code >= 0 && weather_code <= 19) {
        feature.setStyle(styles.sun);
    } else if (weather_code > 19 && weather_code <= 29) {
        feature.setStyle(styles.cloudy);
    } else if (weather_code > 29 && weather_code <= 39) {
        feature.setStyle(styles.fog);
    } else if (weather_code > 39 && weather_code <= 49) {
        feature.setStyle(styles.wind);
    } else if (weather_code > 49 && weather_code <= 59) {
        feature.setStyle(styles.snow);
    } else if (weather_code > 59 && weather_code <= 69) {
        feature.setStyle(styles.rain);
    } else {
        feature.setStyle(styles.storm);
    }
    vectorSource.addFeature(feature);
    if (!start_end_flag) {
        let checkpoint_feature = new ol.Feature({
            type: 'place',
            geometry: new ol.geom.Point(ol.proj.fromLonLat([long, lat]))
        });
        checkpoint_feature.setStyle(styles.checkpoint_icon);
        vectorSource.addFeature(checkpoint_feature);
    }
}

function get_weather_mark(weather_code) {
    if (weather_code >= 0 && weather_code <= 19) {
        return { 'marker': sun, "message": "Weather is good."}
    } else if (weather_code > 19 && weather_code <= 29) {
        return { 'marker': cloudy, "message": "Weather is cloudy."}
    } else if (weather_code > 29 && weather_code <= 39) {
        return { 'marker': fog, "message": "Weather is foggy!"}
    } else if (weather_code > 39 && weather_code <= 49) {
        return { 'marker': wind, "message": "Weather is windy"}
    } else if (weather_code > 49 && weather_code <= 59) {
        return { 'marker': snow, "message": "Weather is snowy."}
    } else if (weather_code > 59 && weather_code <= 69) {
        return { 'marker': rain, "message": "Weather is rainy."}
    } else {
        return { 'marker': storm, "message": "storm alert!"}
    }
}

function getTrafficLevel(number) {
  if (number >= 80) {
    return "High traffic";
  } else if (number >= 50) {
    return "Medium traffic";
  } else {
    return "Low traffic";
  }
}
