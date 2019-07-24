const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const reviewsSchema = new Schema({
    reviews: {
        type: String,
        trim: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

reviewsSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Reviews', reviewsSchema);