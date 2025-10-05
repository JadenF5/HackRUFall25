(function(){
  // Rutgers campus centers (approx)
  const CAMPUSES = {
    collegeAve:   { name: "College Ave",    lat: 40.5025, lng: -74.4518, zoom: 15 },
    busch:        { name: "Busch",          lat: 40.5230, lng: -74.4580, zoom: 15 },
    livingston:   { name: "Livingston",     lat: 40.5220, lng: -74.4380, zoom: 15 },
    cookDouglass: { name: "Cook/Douglass",  lat: 40.4806, lng: -74.4359, zoom: 15 },
  };

  // Init map centered to include all campuses
  const map = L.map('map', { scrollWheelZoom: true }).setView([40.511, -74.445], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  // Add campus markers
  const markers = [];
  for (const key in CAMPUSES) {
    const c = CAMPUSES[key];
    markers.push(L.marker([c.lat, c.lng]).addTo(map).bindPopup(`<b>${c.name}</b>`));
  }

  // Fit to all markers initially
  try { map.fitBounds(L.featureGroup(markers).getBounds().pad(0.2)); } catch {}

  // Campus jump control
  const campusSel = document.getElementById('map-campus');
  campusSel.addEventListener('change', () => {
    const key = campusSel.value;
    if (!key || !CAMPUSES[key]) return;
    const c = CAMPUSES[key];
    map.setView([c.lat, c.lng], c.zoom);
  });
})();
