// var logger = require("morgan");
var express = require("express");
var mongoose = require("mongoose");
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");
// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware
//===========================
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scrapeNews";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes

// Scrape Route
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  axios.get("http://www.nytimes.com/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    $("article").each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      
      if ($(element).find("h2").text()) {
        result.title = $(element).find("h2").text();
      }
      else if ($(element).find("span").text()) {
        result.title = $(element)
          .find("span")
          .text();
      }
      result.link = "http://www.nytimes.com" + $(element)
        .find("a")
        .attr("href");
      if ($(element).find("li").text()) {
        result.summary = $(element)
          .find("li")
          .text();
      }
      else if ($(element).find("p").text()) {
        result.summary = $(element)
          .find("p")
          .text();
      }
      else {
        result.summary = "No Summary";
      }

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, log it
          console.log(err);
        });

    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  console.log("get articles running")
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for finding Article by id
app.get("/articles/:id", function (req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for updating Article Note
app.post("/articles/:id", function (req, res) {
  db.Note.create(req.body)
    .then(function (dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Route for removing all documents from collection
app.delete("/remove", function(req, res) {
  console.log("Server Told To Remove")
  db.Article.deleteMany({})
    .then(function() {
      res("articles deleted")
    })
    .catch(function(err) {
      res.json(err)
    })
})

// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});