const express = require('express');
const axios = require('axios');
const router = express.Router();
const CG_DEMO_KEY = process.env.CG_DEMO_API_KEY;
const CG_BASE    = 'https://api.coingecko.com/api/v3';
const CG_HEADERS = { 'x-cg-demo-api-key': CG_DEMO_KEY };

// GET /api/prices/:coinId → { coinId, price }
router.get('/:coinId', async (req, res) => {
  const { coinId } = req.params;
  try {
    const response = await axios.get(
      `${CG_BASE}/simple/price`,
      {
        params: { ids: coinId, vs_currencies: 'usd' },
        headers: CG_HEADERS
      }
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
