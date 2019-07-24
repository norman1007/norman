const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const appointingMtncSchema = new Schema({
    p_kend_name: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    p_kend_approve: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

appointingMtncSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('appointingMtnc', appointingMtncSchema);


