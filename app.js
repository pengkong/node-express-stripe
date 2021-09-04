const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const stripe = require('stripe')('sk_test_bQZ7eu2dHZEio53jCaOv5fZA');

var app = express();

// view engine setup (Handlebars)
app.engine('hbs', exphbs({
  helpers: {
      divide: function (x, y) { return x / y; }
  },
  defaultLayout: 'main',
  extname: '.hbs'
}));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())

/**
 * Home route
 */
app.get('/', function(req, res) {
  res.render('index');
});

/**
 * Checkout route
 */
app.get('/checkout', function(req, res) {
  // Just hardcoding amounts here to avoid using a database
  const item = req.query.item;
  let title, amount, error;

  switch (item) {
    case '1':
      title = "The Art of Doing Science and Engineering"
      amount = 2300
      break;
    case '2':
      title = "The Making of Prince of Persia: Journals 1985-1993"
      amount = 2500
      break;
    case '3':
      title = "Working in Public: The Making and Maintenance of Open Source"
      amount = 2800
      break;
    default:
      // Included in layout view, feel free to assign error
      error = "No item selected"      
      break;
  }

  res.render('checkout', {
    item : item,
    title: title,
    amount: amount,
    error: error
  });
});

const calculateOrderAmount = items => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  switch (items[0].id) {
    case '1':
      return 2300;
      break;
    case '2':
      return 2500;
      break;
    case '3':
      return 2800;
      break;
  }
};
app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "usd"
  });
  res.send({
    clientSecret: paymentIntent.client_secret
  });
});

/**
 * Success route
 */
app.get('/success', async function(req, res) {
  const pi = req.query.pi;
  const paymentIntent = await stripe.paymentIntents.retrieve(pi);
  res.render('success', paymentIntent);
});

/**
 * Start server
 */
app.listen(3000, () => {
  console.log('Getting served on port 3000');
});
