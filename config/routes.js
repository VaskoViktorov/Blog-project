const userController = require('./../controllers/user');
const homeController = require('./../controllers/home');
const articleController = require('./../controllers/article');
const footerController = require('./../controllers/footer');

module.exports = (app) => {
    //home
    app.get('/', homeController.index);

    //registration
    app.get('/user/register', userController.registerGet);
    app.post('/user/register', userController.registerPost);

    // login
    app.get('/user/login', userController.loginGet);
    app.post('/user/login', userController.loginPost);

    //logout
    app.get('/user/logout', userController.logout);

    //create article
    app.get('/article/create', articleController.createGet);
    app.post('/article/create', articleController.createPost);

    // article details
    app.get('/article/details/:id', articleController.details);

    //edit article
    app.get('/article/edit/:id', articleController.editGet);
    app.post('/article/edit/:id', articleController.editPost);

    //delete article
    app.get('/article/delete/:id', articleController.deleteGet);
    app.post('/article/delete/:id', articleController.deletePost);

    //contact page
    app.get('/footer/contact', footerController.contactGet);

    //about page
    app.get('/footer/about', footerController.aboutGet);

    //privacy page
    app.get('/footer/privacy', footerController.privacyGet);

    //rules page
    app.get('/footer/rules', footerController.rulesGet);

};

