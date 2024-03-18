const mongoose = require('mongoose');

const keywordSchema = new mongoose.Schema({
    keyword: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

const KeywordModel = mongoose.model('Keyword', keywordSchema);

module.exports =  KeywordModel;