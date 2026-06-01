// Native fetch check

async function testApis() {
  const lat = 40.7128;
  const lng = -74.0060;

  console.log('Testing Open-Meteo Weather API...');
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code,is_day&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto`);
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Open-Meteo Weather API Success:', data.current);
    } else {
      console.error('❌ Open-Meteo Weather API Failed:', res.status, res.statusText);
    }
  } catch (err) {
    console.error('❌ Open-Meteo Weather API Exception:', err.message);
  }

  console.log('\nTesting Nominatim Reverse Geocoding...');
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10&email=weatherglobe_myth@gmail.com`);
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Nominatim Reverse Geocoding Success:', data.display_name);
    } else {
      console.error('❌ Nominatim Reverse Geocoding Failed:', res.status, res.statusText);
    }
  } catch (err) {
    console.error('❌ Nominatim Reverse Geocoding Exception:', err.message);
  }

  console.log('\nTesting Nominatim Boundary Geocoding (zoom 5)...');
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&polygon_geojson=1&zoom=5&email=weatherglobe_myth@gmail.com`);
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Nominatim Boundary Geocoding Success. Geometry Type:', data.geojson ? data.geojson.type : 'none');
    } else {
      console.error('❌ Nominatim Boundary Geocoding Failed:', res.status, res.statusText);
    }
  } catch (err) {
    console.error('❌ Nominatim Boundary Geocoding Exception:', err.message);
  }
}

testApis();
