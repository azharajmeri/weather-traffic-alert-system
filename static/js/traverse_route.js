const speedInput = 3000
const startButton = document.getElementById('start-animation');
let animating = false;
let distance = 0;
let lastTime;
let abc = 0;


function moveFeature(event) {
    abc = abc + 1
    const speed = Number(speedInput);
    const time = event.frameState.time;
    const elapsedTime = time - lastTime;
    distance = (distance + (speed * elapsedTime) / 1e6) % 2;
    lastTime = time;
    const currentCoordinate = map_route.getCoordinateAt(
        distance > 1 ? 2 - distance : distance
    );
    if (currentCoordinate[0].toString().slice(0, 4) == map_route.getLastCoordinate()[0].toString().slice(0, 4) &&
        currentCoordinate[1].toString().slice(0, 4) == map_route.getLastCoordinate()[1].toString().slice(0, 4)) {
        stopAnimation()
    }
    position.setCoordinates(currentCoordinate);
    const vectorContext = ol.render.getVectorContext(event);
    vectorContext.setStyle(styles.geoMarker);
    vectorContext.drawGeometry(position);
    // tell OpenLayers to continue the postrender animation
    map.render();
}

function startAnimation() {
    animating = true;
    lastTime = Date.now();
    startButton.textContent = 'Stop Animation';
    vectorLayer.on('postrender', moveFeature);
    // hide geoMarker and trigger map render through change event
    geoMarker.setGeometry(null);
}

function stopAnimation() {
    console.log(abc)
    abc = 0
    animating = false;
    startButton.textContent = 'Start Animation';

    // Keep marker at current animation position
    position = source_location_marker.getGeometry().clone()
    geoMarker.setGeometry(position);
    vectorLayer.un('postrender', moveFeature);
    distance = 0;
}

startButton.addEventListener('click', function () {
    if (animating) {
        stopAnimation();
    } else {
        startAnimation();
    }
});
