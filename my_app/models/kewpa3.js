const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema;

const kewpa3Schema = new Schema({
    file_ast: {
        type: String, 
        uppercase: true
    },
    slugAsset: String,
    nas_code: {
        type: String,
        default: 'Tiada rekod'
    },
    ast_desc: String,
    cat: {
        type: String,
        default: 'Tiada rekod'
    },
    sub_cat: {
        type: String,
        default: 'Tiada rekod'
    },
    ast_type: {
        type: String,
        uppercase: true,
        default: 'Tiada rekod'
    },
    assets_category: {
        type: String
    },
    ast_make: {
        type: String,
        default: 'Tiada rekod'
    },
    ori_acq: Number,
    eng_no: {
        type: String,
        uppercase: true,
        default: 'Tiada rekod'
    },
    acq_dt: Date,
    rcv_dt: Date,
    casis: {
        type: String,
        uppercase: true,
        default: 'Tiada rekod'
    },
    lOrder: String,
    ast_reg: String,
    wrnt: {
        type: String,
        default: 'Tiada rekod'
    },
    sup: {
        type: Schema.Types.ObjectId,
        ref: 'Suppliers'
    },
    supAddr: {
        type: Schema.Types.ObjectId,
        ref: 'Suppliers'
    },
    spec: {
        type: String,
        default: 'Tiada rekod'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    placements: [
        {
            type: Object,
            ref: 'Placements'
        }
    ],
    maintainances: [
        {
            type: Object,
            ref: 'Maintainances'
        }
    ],
    indens: [
        {
            type: Object,
            ref: 'Indens'
        }
    ],
    discussions: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Discussions'
        }
    ]
})

kewpa3Schema.plugin(URLSlugs('file_ast', { field: 'slugAsset' }));
kewpa3Schema.plugin(mongoosePaginate);

module.exports = mongoose.model('Kewpa3', kewpa3Schema);