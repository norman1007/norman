const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const assetOfficer = new Schema({
    p_aset_name: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    p_aset_approve: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

assetOfficer.plugin(mongoosePaginate);
module.exports = mongoose.model('assetOfficer', assetOfficer);