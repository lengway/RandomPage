# Random User Dashboard
Express backend + vanilla JS frontend that renders four cards (User, Country, Exchange Rates, News) using data from public APIs.

## Stack
- Node.js 18 + Express (`server/`)
- Static HTML/CSS/JS frontend (`public/`)
- Axios for outbound HTTP requests
- Environment variables stored in `.env`

## Requirements
- Node.js 18 or newer
- File `server/.env` with:
  ```
  COUNTRYLAYER_APIKEY=<unused placeholder>
  EXCHANGERATEAPI_APIKEY=<your key>
  NEWSAPI_APIKEY=<your key>
  ```

## Install & Run
```bash
cd AS2/server
npm install
npm run dev
```
Open http://localhost:3000 and click "Get random user".

## Project Structure
- `server/index.js` – Express routes `/api/random-user`, `/api/country-full-info`, `/api/exchange-rate`, `/api/news`.
- `server/package.json` – npm scripts/dependencies (the parent folder does not need its own node_modules).
- `public/index.html` – markup for the four dashboard cards.
- `public/main.js` – sequential fetch flow with AbortController, skeleton loaders, and per-card error states.
- `public/style.css` – simple fixed layout without responsive breakpoints.

## External Services
- **randomuser.me** – returns the random person (name, location, image) displayed in the User card.
- **restcountries.com v3** – provides capital, languages, currency, and flag for the detected country.
- **v6.exchangerate-api.com** – fetches FX rates for the country currency (USD and EUR shown).
- **newsapi.org** – supplies top headlines filtered by the country's CCA2 code.

## Notes
- Always start the server from `AS2/server`; the root folder stays dependency-free.
- Missing ExchangeRate or News API keys result in inline error cards instead of data.
# Random User Dashboard
Simple Express + vanilla JS dashboard that calls multiple public APIs and displays the results in four cards (user, country, exchange rates, news).

## Stack
- Node.js + Express server (in `server/`)
- Static frontend (`public/`): HTML/CSS/JS without frameworks
- Axios for outbound HTTP calls
- .env for API keys

## Requirements
- Node.js 18+
- API keys stored in `server/.env`:
  ```
  COUNTRYLAYER_APIKEY=<your key if you want to use it>
  EXCHANGERATEAPI_APIKEY=<your key>
  NEWSAPI_APIKEY=<your key>
  ```

## Install & Run
````bash
# inside AS2/server
npm install
npm run dev