// Mock location data
const locations = [
    { id: 1, name: 'Location A', coordinates: [-74.006, 40.7128] },
    { id: 2, name: 'Location B', coordinates: [-73.935242, 40.73061] },
    { id: 3, name: 'Location C', coordinates: [-74.035242, 40.74161] },
];
  
// Initialize Mapbox map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-74.006, 40.7128], // Initial map center
    zoom: 12,
});
  
  // Add markers to the map
locations.forEach((location) => {
    new mapboxgl.Marker()
      .setLngLat(location.coordinates)
      .setPopup(new mapboxgl.Popup().setHTML(`<h4>${location.name}</h4>`))
      .addTo(map);
});
  
// Populate the location list
const locationsContainer = document.getElementById('locations-container');
locations.forEach((location) => {
    const item = document.createElement('div');
    item.className = 'location-item';
    item.textContent = location.name;
    item.onclick = () => {
      // Fly to location when clicked
      map.flyTo({ center: location.coordinates, zoom: 14 });
    };
    locationsContainer.appendChild(item);
});