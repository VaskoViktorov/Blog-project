const userController = require('./../controllers/user');
const homeController = require('./../controllers/home');
const articleController = require('./../controllers/article');
const footerController = require('./../controllers/footer');
const accountController = require('./../controllers/account');
const adminController = require('./../controllers/admin/admin');
const tagController = require('./../controllers/tag');

module.exports = (app) => {
    //home
    app.get('/', homeController.index);
    app.get('/category/:id', homeController.listCategoryArticles);

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

    //rules page
    app.get('/account/account', accountController.accountGet);

    //admin panels
    app.use((req, res, next) => {
        if(req.isAuthenticated()){
            req.user.isInRole('Admin').then(isAdmin =>{
                if(isAdmin){
                    next();
                }else{
                    res.redirect('/');
                }
            })
        }else{
            res.redirect('/user/login')
        }
    });
    app.get('/admin/user/all', adminController.user.all);

    //admin panels edit user
  app.get('/admin/user/edit/:id', adminController.user.editGet);
  app.post('/admin/user/edit/:id', adminController.user.editPost);

  //admin panels delete user
    app.get('/admin/user/delete/:id', adminController.user.deleteGet);
    app.post('/admin/user/delete/:id', adminController.user.deletePost);

    //admin panel - categories
    app.get('/admin/category/all', adminController.category.all);

    //admin panel - create category
    app.get('/admin/category/create', adminController.category.createGet);
    app.post('/admin/category/create', adminController.category.createPost);

    //admin panel - edit category
    app.get('/admin/category/edit/:id', adminController.category.editGet);
    app.post('/admin/category/edit/:id', adminController.category.editPost);

    //admin panel - delete category
    app.get('/admin/category/delete/:id', adminController.category.deleteGet);
    app.post('/admin/category/delete/:id', adminController.category.deletePost);

    //tag details
    app.get('/tag/:name', tagController.listArticlesByTag);
};

