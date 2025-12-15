const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;

const COUNTRYLAYER_APIKEY = process.env.COUNTRYLAYER_APIKEY;
const EXCHANGERATEAPI_APIKEY = process.env.EXCHANGERATEAPI_APIKEY;
const NEWSAPI_APIKEY = process.env.NEWSAPI_APIKEY;

let userCountry = null;
let countryCurrencyCode = null;
let countryCCA2 = null;

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/api/random-user", async (req, res) => {
  try {
    const response = await axios.get("https://randomuser.me/api/");
    const user = response.data.results[0];

    const cleanedUser = {
      firstName: user.name.first,
      lastName: user.name.last,
      gender: user.gender,
      age: user.dob.age,
      dateOfBirth: user.dob.date,
      city: user.location.city,
      country: user.location.country,
      address: `${user.location.street.name} ${user.location.street.number}`,
      picture: user.picture.large,
    };

    res.json(cleanedUser);
    userCountry = cleanedUser.country;
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch random user",
    });
  }
});

// this endpoint to countrylayer do not provides info that was in assignment, only name and capital
app.get("/api/country-info", async (req, res) => {
    try {
      const response = await axios.get(`https://api.countrylayer.com/v2/name/${userCountry}?access_key=${COUNTRYLAYER_APIKEY}`);
      const countryData = response.data[0];

      const cleanedCountryInfo = {
        name: countryData.name,
        capital: countryData.capital,
      };

      res.json(cleanedCountryInfo);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to fetch country info",
      });
    }
});

// another endpoint to restcountries to provide full country info
app.get("/api/country-full-info", async (req, res) => {
  try {
    const response = await axios.get(`https://restcountries.com/v3.1/name/${userCountry}`);
    const countryData = response.data[0];

    const cleanedCountryInfo = {
      name: countryData.name.common,
      capital: countryData.capital,
      languages: countryData.languages,
      currency: Object.keys(countryData.currencies)[0] || "N/A: No currency found",
      flags: countryData.flags.png,
    };

    res.json(cleanedCountryInfo);
    countryCurrencyCode = cleanedCountryInfo.currency;
    countryCCA2 = countryData.cca2.toLowerCase();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch country info",
    });
  }
});

app.get("/api/exchange-rate", async (req, res) => {
  try {
    const response = await axios.get(`https://v6.exchangerate-api.com/v6/${EXCHANGERATEAPI_APIKEY}/latest/${countryCurrencyCode}`);
    const exchangeData = response.data;

    const exchangeRateInfo = {
      usd: exchangeData.conversion_rates.USD,
      eur: exchangeData.conversion_rates.EUR,
    };

    res.json(exchangeRateInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch exchange rate",
    });
  }
});

app.get("/api/news", async (req, res) => {
  try {
    const response = await axios.get(`https://newsapi.org/v2/top-headlines`, {
      params: {
        country: countryCCA2,
        apiKey: NEWSAPI_APIKEY
      }
    });
    const news = response.data.articles.map(article => ({
      title: article.title,
      image: article.urlToImage,
      description: article.description,
      url: article.url,
      source: article.source.name,
    }));

    res.json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch news",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});