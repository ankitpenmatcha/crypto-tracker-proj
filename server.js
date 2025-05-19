require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

// routers (we’ll build these next)
const apiPricesRouter = require('./routes/apiPrices');
const watchlistRouter = require('./routes/watchlist');
const homeRouter = require('./routes/home');

const app = express();
const PORT = process.env.PORT || 3000;

// connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB error:', err));

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// home page
app.use('/', homeRouter);

// mount routers
app.use('/api/prices', apiPricesRouter);
app.use('/watchlist', watchlistRouter);

app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
