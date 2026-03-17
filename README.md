# Snow Report Hotline 🎿❄️

A voice-powered ski conditions hotline for Colorado and Utah resorts, powered by Telnyx AI Assistants with **LIVE real-time data**.

## 📞 Call the Hotline

**+1 (970) 617-1169**

Call to get **live snow conditions** for:
- **Colorado:** Vail, Beaver Creek, Breckenridge, Keystone, A-Basin, Copper Mountain, Winter Park, Steamboat, Aspen/Snowmass, Telluride
- **Utah:** Deer Valley, Park City

## 🔄 Real-Time Data Sources

The API aggregates live data from multiple sources:

1. **NOAA/NWS** - Weather forecasts by GPS coordinates
2. **SNOTEL/NRCS** - Snow depth, snow water equivalent, temperature (updated daily)
3. **CAIC (Colorado Avalanche Information Center)** - Avalanche danger ratings and forecasts

## API Endpoints

```bash
# Get conditions for a resort
GET /snow?resort=vail

# List all supported resorts
GET /resorts

# Health check
GET /health
```

### Example Response

```json
{
  "resort": "Vail",
  "state": "CO",
  "elevation": "11,570 ft",
  "terrain": "5,317 acres",
  "snow_conditions": {
    "source": "Vail Mountain SNOTEL",
    "snow_depth": "31\"",
    "new_snow_24h": "3\"",
    "new_snow_48h": "8\"",
    "snow_water_equivalent": "9.4\"",
    "temperature": "29°F"
  },
  "weather": {
    "current": {
      "period": "Today",
      "temperature": "38°F",
      "conditions": "Partly Cloudy",
      "wind": "10 mph W",
      "precipitation_chance": "20%"
    }
  },
  "avalanche": {
    "zone": "Vail & Summit County",
    "danger_alpine": "Considerable (3)",
    "danger_treeline": "Moderate (2)",
    "danger_below_treeline": "Low (1)",
    "problems": ["persistentSlab", "windSlab"]
  },
  "analysis": {
    "summary": "3\" of new snow! Current depth: 31\"...",
    "recommendation": "Fresh powder - great conditions!",
    "powder_rating": "3/5"
  }
}
```

## Deployment

### Render (Recommended)

1. Connect GitHub repo to Render
2. Create new Web Service
3. Select this repo
4. Use `render.yaml` for config

### Vercel

```bash
vercel --prod
```

### Local Development

```bash
npm install
npm run dev
# API at http://localhost:3000
```

### Expose Local for Testing

```bash
cloudflared tunnel --url http://localhost:3000
# Or
npx localtunnel --port 3000
```

## Telnyx Configuration

- **Assistant ID:** `assistant-00aeeaab-6f8c-4eb8-b068-8eabc1a07e5a`
- **Phone Number:** `+19706171169`
- **Model:** `moonshotai/Kimi-K2.5`
- **Voice:** `Rime.ArcanaV3.walnut`
- **Function Calling:** HTTP tool calling `/snow` endpoint

### Update Assistant Function URL

When deploying to a new URL, update the assistant:

```bash
curl -X PATCH "https://api.telnyx.com/v2/ai/assistants/assistant-00aeeaab-6f8c-4eb8-b068-8eabc1a07e5a" \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tools": [{
      "type": "http",
      "http": {
        "name": "get_snow_conditions",
        "description": "Get live snow conditions for a ski resort",
        "method": "GET",
        "url": "YOUR_DEPLOYED_URL/snow",
        "query_params": [{
          "name": "resort",
          "type": "string",
          "description": "Resort name",
          "required": true
        }],
        "timeout_ms": 10000
      }
    }]
  }'
```

## SNOTEL Station Mapping

| Resort | SNOTEL Station | ID |
|--------|---------------|-----|
| Vail/Beaver Creek | Vail Mountain | 842 |
| Breckenridge/Keystone | Hoosier Pass | 531 |
| A-Basin | Grizzly Peak | 485 |
| Copper Mountain | Copper Mountain | 415 |
| Winter Park | Berthoud Summit | 335 |
| Steamboat | Rabbit Ears | 709 |
| Aspen | Independence Pass | 542 |
| Telluride | Lizard Head Pass | 586 |
| Park City/Deer Valley | Thaynes Canyon | 766 |

## GitHub

Repository: https://github.com/harrisonf-telnyx/snow-phone-api

---

Built by Lamar 🤖 for Harrison's demo
