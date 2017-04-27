const mongoose = require('mongoose');

let commentSchema = mongoose.Schema({
    content: {type: String},
    date: {type: Date, default: Date.now()},
    user: [{type: String, required: true}],
    author: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    article: [{type: mongoose.Schema.Types.ObjectId, ref: 'Article'}]
});



commentSchema.method({
    insert:function(){
        let Article = mongoose.model('Article');
        for(let article of this.articles){
            Article.findById(article).then(article =>{
                if(article.comments.indexOf(this.id)=== -1){
                    article.comments.push(this.id);
                    article.save();
                }

            });
        }
    },
});
        commentSchema.set('versionKey', false );
        const Comment = mongoose.model('Comment', commentSchema);

        module.exports = Comment;