const mongoose = require('mongoose');
const Article = mongoose.model('Article');
const Handlebars = require('hbs');

module.exports = {
  index: (req, res) => {
      Article.find({}).limit(8).populate('author').then(articles => {
          res.render('home/index', {articles: articles});
      }),

      Handlebars.registerHelper('substring', function( string, start, end ) {

          let theString = string.substring( start ,end );

          // attach dot dot dot if string greater than suggested end point
          if( string.length > end ) {
              theString += '...';
          }

          return new Handlebars.SafeString(theString);
      });

  }
};