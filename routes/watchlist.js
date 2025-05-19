const express = require('express');
const axios = require('axios');
const WatchlistItem = require('../models/WatchlistItem');
const router = express.Router();
const CG_DEMO_KEY = process.env.CG_DEMO_API_KEY;
const CG_BASE    = 'https://api.coingecko.com/api/v3';
const CG_HEADERS = { 'x-cg-demo-api-key': CG_DEMO_KEY };

// GET /watchlist?email=you@host.com
router.get('/', async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.redirect('/');
  }

  try {
    const items = await WatchlistItem
      .find({ userEmail: email })
      .sort({ createdAt: -1 });

    let itemsWithPrice = [];
    if (items.length) {
      const ids = items.map(i => i.coinId).join(',');
      const priceRes = await axios.get(
        `${CG_BASE}/simple/price`,
        {
          params: { ids, vs_currencies: 'usd' },
          headers: CG_HEADERS
        }
      );
      const priceData = priceRes.data;

      itemsWithPrice = items.map(item => ({
        ...item.toObject(),
        currentPrice: priceData[item.coinId]?.usd ?? null
      }));
    }

    res.render('watchlist', {
      items: itemsWithPrice,
      email
    });
  } catch (err) {
    if (err.response?.status === 429) {
      console.warn('API rate limit, rendering without current prices');
    } else {
      console.error(err);
      return res.status(500).send('Server error');
    }
    console.error(err);
    res.status(500).send('Server error');
  }
});

// POST /watchlist  (body: { email, coinId, coinName, targetPrice })
router.post('/', async (req, res) => {
  const { email, coinId, targetPrice } = req.body;
  try {
    const marketRes = await axios.get(
      `${CG_BASE}/coins/markets`,
      {
        params: {
          vs_currency: 'usd',
          ids: coinId,
          per_page: 1,
          page: 1
        },
        headers: CG_HEADERS
      }
    );
    const [coinData] = marketRes.data;
    if (!coinData) {
      return res.status(404).send('Coin not found');
    }

    const newItem = new WatchlistItem({
      userEmail: email,
      coinId: coinData.id,
      coinName: coinData.name,
      targetPrice: Number(targetPrice),
      initialPrice: coinData.current_price
    });

    await newItem.save();
    res.redirect(`/watchlist?email=${encodeURIComponent(email)}`);
  } catch (err) {
    if (err.response?.status === 429) {
      return res.status(429).send('API rate limit exceeded. Please wait a minute and try again.');
    }
    console.error(err);
    res.status(500).send('Server error');
  }
});

// POST /watchlist/delete/:id  (body: { email })
router.post('/delete/:id', async (req, res) => {
  const email = req.body.email;
  try {
    await WatchlistItem.findByIdAndDelete(req.params.id);
    res.redirect(`/watchlist?email=${encodeURIComponent(email)}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
