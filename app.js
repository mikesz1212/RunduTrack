
// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoibW9kZWxvbiIsImEiOiJjbTc0enQ0dWUwOWppMnFxdnN5eDI2ZHR3In0.wi3R1hrSQ_P-zQANKtROFw';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/modelon/cmc3sqpb701z101s56h9xdd8v',
  center: [19.785329, -17.941995],
  zoom: 14.3
});

let userMarker = null;
let impactChart = null;
let heatmapVisible = false;
let impactVisible = false;

const vulnerabilities = [
  'safety',
  'shade access',
  'distance to water point',
  'road accessibility',
  'connection network'
];

const state = {};
const sliderContainer = document.getElementById('sliders');

vulnerabilities.forEach(vul => {
  const id = vul.replace(/\s+/g, '-');
  state[id] = 5;

  const label = document.createElement('label');
  label.htmlFor = id;
  label.className = 'block text-sm font-medium text-black capitalize mb-1';
  label.textContent = vul;

  const input = document.createElement('input');
  input.type = 'range';
  input.min = '1';
  input.max = '10';
  input.value = '5';
  input.id = id;
  input.className = 'w-full accent-[#7db6e2]';

  const valueDisplay = document.createElement('div');
  valueDisplay.className = 'text-xs text-gray-600';
  valueDisplay.innerHTML = `Value: <span id="\${id}-val">5</span>`;

  input.addEventListener('input', () => {
    state[id] = +input.value;
    document.getElementById(`${id}-val`).innerText = input.value;
  });

  const container = document.createElement('div');
  container.appendChild(label);
  container.appendChild(input);
  container.appendChild(valueDisplay);
  sliderContainer.appendChild(container);
});

map.on('load', () => {
  map.addSource('vuln', {
    type: 'vector',
    url: 'mapbox://modelon.c83lmr00'
  });

  map.addLayer({
    id: 'vuln',
    type: 'circle',
    source: 'vuln',
    'source-layer': 'vulnerability_map_final_v2-2ihxn0',
    paint: {
      'circle-radius': 3,
      'circle-color': getImpactExpression(),
      'circle-opacity': 0.7,

    }
  });

  map.addLayer({
    id: 'population-circles',
    type: 'circle',
    source: 'vuln',
    'source-layer': 'vulnerability_map_final_v2-2ihxn0',
    layout: { visibility: 'none' },
    paint: {
      'circle-radius': 3,
      'circle-color': [
        'step',
        ['get', 'population'],
        '#2c7bb6',  // deep blue
  0.02, '#3c8fbc',
  0.04, '#4ca3c2',
  0.06, '#5cb7c8',
  0.08, '#6ccbd0',
  0.10, '#7cdfd6',
  0.12, '#8cf3dd',
  0.14, '#a3f7e2',
  0.16, '#bafbe7',
  0.18, '#d1ffee',
  0.20, '#ffffbf',  // neutral center
  0.22, '#ffe49f',
  0.24, '#ffc980',
  0.26, '#ffaf61',
  0.28, '#ff9442',
  0.30, '#ff7923',
  0.32, '#ff5f12',
  0.34, '#ff450c',
  0.36, '#f92b06',
  0.38, '#eb1300',
  0.40, '#d40000',
  0.42, '#bf0000',
  0.44, '#aa0000',
  0.46, '#950000',
  0.48, '#800000',
  0.50, '#7a0000',
  0.52, '#740000',
  0.54, '#6e0000',
  0.56, '#680000',
  0.58, '#620000',
  0.60, '#5c0000',
  0.62, '#560000',
  0.64, '#500000',
  0.66, '#4a0000',
  0.68, '#440000',
  0.70, '#3e0000',
  0.72, '#380000',
  0.74, '#320000',
  0.76, '#2c0000',
  0.78, '#260000',
  0.80, '#200000',
  0.82, '#1a0000',
  0.84, '#140000',
  0.86, '#0e0000',
  0.88, '#080000',
  0.90, '#050000',
  0.92, '#030000',
  0.94, '#020000',
  0.96, '#010000',
  0.98, 'rgb(0,0,0)',
  1.00, 'rgba(0,0,0,0)'
      ],
      'circle-opacity': 0.6
    }
  });

  map.addLayer({
    id: 'impact-score-circles',
    type: 'circle',
    source: 'vuln',
    'source-layer': 'vulnerability_map_final_v2-2ihxn0',
    layout: { visibility: 'none' },
    paint: {
      'circle-radius': 5,
      'circle-opacity': 0.8,
      'circle-color': getImpactScorePaint()
    }
  });


   map.addSource('water-points', {
      type: 'vector',
      url: 'mapbox://modelon.c83lmr00'
    });

    map.addLayer({
      id: 'water-points',
      type: 'circle',
      source: 'water-points',
      'source-layer': 'water_points-bpu2rx',
      paint: {
        'circle-radius': 3,
        'circle-color': 'white',
        'circle-opacity': 0.7,
        'circle-stroke-width': 0,
        'circle-stroke-color': 'rgba(255,255,255,0)'
      }
    });


});

