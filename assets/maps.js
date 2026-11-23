/* Local Leaflet, original saved pin data. Only tile requests leave the site. */
'use strict';
(async () => {
 const host = document.querySelector('[data-map]');
 if (!host) return;
 if (!window.L) { host.textContent = 'Map unavailable. Use the saved pin list below.'; return; }
 try {
  const response = await fetch(`assets/${host.dataset.map}.json`);
  if (!response.ok) throw new Error('Data unavailable');
  const {pins} = await response.json();
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const map = L.map(host, {scrollWheelZoom:false, zoomAnimation:!reduceMotion, fadeAnimation:!reduceMotion, markerZoomAnimation:!reduceMotion});
  const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
  const status=document.querySelector('[data-basemap-status]');
  const listLink=document.querySelector('[data-pin-list-link]');
  function unavailable(){if(status)status.textContent='Basemap unavailable. Saved pins still work; open the saved pin list for every place.';}
  tiles.on('tileerror',unavailable);
  if(navigator.onLine===false)unavailable();
  if(listLink)listLink.addEventListener('click',()=>{const list=document.getElementById('saved-pins');if(list)list.open=true;});
  const layer = L.layerGroup().addTo(map);
  const select = document.querySelector('[data-map-group]');
  function update() {
   layer.clearLayers();
   const shown = pins.filter(p => select.value === 'all' || p.group === select.value);
   for (const pin of shown) {
    const popup = document.createElement('div');
    const heading = document.createElement('strong'); heading.textContent = pin.name; popup.append(heading);
    const detail = document.createElement('p'); detail.textContent = pin.detail; popup.append(detail);
    const a = document.createElement('a'); a.href = pin.href; a.textContent = 'Google Maps'; a.target = '_blank'; a.rel = 'noopener noreferrer'; popup.append(a);
    L.circleMarker([pin.lat,pin.lng], {radius:pin.hotel?8:6,color:pin.hotel?'#14202B':'#C8412B',weight:2,fillOpacity:0.8}).bindPopup(popup).addTo(layer);
   }
   if (shown.length) map.fitBounds(shown.map(p=>[p.lat,p.lng]),{padding:[24,24],maxZoom:14,animate:!reduceMotion});
   document.querySelector('[data-map-count]').textContent = `${shown.length} pins`;
  }
  select.addEventListener('change',update); update();
 } catch (_) { host.textContent = 'Map data could not load. Use the saved pin list below. Local file previews may require a local web server.'; }
})();
