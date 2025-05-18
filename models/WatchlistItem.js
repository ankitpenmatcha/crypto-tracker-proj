const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  coinId:       { type: String, required: true },   // e.g. "bitcoin"
  coinName:     { type: String, required: true },   // e.g. "Bitcoin"
  targetPrice:  { type: Number, required: true },   // the alert threshold
  initialPrice: { type: Number, required: true },   // price at the moment of adding
  createdAt:    { type: Date,   default: Date.now }
});

module.exports = mongoose.model('WatchlistItem', watchlistSchema);
