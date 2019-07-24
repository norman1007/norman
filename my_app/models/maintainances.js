const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
// const URLSlugs = require('mongoose-url-slugs');

const Schema = mongoose.Schema;

const maintainancesSchema = new Schema({
    title: {
        type: String,
        trim: true
    },
    description: {
        type: [String],
        trim: true
    },
    date: {
        type: Date
    },
    value: {
        type: [Number],
        trim: true
    },
    vendor: String,
    lastPerson: String,
    lastPerson_position: String,
    lOrderMtnc: {
        type: String,
        trim: true
    },
    total: {
        type: Number,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    userId: {
        id: 
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
        emp_name: String,
        username: String,
        department: String,
        position: String
    }
});

maintainancesSchema.plugin(mongoosePaginate);
// maintainancesSchema.plugin(URLSlugs);

module.exports = mongoose.model('Maintainances', maintainancesSchema);