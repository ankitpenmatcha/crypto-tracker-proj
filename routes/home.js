const express = require('express');
const axios   = require('axios');
const router  = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data: topCoins } = await axios.get(
      'https://api.coingecko.com/api/v3/coins/markets',
      { params: {
          vs_currency: 'usd',
          order:       'market_cap_desc',
          per_page:    10,
          page:        1
      }}
    );
    res.render('home', { topCoins });
  } catch (err) {
    console.error(err);
    res.render('home', { topCoins: [] });
  }
});

module.exports = router;
