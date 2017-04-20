const Article = require('mongoose').model('Article');
const User = require('mongoose').model('User');

module.exports = {
    createGet: (req, res) =>{
        res.render('article/create');
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

        Article.create(articleArgs).then(article =>{
            req.user.articles.push(article.id);
            req.user.save(err =>{
                if(err){
                    res.redirect('/', {error: err.message});
                } else {
                    res.redirect('/');
                }
            })

        })
    },

    details: (req, res) => {
        let id = req.params.id;

        Article.findById(id).populate('author').then(article =>{
            if(!req.user){
            res.render('article/details', {article: article, isAuthenticated: false});
            return;
            }

            req.user.isInRole('Admin').then(isAdmin =>{
                let isUserAuthorized = isAdmin || req.user.isAuthor(article);

                res.render('article/details', {article: article, isUserAuthorized: isUserAuthorized});
            })
        })
    },

    editGet: (req, res) => {
        let id = req.params.id;
        if(!req.isAuthenticated()){
            let returnUrl = `/article/edit/${id}`;
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }
        Article.findById(id).then(article => {
            req.user.isInRole('Admin').then(isAdmin => {
                if(!isAdmin && !req.user.isAuthor(article)){
                    res.redirect('/');
                    return;
                }

                res.render('article/edit', article)
            })
        })
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

                Article.update({_id: id}, {$set: {title: articleArgs.title, content: articleArgs.content, imagePath: articleArgs.imagePath, edit: articleArgs.edit,editDate: articleArgs.editDate}})
                    .then(updateStatus => {
                        res.redirect(`/article/details/${id}`);
                    })}else{
                    errorMsg = 'Only .png, .jpg and .gif are accepted!';
                    res.render('article/edit', {error: errorMsg});

                }

            }
            else{
                articleArgs.edit = 'true';
                articleArgs.editDate = Date.now();

                Article.update({_id: id}, {$set: {title: articleArgs.title, content: articleArgs.content, edit: articleArgs.edit, editDate: articleArgs.editDate}})
                .then(updateStatus => {
                    res.redirect(`/article/details/${id}`);
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
    Article.findById(id).then(article => {
        req.user.isInRole('Admin').then(isAdmin => {
            if(!isAdmin && !req.user.isAuthor(article)){
                res.redirect('/');
                return;
            }

            res.render('article/delete', article)
        })
    })
    },

    deletePost: (req, res) => {
        let id = req.params.id;
        Article.findOneAndRemove({_id: id}).populate('author').then(article => {
        let author = article.author;

        //Index of the article's ID is the author's articles.
        let index  = author.articles.indexOf(article.id);

        if(index<0){
            let errorMsg ='Article was not found for that author!';
            res.render('article/delete', {error: errorMsg})
        } else {
            //Remove count elements after given index (inclusive).
            let count = 1;
            author.articles.splice(index, count);
            author.save().then((user)=>{
                res.redirect('/');
            });
        }

        })
    }
};