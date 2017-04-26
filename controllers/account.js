const mongoose = require('mongoose');
const User = require('mongoose').model('User');
const encryption = require('././../utilities/encryption');
const Category = mongoose.model('Category');
const Handlebars = require('hbs');
const Tag = mongoose.model('Tag');
const Article = require('mongoose').model('Article');

module.exports ={

    accountGet: (req, res) => {
        let id = req.params.id;

        User.findById(id).then(user =>{

                res.render('account/account', user)
            })

    },

    accountPost: (req, res) =>{
        let id = req.params.id;
        let userArgs = req.body;
        let reg = /[a-zA-z0-9.!@#$%^&*]+@[a-zA-z0-9.!@#$%^&*]+[.][a-zA-z0-9.!@#$%^&*]+/g;

        User.findById(id).then(user => {
            user.isInRole('Admin').then(isAdmin =>{
                user.isAdmin = isAdmin;});

            let errorMsg = '';

            if(!userArgs.email){
                errorMsg = 'Email cannot be null!';
            }else if(userArgs.password !== userArgs.confirmedPassword){
                errorMsg = 'Passwords do not match!';
            } else if(!userArgs.email.match(reg)) {

                errorMsg='Invalid Email Address!';
            }

            if(errorMsg){
                userArgs.error = errorMsg;
                res.render('account/account', userArgs);
            }else{
                    User.findOne({_id: id}).then(user =>{
                        user.email = userArgs.email;

                        let passwordHash = user.passwordHash;
                        if(userArgs.password){
                            passwordHash = encryption.hashPassword(userArgs.password, user.salt);
                        }

                        user.passwordHash = passwordHash;


                        User.update({_id: id}, {$set: {email: user.email, passwordHash: user.passwordHash}});
                        user.save((err) =>{
                            if(err){
                                res.redirect('/');
                            }else{
                                res.redirect('/')
                            }
                        })
                    })
            }
        })
    },
    articlesGet: (req, res) => {
        let id = req.user.id;

        User.findById(id).then(user => {

            Article.find({author: user}).limit(8).populate('author tags').then(articles => {
                res.render('account/articles', {articles: articles, author: user.fullName});
            })
        });

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