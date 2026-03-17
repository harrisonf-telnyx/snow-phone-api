import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Resort coordinates, SNOTEL stations, and CAIC zone info
const RESORTS = {
  vail: { 
    name: 'Vail', 
    lat: 39.6403, 
    lon: -106.3742, 
    state: 'CO', 
    elevation: '11,570 ft', 
    terrain: '5,317 acres',
    snotel: [{ id: '842', name: 'Vail Mountain' }],
    caicZone: 'Vail & Summit County'
  },
  beaver_creek: { 
    name: 'Beaver Creek', 
    lat: 39.6042, 
    lon: -106.5165, 
    state: 'CO', 
    elevation: '11,440 ft', 
    terrain: '1,832 acres',
    snotel: [{ id: '842', name: 'Vail Mountain' }],
    caicZone: 'Vail & Summit County'
  },
  breckenridge: { 
    name: 'Breckenridge', 
    lat: 39.4817, 
    lon: -106.0384, 
    state: 'CO', 
    elevation: '12,998 ft', 
    terrain: '2,908 acres',
    snotel: [{ id: '531', name: 'Hoosier Pass' }],
    caicZone: 'Vail & Summit County'
  },
  keystone: { 
    name: 'Keystone', 
    lat: 39.6069, 
    lon: -105.9500, 
    state: 'CO', 
    elevation: '12,408 ft', 
    terrain: '3,148 acres',
    snotel: [{ id: '531', name: 'Hoosier Pass' }],
    caicZone: 'Vail & Summit County'
  },
  abasin: { 
    name: 'Arapahoe Basin', 
    lat: 39.6425, 
    lon: -105.8719, 
    state: 'CO', 
    elevation: '13,050 ft', 
    terrain: '1,428 acres',
    snotel: [{ id: '485', name: 'Grizzly Peak' }],
    caicZone: 'Front Range'
  },
  copper: { 
    name: 'Copper Mountain', 
    lat: 39.5022, 
    lon: -106.1497, 
    state: 'CO', 
    elevation: '12,313 ft', 
    terrain: '2,490 acres',
    snotel: [{ id: '415', name: 'Copper Mountain' }],
    caicZone: 'Vail & Summit County'
  },
  winter_park: { 
    name: 'Winter Park', 
    lat: 39.8841, 
    lon: -105.7625, 
    state: 'CO', 
    elevation: '12,060 ft', 
    terrain: '3,081 acres',
    snotel: [{ id: '335', name: 'Berthoud Summit' }],
    caicZone: 'Front Range'
  },
  steamboat: { 
    name: 'Steamboat', 
    lat: 40.4572, 
    lon: -106.8045, 
    state: 'CO', 
    elevation: '10,568 ft', 
    terrain: '2,965 acres',
    snotel: [{ id: '709', name: 'Rabbit Ears' }],
    caicZone: 'Steamboat & Flat Tops'
  },
  aspen: { 
    name: 'Aspen/Snowmass', 
    lat: 39.2084, 
    lon: -106.9490, 
    state: 'CO', 
    elevation: '12,510 ft', 
    terrain: '5,527 acres (combined)',
    snotel: [{ id: '542', name: 'Independence Pass' }],
    caicZone: 'Aspen'
  },
  telluride: { 
    name: 'Telluride', 
    lat: 37.9375, 
    lon: -107.8123, 
    state: 'CO', 
    elevation: '13,150 ft', 
    terrain: '2,000 acres',
    snotel: [{ id: '586', name: 'Lizard Head Pass' }],
    caicZone: 'Northern San Juan'
  },
  deer_valley: { 
    name: 'Deer Valley', 
    lat: 40.6375, 
    lon: -111.4783, 
    state: 'UT', 
    elevation: '9,570 ft', 
    terrain: '2,026 acres',
    snotel: [{ id: '766', name: 'Thaynes Canyon' }],
    caicZone: null // Utah - no CAIC
  },
  park_city: { 
    name: 'Park City', 
    lat: 40.6514, 
    lon: -111.5080, 
    state: 'UT', 
    elevation: '10,000 ft', 
    terrain: '7,300 acres',
    snotel: [{ id: '766', name: 'Thaynes Canyon' }],
    caicZone: null // Utah - no CAIC
  }
};

