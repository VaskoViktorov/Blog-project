const mongoose = require('mongoose');

let commentSchema = mongoose.Schema({
    content: {type: String},
    date: {type: Date, default: Date.now()},
    user: [{type: String, required: true}],
    author: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    article: [{type: mongoose.Schema.Types.ObjectId, ref: 'Article'}]
});


commentSchema.set('versionKey', false );
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;