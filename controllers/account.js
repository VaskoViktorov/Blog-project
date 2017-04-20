const mongoose = require('mongoose');

module.exports = {

    accountGet: (req, res) => {
        res.render('account/account');
    }
};