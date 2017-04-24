const mongoose = require('mongoose');
const Article = mongoose.model('Article');
const User = mongoose.model('User');
const Category = mongoose.model('Category');
const Handlebars = require('hbs');
const Tag = mongoose.model('Tag');
module.exports = {
  index: (req, res) => {
      Category.find({}).then(categories => {
          res.render('home/index', {categories: categories});
      })
  },

    listCategoryArticles: (req, res) =>{
      let id = req.params.id;

      Category.findById(id).populate('articles').then(category =>{
          User.populate(category.articles,{path: 'author'}, (err) =>{
              if(err){
                  console.log(err.message);
              }
                Tag.populate(category.articles, {path: 'tags'}, (err)=>{
                    if(err){
                        console.log(err.message);
                    }
                })
              res.render('home/article', {articles: category.articles})
          });
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