// CAIC zone keywords to match forecasts
const CAIC_ZONES = {
  'Vail & Summit County': ['33', '34', '37', '41', '42', '43', '44', '45', '53', '54', '55', '60', '61', '62', '76'],
  'Front Range': ['21', '24', '38', '39', '9'],
  'Steamboat & Flat Tops': ['13', '14', '2', '26', '29', '3', '30', '31', '32', '46'],
  'Aspen': ['71', '72', '73', '84', '85', '86', '87', '88', '95'],
  'Northern San Juan': ['119', '120', '121', '122', '127', '128', '129', '130', '131', '132', '133', '134', '135', '136', '138', '139', '140', '141', '142', '143', '144', '145'],
  'Gunnison': ['104', '105', '106', '107', '112', '48', '49', '50', '51', '52', '63', '64', '65', '74', '75', '82', '83', '96', '97', '98'],
  'Sawatch': ['40', '56', '59', '77', '78', '79', '80', '81', '99'],
  'Grand Mesa': ['108', '110', '66', '67', '69', '70', '89', '90', '91', '92', '93', '94']
};

// Fetch NOAA forecast for a location
async function getNOAAForecast(lat, lon) {
  try {
    const pointsUrl = `https://api.weather.gov/points/${lat},${lon}`;
    const pointsRes = await fetch(pointsUrl, {
      headers: { 'User-Agent': 'SnowPhoneAPI/2.0 (harrisonf@telnyx.com)' }
    });
    const pointsData = await pointsRes.json();
    
    const forecastUrl = pointsData.properties.forecast;
    const forecastRes = await fetch(forecastUrl, {
      headers: { 'User-Agent': 'SnowPhoneAPI/2.0 (harrisonf@telnyx.com)' }
    });
    const forecastData = await forecastRes.json();
    
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

// Fetch SNOTEL data for a station
async function getSNOTELData(stationId, state = 'CO') {
  try {
    const url = `https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/daily/${stationId}:${state}:SNTL%7Cid=%22%22%7Cname/-7,0/WTEQ::value,SNWD::value,PREC::value,TOBS::value?fitToScreen=false`;
    const res = await fetch(url);
    const text = await res.text();
    
    // Parse CSV - skip header lines starting with #
    const lines = text.split('\n').filter(l => !l.startsWith('#') && l.trim());
    if (lines.length < 2) return null;
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 5) {
        data.push({
          date: parts[0],
          snowWaterEquivalent: parts[1] ? parseFloat(parts[1]) : null,
          snowDepth: parts[2] ? parseFloat(parts[2]) : null,
          precipAccum: parts[3] ? parseFloat(parts[3]) : null,
          temperature: parts[4] ? parseFloat(parts[4]) : null
        });
      }
    }
    
    // Get latest and calculate 24h/48h changes
    const latest = data[data.length - 1];
    const yesterday = data.length > 1 ? data[data.length - 2] : null;
    const twoDaysAgo = data.length > 2 ? data[data.length - 3] : null;
    
    let newSnow24h = null;
    let newSnow48h = null;
    
    if (latest && yesterday && latest.snowDepth !== null && yesterday.snowDepth !== null) {
      newSnow24h = Math.max(0, latest.snowDepth - yesterday.snowDepth);
    }
    if (latest && twoDaysAgo && latest.snowDepth !== null && twoDaysAgo.snowDepth !== null) {
      newSnow48h = Math.max(0, latest.snowDepth - twoDaysAgo.snowDepth);
    }
    
    return {
      current: latest,
      newSnow24h,
      newSnow48h,
      history: data
    };
  } catch (error) {
    console.error('SNOTEL fetch error:', error.message);
    return null;
  }
}

// Fetch CAIC avalanche forecast
async function getCAICAvalanche(zoneName) {
  if (!zoneName) return null;
  
  try {
    const url = 'https://avalanche.state.co.us/api-proxy/avid?_api_proxy_uri=/products/all';
    const res = await fetch(url);
    const data = await res.json();
    
    // Find matching forecast by zone keywords
    const zoneNumbers = CAIC_ZONES[zoneName] || [];
    
    for (const forecast of data) {
      if (forecast.type !== 'avalancheforecast') continue;
      
      const publicName = forecast.publicName || '';
      const numbers = publicName.split('-');
      
      // Check if any zone number matches
      if (numbers.some(n => zoneNumbers.includes(n))) {
        const dangerToday = forecast.dangerRatings?.days?.[0];
        const summary = forecast.avalancheSummary?.days?.[0]?.content || '';
        
        // Convert danger levels to readable format
        const dangerMap = {
          'low': 'Low (1)',
          'moderate': 'Moderate (2)', 
          'considerable': 'Considerable (3)',
          'high': 'High (4)',
          'extreme': 'Extreme (5)',
          'noRating': 'No Rating',
          'noForecast': 'No Forecast'
        };
        
        return {
          zone: zoneName,
          danger: {
            alpine: dangerMap[dangerToday?.alp] || 'Unknown',
            treeline: dangerMap[dangerToday?.tln] || 'Unknown',
            belowTreeline: dangerMap[dangerToday?.btl] || 'Unknown'
          },
          summary: summary.replace(/<\/?[^>]+(>|$)/g, ''), // Strip HTML
          forecaster: forecast.forecaster,
          issued: forecast.issueDateTime,
          expires: forecast.expiryDateTime,
          problems: forecast.avalancheProblems?.days?.[0]?.map(p => p.type) || []
        };
      }
    }
    return null;
  } catch (error) {
    console.error('CAIC fetch error:', error.message);
    return null;
  }
}