function getImpactExpression() {
  return [
    'interpolate', ['linear'],
    ['+',
      ['*', ['get', 'remap_Crim'], state['safety']],
      ['*', ['get', 'remap_Shad'], state['shade-access']],
      ['*', ['get', 'remap_Wate'], state['distance-to-water-point']],
      ['*', ['get', 'remap_Grav'], state['road-accessibility']],
      ['*', ['get', 'remap_Spac'], state['connection-network']]
    ],
    0,   '#00ffff',  // bright cyan
    5,   '#00e5ff',  // aqua
    10,  '#00ccff',  // sky blue
    15,  '#00ff99',  // neon green
    20,  '#33ff33',  // bright green
    25,  '#ccff33',  // lime yellow
    30,  '#ffff33',  // pure yellow
    35,  '#ffc107',  // amber
    40,  '#ff9800',  // orange
    45,  '#ff5722',  // orange-red
    50,  '#f44336',  // red
    55,  '#e53935',
    60,  '#d32f2f',
    65,  '#c62828',
    70,  '#b71c1c',
    75,  '#880e4f',
    80,  '#6a1b9a',
    85,  '#4a148c',
    90,  '#1a237e',
    95,  'rgba(13,13,13,0)',
    100, 'rgba(0,0,0,0)'   // solid black
  ];
}

function getImpactScorePaint() {
  return [
    'interpolate', ['linear'],
    [
      '*',
      [
        '+',
        ['*', ['get', 'remap_Crim'], state['safety']],
        ['*', ['get', 'remap_Shad'], state['shade-access']],
        ['*', ['get', 'remap_Wate'], state['distance-to-water-point']],
        ['*', ['get', 'remap_Grav'], state['road-accessibility']],
        ['*', ['get', 'remap_Spac'], state['connection-network']],
        // ['get', 'new_roads1'],      // ← fixed factor
        // ['get', 'big_roads1']        // ← fixed factor
      ],
      ['get', 'population']
    ],
    0,   '#ffffcc',  // pale yellow
    1,   '#e6f7a3',  // yellow-green
    2,  '#d9f0a3',  // light lime green
    3,  '#c0e08f',  // lime green
    4,  '#addd8e',  // grassy green
    5,  '#d2b86a',  // muted yellow-orange
    7,  '#feb24c',  // orange-peach
    9,  '#fd9a3c',  // lighter orange
    11,  '#fd8d3c',  // vivid orange
    13,  '#fb6a2c',  // strong orange
    15,  '#f03b20',  // orange-red
    20,  '#ea2b1a',  // red-orange
    35,  '#e31a1c',  // strong red
    40,  '#d8131d',  // slightly darker red
    50,  '#c6111f',  // deep red
    60,  '#bd0026',  // crimson
    70,  '#99001f',  // dark wine
    85,  '#870020',  // deeper wine red
    90,  '#800026',  // wine red
    100, 'rgba(0,0,0,0)'   // black
  ];
}

