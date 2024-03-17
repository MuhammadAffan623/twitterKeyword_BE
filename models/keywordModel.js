import mongoose from 'mongoose';

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
        default: Date.now, 
    }
}, {
    timestamps: true
});

const KeywordModel = mongoose.model('Keyword', keywordSchema);

export default KeywordModel;