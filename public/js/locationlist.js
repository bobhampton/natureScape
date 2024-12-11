  // Initialize Mapbox map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    projection: 'globe',
    center: [30, 15], // Initial map center
    zoom: 1
});
  
  // Add markers to the map
locations.forEach((location) => {

    const customMarker = document.createElement('div');
    customMarker.className = 'custom-marker';
    customMarker.innerHTML = `<i class='bx bxs-camera' ></i>`;
    customMarker.style.width = '32px';
    customMarker.style.height = '32px';
    customMarker.style.display = 'flex';
    customMarker.style.alignItems = 'center';
    customMarker.style.justifyContent = 'center';
    customMarker.style.color = '#ff0000';
    customMarker.style.fontSize = '24px';

    new mapboxgl.Marker(customMarker)
      .setLngLat(location.coordinates)
      .setPopup(new mapboxgl.Popup().setHTML(
        `<h1>Photo Name: ${location.name}</h1>
         <ul>
          <li>Date/Time Uploaded: <br>${location.uploadDateTime}</li>
          <li>Likes: ${location.likes}</li>
          <li>Views: ${location.views}</li>
          <li>Verification_Rating: ${location.verification_rating}
         </ul>
         <img
          src="data:image/${location.img.contentType};base64,${location.img.data}"
          width="150" height="150"
         />`
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
                      <a href="/locationlist/${location.location_id}">Click here to view!</a>`

    item.onclick = () => {
      // Fly to location when clicked
      map.flyTo({ center: location.coordinates, zoom: 10.5 });
    };
    locationsContainer.appendChild(item);
    addedLocations.add(location.area_name); // Newly Added
  }
});

if (darkmode === 'active') map.setStyle('mapbox://styles/mapbox/navigation-night-v1');

if (darkmode === null) map.setStyle('mapbox://styles/mapbox/streets-v11');

document.getElementById('theme-switch').addEventListener('click', () => {
  darkmode = localStorage.getItem('darkmode');
  const newStyle = (darkmode === 'active') ? 'mapbox://styles/mapbox/navigation-night-v1' : 'mapbox://styles/mapbox/streets-v11';
  map.setStyle(newStyle);
});