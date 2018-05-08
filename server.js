var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require('path');

var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");
// var PORT = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// mongoose.connect("mongodb://mail4inom:86azamat@ds215380.mlab.com:15380/inom");
// mongoose.connect("mongodb://localhost/testdb");
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

app.get("/scrape", function (req, res) {
  axios.get("https://www.nytimes.com/section/politics?action=click&pgtype=Homepage&region=TopBar&module=HPMiniNav&contentCollection=Politics&WT.nav=page").then(function (response) {

    var $ = cheerio.load(response.data);

    $("article.story").each(function (i, element) {
      var result = {};

      result.title = $(this)
        .children(".story-body").find('.headline')
        .text().trim();
    
      result.description = $(this)
        .children(".story-body").find('.summary')
        .text().trim();
      
      result.link = $(this)
        .children(".story-body").find('a')
        .attr('href').trim();

      result.img = $(this)
        .children(".story-body").find('img')
        .attr('src').trim();

      result.byline = $(this)
        .children(".story-body").find('.byline')
        .text();

      result.time = $(this)
        .children(".story-footer").find('time')
        .text();

      db.Article.create(result)
        .then(function (dbArticle) {
          console.log('IN DATABASE: ', dbArticle);
        })
        .catch(function (err) {
          console.log(err);
        });
    });

    res.send("Scrape Complete");
    res.render("index", {articles: dbArticle});
  });
});



app.get("/", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      // res.json(dbArticle);
  console.log('DB ARTICLE: ',dbArticle)
  
      res.render('index', {articles: dbArticle});
    })

});


app.post("/save/:id", function(req, res) {
	db.Article.findById(req.params.id, function(err, data) {
		if (data.issaved) {
			db.Article.findByIdAndUpdate(req.params.id, {$set: {issaved: false, status: "Save Article"}}, {new: true}, function(err, data) {
				res.redirect("/saved");
			});
		}
		else {
			db.Article.findByIdAndUpdate(req.params.id, {$set: {issaved: true, status: "Saved"}}, {new: true}, function(err, data) {
				res.redirect("/saved");
			});
		}
	});
});

app.get("/saved", function(req, res) {
	db.Article.find({issaved: true}, null, {sort: {created: -1}}, function(err, data) {
		if(data.length === 0) {
			res.render("saved", {message: "You have not saved any articles yet. Try to save some delicious news by simply clicking \"Save Article\"!"});
		}
		else {
			res.render("saved", {saved: data});
		}
	});
});


// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({_id: req.params.id})
  .populate("note")  
  .then(function(dbArticle){
    res.json(dbArticle);
  }).catch(function(err){
    res.json(err);
  })
  // TODO
  // ====
  // Finish the route so it finds one article using the req.params.id,
  // and run the populate method with "note",
  // then responds with the article with the note included
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
  .then(function(dbNote){
    return db.Article.findByIdAndUpdate({_id: req.params.id}, {note: dbNote._id}, {new: true})
  }).then(function(dbArticle){
    res.json(dbArticle);
  }).catch(function(err){
    res.json(err);
  })
  // TODO
  // ====
  // save the new note that gets posted to the Notes collection
  // then find an article from the req.params.id
  // and update it's "note" property with the _id of the new note

})

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});

