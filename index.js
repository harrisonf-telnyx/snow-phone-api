import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Resort coordinates and info
const RESORTS = {
  vail: { name: 'Vail', lat: 39.6403, lon: -106.3742, state: 'CO', elevation: '11,570 ft', terrain: '5,317 acres' },
  beaver_creek: { name: 'Beaver Creek', lat: 39.6042, lon: -106.5165, state: 'CO', elevation: '11,440 ft', terrain: '1,832 acres' },
  breckenridge: { name: 'Breckenridge', lat: 39.4817, lon: -106.0384, state: 'CO', elevation: '12,998 ft', terrain: '2,908 acres' },
  keystone: { name: 'Keystone', lat: 39.6069, lon: -105.9500, state: 'CO', elevation: '12,408 ft', terrain: '3,148 acres' },
  abasin: { name: 'Arapahoe Basin', lat: 39.6425, lon: -105.8719, state: 'CO', elevation: '13,050 ft', terrain: '1,428 acres' },
  copper: { name: 'Copper Mountain', lat: 39.5022, lon: -106.1497, state: 'CO', elevation: '12,313 ft', terrain: '2,490 acres' },
  winter_park: { name: 'Winter Park', lat: 39.8841, lon: -105.7625, state: 'CO', elevation: '12,060 ft', terrain: '3,081 acres' },
  steamboat: { name: 'Steamboat', lat: 40.4572, lon: -106.8045, state: 'CO', elevation: '10,568 ft', terrain: '2,965 acres' },
  aspen: { name: 'Aspen/Snowmass', lat: 39.2084, lon: -106.9490, state: 'CO', elevation: '12,510 ft', terrain: '5,527 acres (combined)' },
  telluride: { name: 'Telluride', lat: 37.9375, lon: -107.8123, state: 'CO', elevation: '13,150 ft', terrain: '2,000 acres' },
  deer_valley: { name: 'Deer Valley', lat: 40.6375, lon: -111.4783, state: 'UT', elevation: '9,570 ft', terrain: '2,026 acres' },
  park_city: { name: 'Park City', lat: 40.6514, lon: -111.5080, state: 'UT', elevation: '10,000 ft', terrain: '7,300 acres' }
};

// Fetch NOAA forecast for a location
async function getNOAAForecast(lat, lon) {
  try {
    // Step 1: Get grid point info
    const pointsUrl = `https://api.weather.gov/points/${lat},${lon}`;
    const pointsRes = await fetch(pointsUrl, {
      headers: { 'User-Agent': 'SnowPhoneAPI/1.0 (contact@example.com)' }
    });
    const pointsData = await pointsRes.json();
    
    // Step 2: Get forecast
    const forecastUrl = pointsData.properties.forecast;
    const forecastRes = await fetch(forecastUrl, {
      headers: { 'User-Agent': 'SnowPhoneAPI/1.0 (contact@example.com)' }
    });
    const forecastData = await forecastRes.json();
    
    // Extract relevant periods
    const periods = forecastData.properties.periods.slice(0, 6);
    return periods.map(p => ({
      name: p.name,
      temperature: p.temperature,
      temperatureUnit: p.temperatureUnit,
      windSpeed: p.windSpeed,
      windDirection: p.windDirection,
      shortForecast: p.shortForecast,
      detailedForecast: p.detailedForecast,
      probabilityOfPrecipitation: p.probabilityOfPrecipitation?.value || 0
    }));
  } catch (error) {
    console.error('NOAA fetch error:', error.message);
    return null;
  }
}

