const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const discussionsSchema = new Schema({

    sender: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    },
    body: String,
    name: {
        type: String
    },
    image: {
        type: String
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }

});

discussionsSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Discussions', discussionsSchema);