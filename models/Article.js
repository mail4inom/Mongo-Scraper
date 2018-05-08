var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({

  title: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
 
  byline: {
    type: String,
    required: false
  },

  link: {
    type: String,
    required: false
  },
  img: {
    type: String,
    required: false
  },
  time: {
    type: String,
    required: false
  },
  issaved: {
		type: Boolean,
		default: false
  },
  status: {
		type: String,
		default: "Save Article"
  },
  created: {
		type: Date,
		default: Date.now
	},

  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;
