const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  userEmail:    { type: String, required: true },
  coinId:       { type: String, required: true },
  coinName:     { type: String, required: true },
  targetPrice:  { type: Number, required: true },
  initialPrice: { type: Number, required: true },
  createdAt:    { type: Date,   default: Date.now }
});

module.exports = mongoose.model('WatchlistItem', watchlistSchema);
