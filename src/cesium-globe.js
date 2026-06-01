import * as Cesium from 'cesium';

// Initialize Cesium Viewer
export async function initCesiumGlobe(containerId, handleGlobeClickCallback) {
  const viewer = new Cesium.Viewer(containerId, {
    terrainProvider: await Cesium.createWorldTerrainAsync(),
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false,
    shouldAnimate: true
  });

  // Enable lighting based on sun position
  viewer.scene.globe.enableLighting = true;
  
  // Set time to current UTC time for realistic sun
  viewer.clock.currentTime = Cesium.JulianDate.now();

  // Add 3D OSM Buildings
  try {
    const buildingsTileset = await Cesium.createOsmBuildingsAsync();
    viewer.scene.primitives.add(buildingsTileset);
  } catch (error) {
    console.warn('Could not load 3D buildings:', error);
  }

  // Handle globe clicks
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(function (click) {
    const pickRay = viewer.camera.getPickRay(click.position);
    const globe = viewer.scene.globe;
    const intersection = globe.pick(pickRay, viewer.scene);
    
    if (intersection) {
      const cartographic = Cesium.Cartographic.fromCartesian(intersection);
      const lat = Cesium.Math.toDegrees(cartographic.latitude);
      const lng = Cesium.Math.toDegrees(cartographic.longitude);
      if (handleGlobeClickCallback) {
        handleGlobeClickCallback(lat, lng);
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // Expose the viewer globally so index.html can access it if needed
  window.cesiumViewer = viewer;

  return viewer;
}
