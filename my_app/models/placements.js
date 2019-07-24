const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema;

const placementsSchema = new Schema({
    offName: {
        type: String,
        uppercase: true
    },
    plcDate: {
        type: Date
    },
    loc: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

placementsSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Placements', placementsSchema);