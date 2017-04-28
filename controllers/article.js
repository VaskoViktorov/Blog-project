const Article = require('mongoose').model('Article');
const Category = require('mongoose').model('Category');
const User = require('mongoose').model('User');
const initializeTags = require('./../models/Tag').initializeTags;
const Comment = require('./../models/Comment');

module.exports = {
    createGet: (req, res) =>{
        if(!req.isAuthenticated()){
            let returnUrl = '/article/create';
            req.session.returnUrl = returnUrl;

            res.redirect('user/login');
            return;
        }

        Category.find({}).then(categories =>{
            res.render('article/create', {categories: categories});
        })
    },

    createPost: (req, res) =>{
        let articleArgs = req.body;

        let errorMsg = '';

        if(!req.isAuthenticated()){
            errorMsg = 'You should be logged in to make articles!'
        } else if(!articleArgs.title){
            errorMsg = 'Invalid title!';
        } else if(!articleArgs.content){
            errorMsg = 'Invalid content!';
        }

        if(errorMsg){
            res.render('article/create', {error: errorMsg});
            return;
        }

        let image = req.files.image;

        if(image){

            let filenameAndExtension = image.name;

            let filename = filenameAndExtension.substring(0, filenameAndExtension.lastIndexOf('.'));
            let extension = filenameAndExtension.substring(filenameAndExtension.lastIndexOf('.')+1);

            if(extension === 'png' || extension === 'jpg' || extension === 'gif'){

            let randomChars = require('./../utilities/encryption').generateSalt().substring(0,5).replace(/\//g, 'x');
            let finalFileName = `${filename}_${randomChars}.${extension}`;
            image.mv(`./public/images/${finalFileName}`, err =>{

                if(err){
                    console.log(err.message);
                }
            });

            articleArgs.imagePath = `/images/${finalFileName}`;

        }else{
            errorMsg = 'Only .png, .jpg and .gif are accepted!';
            res.render('article/create', {error: errorMsg});
            return;
        }}

        articleArgs.edit = false;
        articleArgs.author = req.user.id;
        articleArgs.tags = [];

        Article.create(articleArgs).then(article =>{

            let tagNames = articleArgs.tagNames.split(/\s+|,/).filter(tag =>{return tag});
            initializeTags(tagNames, article.id);

            article.prepareInsert();
            res.redirect('/');
        })
    },

    details: (req, res) => {
        let id = req.params.id;
        let commentsArgs = req.body;
        Article.findById(id).populate('author tags comments').then(article =>{
            if(!req.user){
            res.render('article/details', {article: article, isAuthenticated: false});
                Comment.create(commentsArgs.content).then(comment => {
                    comment.article.push(article);
                    comment.save();
                });
            return;
            }

            req.user.isInRole('Admin').then(isAdmin =>{
                let isUserAuthorized = isAdmin || req.user.isAuthor(article);

                res.render('article/details', {article: article, isUserAuthorized: isUserAuthorized});
            })
        })
    },

    commentGet: (req, res) => {
        let id = req.params.id;

        Article.findById(id).then(article =>{

            res.render('article/comment', article)
        })
    },
    commentPost: (req, res) =>{
        let id = req.params.id;
        let commentsArgs = req.body;
        if(req.isAuthenticated()){

        Article.findById(id).then(article =>{
            User.findById(req.user.id).then(user =>{
                Comment.create({author: req.user.id ,user: req.user.fullName,article: article.id, content: commentsArgs.content}).then(comment => {
                    article.comments.push(comment);
                    user.comments.push(comment);
                    article.save();
                    user.save();

                });
            });
            res.redirect(`/`);
        });

    } else{
            Article.findById(id).then(article =>{
                let authorId = "5902e274738e6a0704798d09";
                User.findById(authorId).then(user =>{
                Comment.create({author: authorId,user: commentsArgs.user,article: article.id, content: commentsArgs.content}).then(comment => {
                    article.comments.push(comment);
                    user.comments.push(comment);
                    article.save();
                    user.save();

                });

            });
                res.redirect(`/`);
            });
        }
    },
    editGet: (req, res) => {
        let id = req.params.id;

        if(!req.isAuthenticated()){
            let returnUrl = `/article/edit/${id}`;
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }

        Article.findById(id).populate('tags').then(article => {
            req.user.isInRole('Admin').then(isAdmin => {
                if(!isAdmin && !req.user.isAuthor(article)){
                    res.redirect('/');
                    return;
                }
                Category.find({}).then(categories =>{
                    article.categories = categories;

                    article.tagNames = article.tags.map(tag => {return tag.name});

                    res.render('article/edit', article)
                });
            });
        });
    },

    editPost: (req, res) => {

        let id = req.params.id;
        let articleArgs = req.body;

        let errorMsg = '';
        if(!articleArgs.title){
            errorMsg = 'Article title cannot be empty!';
        } else if (!articleArgs.content){
            errorMsg ='Article content cannot be empty!';
        }

        if (errorMsg){
            res.render('article/edit', {error: errorMsg})
        } else  {
            let image = req.files.image;
            if(image){

                let filenameAndExtension = image.name;

                let filename = filenameAndExtension.substring(0, filenameAndExtension.lastIndexOf('.'));
                let extension = filenameAndExtension.substring(filenameAndExtension.lastIndexOf('.')+1);
                if(extension === 'png' || extension === 'jpg'|| extension === 'gif'){
                let randomChars = require('./../utilities/encryption').generateSalt().substring(0,5).replace(/\//g, 'x');

                let finalFileName = `${filename}_${randomChars}.${extension}`;
                image.mv(`./public/images/${finalFileName}`, err =>{
                    if(err){
                        console.log(err.message);
                    }
                });
                articleArgs.imagePath = `/images/${finalFileName}`;
                articleArgs.edit = 'true';
                articleArgs.editDate = Date.now();
                articleArgs.editName = req.user.fullName;

                Article.findById(id).populate('category tags').then(article =>{
                    if(article.category.id !== articleArgs.category){
                        article.category.articles.remove(article.id);
                        article.category.save();
                    }

                    article.category = articleArgs.category;
                    article.title = articleArgs.title;
                    article.content = articleArgs.content;
                    article.imagePath = articleArgs.imagePath;
                    article.edit = articleArgs.edit;
                    article.editDate = articleArgs.editDate;
                    article.editName = articleArgs.editName;

                    let newTagNames = articleArgs.tags.split(/\s+|,/).filter(tag =>{return tag});

                    let oldTags = article.tags.filter(tag =>{
                        return newTagNames.indexOf(tag.name) === -1;
                    });

                    for (let tag of oldTags){
                        tag.deleteArticle(article.id);
                        article.deleteTag(tag.id);
                    }
                    initializeTags(newTagNames, article.id);

                    article.save((err)=>{
                        if(err){
                            console.log(err.message);
                        }

                        Category.findById(article.category).then(category =>{
                            if(category.articles.indexOf(article.id)=== -1){
                                category.articles.push(article.id);
                                category.save();
                            }

                            res.redirect(`/article/details/${id}`);
                        })
                    })
                })
                }else{
                    errorMsg = 'Only .png, .jpg and .gif are accepted!';
                    res.render('article/edit', {error: errorMsg});
                }
            }else{
                articleArgs.edit = 'true';
                articleArgs.editDate = Date.now();
                articleArgs.editName = req.user.fullName;

                Article.findById(id).populate('category tags').then(article =>{
                    if(article.category.id !== articleArgs.category){
                        article.category.articles.remove(article.id);
                        article.category.save();
                    }

                    article.category = articleArgs.category;
                    article.title = articleArgs.title;
                    article.content = articleArgs.content;
                    article.edit = articleArgs.edit;
                    article.editDate = articleArgs.editDate;
                    article.editName = articleArgs.editName;

                    let newTagNames = articleArgs.tags.split(/\s+|,/).filter(tag =>{return tag});

                    let oldTags = article.tags.filter(tag =>{
                        return newTagNames.indexOf(tag.name) === -1;
                    });

                    for (let tag of oldTags){
                        tag.deleteArticle(article.id);
                        article.deleteTag(tag.id);
                    }
                    initializeTags(newTagNames, article.id);

                    article.save((err)=>{
                        if(err){
                            console.log(err.message);
                        }

                        Category.findById(article.category).then(category =>{
                            if(category.articles.indexOf(article.id)=== -1){
                                category.articles.push(article.id);
                                category.save();
                            }

                            res.redirect(`/article/details/${id}`);
                        })
                    })
                })}
        }
    },

    deleteGet: ( req, res) => {
    let id = req.params.id;

        if(!req.isAuthenticated()){
            let returnUrl = `/article/delete/${id}`;
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }
    Article.findById(id).populate('category tags').then(article => {
        req.user.isInRole('Admin').then(isAdmin => {
            if(!isAdmin && !req.user.isAuthor(article)){
                res.redirect('/');
                return;
            }
                article.tagNames = article.tags.map(tag => {return tag.name});
                res.render('article/delete', article)
        })
    })
    },

    deletePost: (req, res) => {
        let id = req.params.id;
        Article.findOneAndRemove({_id: id}).populate('author').then(article => {
                article.prepareDelete();
                res.redirect('/');
        })
    }
};