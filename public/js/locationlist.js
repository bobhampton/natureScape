// Mock location data
// const locations = [
//     { id: 1, name: 'Location A', coordinates: [-74.006, 40.7128] },
//     { id: 2, name: 'Location B', coordinates: [-73.935242, 40.73061] },
//     { id: 3, name: 'Location C', coordinates: [-74.035242, 40.74161] },
// ];

// const locations = <%= JSON.stringify(locations) %>;
  
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
      .setPopup(new mapboxgl.Popup().setHTML(
        `<h1>Photo Name: ${location.name}</h1>
         <ul>
          <li>Date/Time Uploaded: <br>${location.uploadDateTime}</li>
          <li>Likes: ${location.likes}</li>
          <li>Views: ${location.views}</li>
          <li>Verification_Rating: ${location.verification_rating}
         </ul>`
      ))
      .addTo(map);
});
  
// Populate the location list
const locationsContainer = document.getElementById('locations-container');
const addedLocations = new Set(); // Newly Added
locations.forEach((location) => {
  if (!addedLocations.has(location.area_name)) {
    const item = document.createElement('div');
    item.className = 'location-item';

    item.innerHTML = `<span>Area Name: ${location.area_name}</span><br>
                      <span>State: ${location.state}</span><br>
                      <a href="${location.location_id}">Click here to view!</a>`

    item.onclick = () => {
      // Fly to location when clicked
      map.flyTo({ center: location.coordinates, zoom: 14 });
    };
    locationsContainer.appendChild(item);
    addedLocations.add(location.area_name); // Newly Added
  }
});