// Analyze conditions and provide recommendation
function analyzeConditions(forecast, resort) {
  if (!forecast || forecast.length === 0) {
    return "Unable to fetch current conditions. Check back later.";
  }
  
  const today = forecast[0];
  const tomorrow = forecast.length > 2 ? forecast[2] : forecast[1];
  
  let analysis = [];
  
  // Check for snow in forecast
  const hasSnowToday = today.shortForecast.toLowerCase().includes('snow');
  const hasSnowTomorrow = tomorrow?.shortForecast.toLowerCase().includes('snow');
  const precipChance = today.probabilityOfPrecipitation;
  
  // Temperature analysis
  if (today.temperature < 20) {
    analysis.push("Cold temperatures will keep snow conditions pristine.");
  } else if (today.temperature > 35) {
    analysis.push("Warmer temperatures may soften conditions by afternoon.");
  }
  
  // Snow analysis
  if (hasSnowToday) {
    analysis.push("Snow is expected - could see fresh powder!");
  }
  if (hasSnowTomorrow && !hasSnowToday) {
    analysis.push("Storm moving in tomorrow - could be a good powder day.");
  }
  
  // Wind analysis
  const windMph = parseInt(today.windSpeed);
  if (windMph > 30) {
    analysis.push("High winds may affect upper mountain operations.");
  }
  
  // Generate recommendation
  let recommendation;
  if (hasSnowToday || (hasSnowTomorrow && precipChance > 50)) {
    recommendation = "Great time to hit the slopes! Fresh snow expected.";
  } else if (today.temperature < 32 && !today.shortForecast.toLowerCase().includes('rain')) {
    recommendation = "Good conditions expected. Snow should stay firm.";
  } else if (today.temperature > 40) {
    recommendation = "Spring-like conditions. Hit it early before things get slushy.";
  } else {
    recommendation = "Decent conditions for skiing. Enjoy your day!";
  }
  
  return {
    summary: analysis.join(' ') || "Typical mountain conditions expected.",
    recommendation: recommendation
  };
}

// Main snow endpoint
app.get('/snow', async (req, res) => {
  const resortKey = req.query.resort?.toLowerCase().replace(/[\s-]/g, '_');
  
  if (!resortKey) {
    return res.json({
      error: "Please specify a resort. Example: /snow?resort=vail",
      available_resorts: Object.keys(RESORTS)
    });
  }
  
  // Try to match resort
  let resort = RESORTS[resortKey];
  
  // Fuzzy match if exact match fails
  if (!resort) {
    const match = Object.entries(RESORTS).find(([key, val]) => 
      key.includes(resortKey) || val.name.toLowerCase().includes(resortKey)
    );
    if (match) resort = match[1];
  }
  
  if (!resort) {
    return res.json({
      error: `Resort "${req.query.resort}" not found`,
      available_resorts: Object.keys(RESORTS)
    });
  }
  
  const forecast = await getNOAAForecast(resort.lat, resort.lon);
  const analysis = analyzeConditions(forecast, resort);
  
  res.json({
    resort: resort.name,
    state: resort.state,
    elevation: resort.elevation,
    terrain: resort.terrain,
    current_conditions: forecast ? {
      period: forecast[0].name,
      temperature: `${forecast[0].temperature}°${forecast[0].temperatureUnit}`,
      conditions: forecast[0].shortForecast,
      wind: `${forecast[0].windSpeed} ${forecast[0].windDirection}`,
      precipitation_chance: `${forecast[0].probabilityOfPrecipitation}%`
    } : null,
    forecast: forecast ? forecast.slice(1, 4).map(f => ({
      period: f.name,
      temperature: `${f.temperature}°${f.temperatureUnit}`,
      conditions: f.shortForecast,
      precipitation_chance: `${f.probabilityOfPrecipitation}%`
    })) : null,
    analysis: analysis,
    updated: new Date().toISOString()
  });
});

// List all resorts
app.get('/resorts', (req, res) => {
  res.json({
    resorts: Object.entries(RESORTS).map(([key, val]) => ({
      id: key,
      name: val.name,
      state: val.state,
      elevation: val.elevation
    }))
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Snow Phone API',
    version: '1.0.0',
    endpoints: {
      '/snow?resort=vail': 'Get snow conditions for a resort',
      '/resorts': 'List all supported resorts',
      '/health': 'Health check'
    }
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Snow Phone API running on port ${PORT}`);
  });
}

// Export for Vercel
export default app;
