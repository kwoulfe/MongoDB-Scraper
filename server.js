// = Requirements ================================================================
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var request = require('request');
var cheerio = require('cheerio');

var PORT = process.env.PORT || 3030;

// = Middleware (pass everything through the logger first) ================================================
app.use(logger('dev'));
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(express.static('public')); // (create a public folder and land there)

// = Database configuration ================================================
mongoose.connect('mongodb://127.0.0.1:27017/mongoScraper');
var db = mongoose.connection;

db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});
db.once('open', function() {
  console.log('Mongoose connection successful.');
});

// = Require Schemas ================================================================
var Note = require('./models/Note.js');
var Article = require('./models/Article.js');

// = Routes ================================================================
app.get('/', function(req, res) {
  res.send(index.html);
});

app.get('/scrape', function(req, res) {
  request('https://www.pinkbike.com/', function(error, response, html) {
    var $ = cheerio.load(html);
    $('div.news-box2').each(function(i, element) {
      var result = {};

      result.title = $(this)
        .children('a')
        .text();
      result.summary = $(this)
        .children('div.news-mt3')
        .text();

      var entry = new Article(result);

      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        } else {
          console.log(doc);
        }
      });
    });
  });
  res.send('Scrape Complete');
});

app.get('/articles', function(req, res) {
  Article.find({}, function(err, doc) {
    if (err) {
      console.log(err);
    } else {
      res.json(doc);
    }
  });
});

app.get('/articles/:id', function(req, res) {
  Article.findOne({ _id: req.params.id })
    .populate('note')
    .exec(function(err, doc) {
      if (err) {
        console.log(err);
      } else {
        res.json(doc);
      }
    });
});

app.post('/articles/:id', function(req, res) {
  var newNote = new Note(req.body);

  newNote.save(function(err, doc) {
    if (err) {
      console.log(err);
    } else {
      Article.findOneAndUpdate({ _id: req.params.id }, { note: doc._id }).exec(
        function(err, doc) {
          if (err) {
            console.log(err);
          } else {
            res.send(doc);
          }
        }
      );
    }
  });
});

app.listen(PORT, function() {
  console.log('App running on port 3030!');
});
