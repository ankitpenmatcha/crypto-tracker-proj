const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/prices/:coinId → { coinId, price }
router.get('/:coinId', async (req, res) => {
  const { coinId } = req.params;
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      { params: { ids: coinId, vs_currencies: 'usd' } }
    );
    const data = response.data[coinId];
    if (!data) return res.status(404).json({ error: 'Coin not found' });
    res.json({ coinId, price: data.usd });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching price' });
  }
});

module.exports = router;
