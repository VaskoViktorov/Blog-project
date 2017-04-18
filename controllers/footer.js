const mongoose = require('mongoose');

module.exports = {

    contactGet: (req, res) => {
        res.render('footer/contact');
    },
    aboutGet: (req, res) => {
        res.render('footer/about');
    },
    privacyGet: (req, res) => {
        res.render('footer/privacy');
    },
    rulesGet: (req, res) => {
        res.render('footer/rules');
    },
};