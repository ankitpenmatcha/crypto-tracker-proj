const express = require('express');
const axios = require('axios');
const router = express.Router();
const CG_DEMO_KEY = process.env.CG_DEMO_API_KEY;
const CG_BASE    = 'https://api.coingecko.com/api/v3';
const CG_HEADERS = { 'x-cg-demo-api-key': CG_DEMO_KEY };

router.get('/', async (req, res) => {
  try {
    const { data: topCoins } = await axios.get(
      `${CG_BASE}/coins/markets`,
      {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 10,
          page: 1
        },
        headers: CG_HEADERS
      }
    );
    res.render('home', { topCoins });
  } catch (err) {
    console.error(err);
    res.render('home', { topCoins: [] });
  }
});

module.exports = router;
