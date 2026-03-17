# Snow Report Hotline 🎿❄️

A voice-powered ski conditions hotline for Colorado and Utah resorts, powered by Telnyx AI Assistants.

## 📞 Call the Hotline

**+1 (970) 617-1169**

Call to get snow conditions, forecasts, and recommendations for:
- **Colorado:** Vail, Beaver Creek, Breckenridge, Keystone, A-Basin, Copper Mountain, Winter Park, Steamboat, Aspen/Snowmass, Telluride
- **Utah:** Deer Valley, Park City

## Architecture

### Current MVP (v1)
- **Telnyx AI Assistant** with built-in knowledge about ski conditions
- Natural conversation handling via Kimi-K2.5 model
- Voice interaction via Inworld.Max.Johanna TTS

### Future Enhancement (v2) - Backend API Ready
The `index.js` file contains a Node.js API that pulls real-time data from NOAA:

```bash
# Test locally
npm install
npm start

# Endpoints
GET /snow?resort=vail     # Get conditions for a resort
GET /resorts              # List all supported resorts
GET /health               # Health check
```

To connect to the assistant with function calling:
1. Deploy the API (Render, Vercel, Railway)
2. Add a function tool to the assistant that calls the `/snow` endpoint
3. The assistant can then provide real-time weather data

## Telnyx Configuration

- **Assistant ID:** `assistant-00aeeaab-6f8c-4eb8-b068-8eabc1a07e5a`
- **Phone Number:** `+19706171169`
- **Model:** `moonshotai/Kimi-K2.5`
- **Voice:** `Inworld.Max.Johanna`

### Update the Assistant

```bash
# List assistants
telnyx assistant list

# Get details
telnyx assistant get assistant-00aeeaab-6f8c-4eb8-b068-8eabc1a07e5a
```

### Add Function Calling (Future)

Via API:
```bash
curl -X PATCH "https://api.telnyx.com/v2/ai/assistants/assistant-00aeeaab-6f8c-4eb8-b068-8eabc1a07e5a" \
  -H "Authorization: Bearer $TELNYX_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tools": [{
      "type": "function",
      "function": {
        "name": "get_snow_conditions",
        "description": "Get current snow conditions for a ski resort",
        "parameters": {
          "type": "object",
          "properties": {
            "resort": {
              "type": "string",
              "description": "Resort name (e.g., vail, breckenridge)"
            }
          },
          "required": ["resort"]
        },
        "url": "https://your-api-url.com/snow"
      }
    }]
  }'
```

## Data Sources

The backend API uses:
- **NOAA/NWS API** (free, no key required) - Weather forecasts by GPS coordinates
- Resort coordinates mapped for all supported mountains

## Files

- `index.js` - Express API server for snow conditions
- `package.json` - Node.js dependencies
- `render.yaml` - Render deployment config
- `vercel.json` - Vercel deployment config

## GitHub

Repository: https://github.com/harrisonf-telnyx/snow-phone-api

## Next Steps

1. Deploy the API to a public URL
2. Add function calling to the assistant
3. Enhance with more data sources (OpenSnow, SNOTEL)
4. Add avalanche conditions from CAIC
5. Consider adding SMS support for text-based reports

---

Built by Lamar 🤖 for Harrison's demo
