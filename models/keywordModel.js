const mongoose = require('mongoose');

const keywordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true,
    },
    keyword: {
        type: String,
        required: true,
    },
    totalCount: {
        type: Number,
        default: 0, 
    },
    fetchDateTime: {
        type: Date,
        required: true,
        default: new Date('1995-01-01'), 
    }
}, {
    timestamps: true
});

const KeywordModel = mongoose.model('Keyword', keywordSchema);

module.exports =  KeywordModel;