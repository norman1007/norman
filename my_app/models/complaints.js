const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const complaintsSchema = new Schema({
    modul: {
        type: String,
        trim: true
    },
    issue: {
        type: String,
        trim: true
    },
    desc: {
        type: String,
        trim: true
    },
    priority: String,
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: Boolean,
        default: false
    },
    attach: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Reviews'
        }
    ]
});

complaintsSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Complaints', complaintsSchema);