const express = require('express');
const axios   = require('axios');
const WatchlistItem = require('../models/WatchlistItem');
const router  = express.Router();

// GET /watchlist?email=you@host.com
router.get('/', async (req, res) => {
  const email = req.query.email;
  if (!email) {
    // no email → just redirect back to home
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
        'https://api.coingecko.com/api/v3/simple/price',
        { params: { ids, vs_currencies: 'usd' } }
      );
      const priceData = priceRes.data;

      itemsWithPrice = items.map(item => ({
        ...item.toObject(),
        currentPrice: priceData[item.coinId]?.usd ?? null
      }));
    }

    res.render('watchlist', {
      items: itemsWithPrice,
      email  // pass email so EJS can include it in forms
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// POST /watchlist  (body: { email, coinId, coinName, targetPrice })
router.post('/', async (req, res) => {
  const { email, coinId, targetPrice } = req.body;
  try {
    // 1) hit the markets endpoint for both name + price
    const marketRes = await axios.get(
      'https://api.coingecko.com/api/v3/coins/markets',
      {
        params: {
          vs_currency: 'usd',
          ids: coinId,
          per_page: 1,
          page: 1
        }
      }
    );
    const [coinData] = marketRes.data;
    if (!coinData) {
      return res.status(404).send('Coin not found');
    }

    const newItem = new WatchlistItem({
      userEmail:    email,
      coinId:       coinData.id,            // echo back the id
      coinName:     coinData.name,          // fetched for you
      targetPrice:  Number(targetPrice),
      initialPrice: coinData.current_price  // fetched
    });

    await newItem.save();
    res.redirect(`/watchlist?email=${encodeURIComponent(email)}`);
  } catch (err) {
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