document.getElementById('storeButton').addEventListener('click', () => {
  if (map.getLayer('impact-score-circles')) {
    map.setPaintProperty('impact-score-circles', 'circle-color', getImpactScorePaint());
  }
  if (map.getLayer('vuln')) {
    map.setPaintProperty('vuln', 'circle-color', getImpactExpression());
  }
});

document.getElementById('toggleHeatmap').addEventListener('click', () => {
  heatmapVisible = !heatmapVisible;
  map.setLayoutProperty('population-circles', 'visibility', heatmapVisible ? 'visible' : 'none');
});

document.getElementById('toggleImpactLayer').addEventListener('click', () => {
  impactVisible = !impactVisible;
  map.setLayoutProperty('impact-score-circles', 'visibility', impactVisible ? 'visible' : 'none');
});

const opacitySlider = document.getElementById('opacitySlider');
const opacityValue = document.getElementById('opacityValue');

opacitySlider.addEventListener('input', () => {
  const opacity = parseFloat(opacitySlider.value);
  opacityValue.textContent = opacity;
  ['vuln', 'population-circles', 'impact-score-circles'].forEach(id => {
    if (map.getLayer(id)) {
      map.setPaintProperty(id, 'circle-opacity', opacity);
    }
  });
});

map.on('click', (e) => {
  const { lng, lat } = e.lngLat;
  if (userMarker) userMarker.remove();
  userMarker = new mapboxgl.Marker({ color: '#e63946' }).setLngLat([lng, lat]).addTo(map);

  const features = map.queryRenderedFeatures(e.point, { layers: ['vuln'] });
  if (!features.length) return;

  const props = features[0].properties;
  const vulnerabilityScore =
    props.remap_Crim * state['safety'] +
    props.remap_Shad * state['shade-access'] +
    props.remap_Wate * state['distance-to-water-point'] +
    props.remap_Grav * state['road-accessibility'] +
    props.remap_Spac * state['connection-network'];
  const population = props.population ?? 1;
  const impactScore = vulnerabilityScore * population;

  new mapboxgl.Popup()
    .setLngLat([lng, lat])
    .setHTML(`<strong>Impact Score:</strong> ${impactScore.toFixed(2)}<br/>
              <strong>Vulnerability:</strong> ${vulnerabilityScore.toFixed(2)}<br/>
              <strong>Population:</strong> ${population}`)
    .addTo(map);

  const canvas = document.getElementById('impactChart');
  if (!canvas) return;

  const point = { x: vulnerabilityScore, y: population };
  if (impactChart) {
    impactChart.data.datasets[0].data = [point];
    impactChart.update();
  } else {
    impactChart = new Chart(canvas, {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Selected Zone',
          data: [point],
          backgroundColor: 'rgba(239, 83, 80, 0.8)',
          pointRadius: 4
        }]
      },
      options: {
        responsive: false,
        scales: {
          x: {
            title: { display: true, text: 'Vulnerability Score' },
            min: 0,
            max: 20
          },
          y: {
            title: { display: true, text: 'Population' },
            min: 0,
            max: 1
          }
        },
        plugins: {
          legend: { display: false },
          backgroundGradient: true
        }
      },
      plugins: [{
        id: 'backgroundGradient',
        beforeDraw: chart => {
          const ctx = chart.canvas.getContext('2d');
          const { chartArea } = chart;
          const gradient = ctx.createLinearGradient(chartArea.left, chartArea.bottom, chartArea.right, chartArea.top);
          gradient.addColorStop(0, '#fefefe');     // low impact
          gradient.addColorStop(0.5, '#fee0d2');   // mid
          gradient.addColorStop(1, '#de2d26');     // high impact

          ctx.save();
          ctx.fillStyle = gradient;
          ctx.fillRect(chartArea.left, chartArea.top, chartArea.width, chartArea.height);
          ctx.restore();
        }
      }]
    });
  }
});



let waterPointsVisible = true;

document.getElementById('toggleWaterPoints').addEventListener('click', () => {
  waterPointsVisible = !waterPointsVisible;
  map.setLayoutProperty(
    'water-points',
    'visibility',
    waterPointsVisible ? 'visible' : 'none'
  );
});
