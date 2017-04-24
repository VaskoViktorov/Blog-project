const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

require('./../models/Role').initialize();
require('./../models/User').seedAdmin();
require('./../models/Article');
require('./../models/Category');
require('./../models/Tag');

module.exports = (config) => {
    mongoose.connect(config.connectionString);

    let database = mongoose.connection;
    database.once('open', (error) => {
        if (error) {
            console.log(error);
            return;
        }

        console.log('MongoDB ready!')

    });




};








