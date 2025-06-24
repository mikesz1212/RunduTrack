// water_feedback.js
mapboxgl.accessToken = 'pk.eyJ1IjoibW9kZWxvbiIsImEiOiJjbTc0enQ0dWUwOWppMnFxdnN5eDI2ZHR3In0.wi3R1hrSQ_P-zQANKtROFw';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/modelon/cmc3sqpb701z101s56h9xdd8v',
  center: [19.785329, -17.941995],
  zoom: 14.3
});

let selectedWaterPoints = [];
let userAddedMarkers = [];
let crimeHotspots = [];
let isAddingWaterPoint = false;
let isMarkingCrime = false;
let selectedWaterPointIds = new Set();

const vulnerabilityWeights = {
  safety: 5,
  shade: 5,
  distance: 5,
  road: 5,
  network: 5
};

const sliderFields = ['safety', 'shade', 'distance', 'road', 'network'];

function setupVulnerabilitySliders() {
  const container = document.getElementById('vulnerabilitySliders');
  sliderFields.forEach(field => {
    const label = document.createElement('label');
    label.textContent = `${field.charAt(0).toUpperCase() + field.slice(1)} Priority:`;
    const input = document.createElement('input');
    input.type = 'range';
    input.min = 1;
    input.max = 10;
    input.value = 5;
    input.className = 'w-full accent-[#7db6e2]';
    input.id = `slider-${field}`;
    input.addEventListener('input', () => {
      vulnerabilityWeights[field] = parseInt(input.value);
    });
    container.appendChild(label);
    container.appendChild(input);
  });
}




map.on('load', () => {
  setupVulnerabilitySliders();

  map.addSource('water-points', {
    type: 'vector',
    url: 'mapbox://modelon.bqtd51tv'
  });

  map.addLayer({
    id: 'water-points-layer',
    type: 'circle',
    source: 'water-points',
    'source-layer': 'water_points-bpu2rx',
    paint: {
      'circle-radius': 6,
      'circle-color': [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        '#f97316',  // Highlighted
        '#2b8cbe'   // Default
      ],
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff'
    }
  });

  map.on('click', 'water-points-layer', (e) => {
    const feature = e.features[0];

    // Ensure the feature has an id
    if (typeof feature.id === 'undefined') {
      console.warn('Feature missing id. Set feature.id manually or check tileset settings.');
      return;
    }

    const currentState = map.getFeatureState({
      source: 'water-points',
      sourceLayer: 'water_points-bpu2rx',
      id: feature.id
    });

    map.setFeatureState(
      {
        source: 'water-points',
        sourceLayer: 'water_points-bpu2rx',
        id: feature.id
      },
      { selected: !currentState.selected }
    );
  });






  map.on('click', (e) => {
    if (isAddingWaterPoint) {
      const marker = new mapboxgl.Marker({ color: '#3b82f6' })
        .setLngLat(e.lngLat)
        .addTo(map);
      userAddedMarkers.push(marker);
      selectedWaterPoints.push({
        type: 'new',
        coordinates: e.lngLat
      });
      alert('New water point added.');
    } else if (isMarkingCrime) {
      const crimeEl = document.createElement('div');
      crimeEl.className = 'crime-marker';
      crimeEl.style.width = '14px';
      crimeEl.style.height = '14px';
      crimeEl.style.backgroundColor = '#dc2626';
      crimeEl.style.borderRadius = '50%';
      crimeEl.style.border = '2px solid white';

      const marker = new mapboxgl.Marker(crimeEl)
        .setLngLat(e.lngLat)
        .addTo(map);
      crimeHotspots.push(marker.getLngLat());
      alert('Crime hotspot marked.');
    } else {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['water-points-layer']
      });

      if (features.length) {
        const feature = features[0];
        const pointId = feature.properties.id;
        selectedWaterPointIds.add(pointId);
        selectedWaterPoints.push({
          type: 'known',
          id: pointId,
          coordinates: feature.geometry.coordinates
        });

        map.setPaintProperty('water-points-layer', 'circle-color', [
          'case',
          ['in', ['get', 'id'], ['literal', Array.from(selectedWaterPointIds)]],
          '#f97316',
          '#2b8cbe'
        ]);

        alert('Water point selected.');
      }
    }
  });
});

// Button events
document.getElementById('addNewPoint').addEventListener('click', () => {
  isAddingWaterPoint = true;
  alert('Click on the map to place a new water point.');
});

document.getElementById('selectCrimeHotspot').addEventListener('click', () => {
  isMarkingCrime = true;
  alert('Click on the map to mark a crime hotspot.');
});

document.getElementById('submitFeedback').addEventListener('click', () => {
  const age = document.getElementById('age').value;
  const gender = document.getElementById('gender').value;
  const familySize = document.getElementById('familySize').value;
  const disabilities = document.getElementById('disabilities').value;
  const transport = document.getElementById('transport').value;
  const employment = document.getElementById('employment').value;
  const reliability = document.getElementById('reliability').value;

  if (!age || !gender || selectedWaterPoints.length === 0) {
    alert('Please complete all required fields and select at least one water point.');
    return;
  }

  const feedback = {
    timestamp: new Date().toISOString(),
    age,
    gender,
    familySize,
    disabilities,
    transport,
    employment,
    reliability: parseInt(reliability),
    water_points: selectedWaterPoints,
    crime_hotspots: crimeHotspots,
    vulnerabilities: vulnerabilityWeights
  };

  console.log('Submitted feedback:', feedback);
  alert('Thank you! Your feedback was recorded.');

  fetch('https://script.google.com/macros/s/AKfycbyGpMFpQB1KAsYG1whrOzOILbp-XWAMboylsLX6_SfXJj9uXqXVHWbai11EZEWfsSI/exec', {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedback)
  });
});
