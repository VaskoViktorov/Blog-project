const User = require('mongoose').model('User');
const encryption = require('././../utilities/encryption');
const Role = require('mongoose').model('Role');

module.exports ={
    accountGet: (req, res) => {
        let id = req.params.id;
        if(!req.isAuthenticated()){
            let returnUrl = '/';
            req.session.returnUrl = returnUrl;

            res.redirect('/user/login');
            return;
        }
                res.render('account/account', id)
    },

    accountPost: (req, res) =>{
       
    },
};