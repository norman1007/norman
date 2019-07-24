const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const suppliersSchema = new Schema({
    supName: {
        type: String,
        uppercase: true
    },
    supAddr: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }
});

suppliersSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Suppliers', suppliersSchema);