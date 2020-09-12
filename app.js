
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const expressLayouts = require("express-ejs-layouts");


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  secret: 'seCReT',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 3600000 }
}));

app.use(express.static('public'));
app.use(expressLayouts);
app.set("view engine", "ejs");




app.use('/', require('./routes/index.js'));

app.use('/user1', require('./routes/user1.js'));
app.use('/user2', require('./routes/user2.js'));


app.get('*', (req, res) => {
  res.status(404).render('404');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));