// Analyze conditions and provide recommendation
function analyzeConditions(forecast, snotelData, avalanche, resort) {
  const analysis = [];
  let recommendation = '';
  let powderRating = 0; // 0-5 scale
  
  // SNOTEL analysis
  if (snotelData?.current) {
    const { snowDepth, temperature } = snotelData.current;
    const newSnow24h = snotelData.newSnow24h;
    const newSnow48h = snotelData.newSnow48h;
    
    if (newSnow24h !== null && newSnow24h > 0) {
      if (newSnow24h >= 12) {
        analysis.push(`POWDER ALERT! ${newSnow24h}" of new snow in the last 24 hours!`);
        powderRating = 5;
      } else if (newSnow24h >= 6) {
        analysis.push(`Fresh powder! ${newSnow24h}" of new snow in the last 24 hours.`);
        powderRating = 4;
      } else if (newSnow24h >= 3) {
        analysis.push(`${newSnow24h}" of new snow in the last 24 hours.`);
        powderRating = 3;
      }
    } else if (newSnow48h !== null && newSnow48h >= 6) {
      analysis.push(`${newSnow48h}" of snow in the last 48 hours.`);
      powderRating = Math.min(3, Math.floor(newSnow48h / 4));
    }
    
    if (snowDepth !== null) {
      analysis.push(`Current snow depth: ${snowDepth}" (base).`);
    }
  }
  
  // Weather forecast analysis
  if (forecast && forecast.length > 0) {
    const today = forecast[0];
    const tomorrow = forecast.length > 2 ? forecast[2] : forecast[1];
    
    const hasSnowToday = today.shortForecast.toLowerCase().includes('snow');
    const hasSnowTomorrow = tomorrow?.shortForecast.toLowerCase().includes('snow');
    
    if (hasSnowToday) {
      analysis.push(`Snow in the forecast today: ${today.shortForecast}`);
      powderRating = Math.max(powderRating, 3);
    }
    if (hasSnowTomorrow && !hasSnowToday) {
      analysis.push(`Snow expected tomorrow - could be a powder day!`);
    }
    
    if (today.temperature < 20) {
      analysis.push(`Cold temperatures (${today.temperature}°F) will keep snow light and dry.`);
    } else if (today.temperature > 40) {
      analysis.push(`Warm temps (${today.temperature}°F) - expect softer conditions by afternoon.`);
    }
    
    const windMph = parseInt(today.windSpeed);
    if (windMph > 30) {
      analysis.push(`High winds (${today.windSpeed}) may affect upper lifts.`);
    }
  }
  
  // Avalanche analysis (backcountry)
  if (avalanche) {
    const alpineDanger = avalanche.danger.alpine;
    if (alpineDanger.includes('Considerable') || alpineDanger.includes('High') || alpineDanger.includes('Extreme')) {
      analysis.push(`⚠️ Avalanche danger is ${alpineDanger} in alpine terrain. Exercise extreme caution in the backcountry.`);
    } else if (alpineDanger.includes('Moderate')) {
      analysis.push(`Avalanche danger is ${alpineDanger} in alpine - be aware if venturing into the backcountry.`);
    }
  }
  
  // Generate recommendation
  if (powderRating >= 4) {
    recommendation = "🎿 SEND IT! Powder day conditions - get there early!";
  } else if (powderRating >= 3) {
    recommendation = "Great conditions! Fresh snow should make for fun skiing.";
  } else if (forecast?.[0]?.temperature < 32 && !forecast?.[0]?.shortForecast.toLowerCase().includes('rain')) {
    recommendation = "Solid conditions expected. Snow should stay firm and fast.";
  } else if (forecast?.[0]?.temperature > 40) {
    recommendation = "Spring skiing vibes - hit it early before things get soft.";
  } else {
    recommendation = "Decent skiing conditions. Have fun out there!";
  }
  
  return {
    summary: analysis.join(' ') || "Typical mountain conditions expected.",
    recommendation,
    powderRating
  };
}

// Main snow endpoint
app.get('/snow', async (req, res) => {
  const resortKey = req.query.resort?.toLowerCase().replace(/[\s-]/g, '_').replace(/['']/g, '');
  
  if (!resortKey) {
    return res.json({
      error: "Please specify a resort. Example: /snow?resort=vail",
      available_resorts: Object.keys(RESORTS)
    });
  }
  
  // Try to match resort
  let resort = RESORTS[resortKey];
  let matchedKey = resortKey;
  
  // Fuzzy match if exact match fails
  if (!resort) {
    const match = Object.entries(RESORTS).find(([key, val]) => 
      key.includes(resortKey) || 
      val.name.toLowerCase().includes(resortKey) ||
      resortKey.includes(key)
    );
    if (match) {
      resort = match[1];
      matchedKey = match[0];
    }
  }
  
  if (!resort) {
    return res.json({
      error: `Resort "${req.query.resort}" not found`,
      available_resorts: Object.keys(RESORTS)
    });
  }
  
  // Fetch all data sources in parallel
  const [forecast, snotelData, avalanche] = await Promise.all([
    getNOAAForecast(resort.lat, resort.lon),
    resort.snotel?.[0] ? getSNOTELData(resort.snotel[0].id, resort.state) : Promise.resolve(null),
    resort.caicZone ? getCAICAvalanche(resort.caicZone) : Promise.resolve(null)
  ]);
  
  const analysis = analyzeConditions(forecast, snotelData, avalanche, resort);
  
  // Build response
  const response = {
    resort: resort.name,
    state: resort.state,
    elevation: resort.elevation,
    terrain: resort.terrain,
    
    // Current conditions from SNOTEL
    snow_conditions: snotelData ? {
      source: resort.snotel[0].name + ' SNOTEL',
      snow_depth: snotelData.current?.snowDepth ? `${snotelData.current.snowDepth}"` : 'N/A',
      new_snow_24h: snotelData.newSnow24h !== null ? `${snotelData.newSnow24h}"` : 'N/A',
      new_snow_48h: snotelData.newSnow48h !== null ? `${snotelData.newSnow48h}"` : 'N/A',
      snow_water_equivalent: snotelData.current?.snowWaterEquivalent ? `${snotelData.current.snowWaterEquivalent}"` : 'N/A',
      temperature: snotelData.current?.temperature ? `${snotelData.current.temperature}°F` : 'N/A'
    } : null,
    
    // Weather forecast from NOAA
    weather: forecast ? {
      current: {
        period: forecast[0].name,
        temperature: `${forecast[0].temperature}°${forecast[0].temperatureUnit}`,
        conditions: forecast[0].shortForecast,
        wind: `${forecast[0].windSpeed} ${forecast[0].windDirection}`,
        precipitation_chance: `${forecast[0].probabilityOfPrecipitation}%`,
        detailed: forecast[0].detailedForecast
      },
      outlook: forecast.slice(1, 4).map(f => ({
        period: f.name,
        temperature: `${f.temperature}°${f.temperatureUnit}`,
        conditions: f.shortForecast,
        precipitation_chance: `${f.probabilityOfPrecipitation}%`
      }))
    } : null,
    
    // Avalanche info from CAIC (Colorado only)
    avalanche: avalanche ? {
      zone: avalanche.zone,
      danger_alpine: avalanche.danger.alpine,
      danger_treeline: avalanche.danger.treeline,
      danger_below_treeline: avalanche.danger.belowTreeline,
      problems: avalanche.problems,
      summary: avalanche.summary,
      forecaster: avalanche.forecaster
    } : (resort.state === 'CO' ? { note: 'CAIC data temporarily unavailable' } : { note: 'Check Utah Avalanche Center for backcountry conditions' }),
    
    // Analysis and recommendation
    analysis: {
      summary: analysis.summary,
      recommendation: analysis.recommendation,
      powder_rating: `${analysis.powderRating}/5`
    },
    
    updated: new Date().toISOString()
  };
  
  res.json(response);
});

// List all resorts
app.get('/resorts', (req, res) => {
  res.json({
    resorts: Object.entries(RESORTS).map(([key, val]) => ({
      id: key,
      name: val.name,
      state: val.state,
      elevation: val.elevation,
      snotel_station: val.snotel?.[0]?.name || 'N/A'
    }))
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0.0', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Snow Phone API',
    version: '2.0.0',
    description: 'Real-time ski resort conditions from NOAA, SNOTEL, and CAIC',
    endpoints: {
      '/snow?resort=vail': 'Get snow conditions for a resort',
      '/resorts': 'List all supported resorts',
      '/health': 'Health check'
    },
    data_sources: [
      'NOAA/NWS - Weather forecasts',
      'SNOTEL/NRCS - Snow depth and water equivalent',
      'CAIC - Colorado avalanche conditions'
    ]
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Snow Phone API v2.0 running on port ${PORT}`);
  });
}

// Export for Vercel
export default app;
