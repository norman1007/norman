const mongoose = require('mongoose');
const passportLocalmongoose = require('passport-local-mongoose');
const URLSlugs = require('mongoose-url-slugs');
const mongoosePaginate = require('mongoose-paginate');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    emp_name: {
        type: String,
        uppercase: true,
        default: 'NAMA ANDA'
    },
    slugUser: {
        type: String
    },
    email: {
        type: String,
        unique: true,
        lowercase: true
    },
    username: {
        type: String,
        unique: true
    },
    password: String,
    department: {
        type: String,
        default: 'Jabatan Khidmat Pengurusan'
    },
    position: String,
    isAdmin: {
        type: Boolean,
        default: false
    },
    image: {
        type: Buffer
    },
    avatar: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true,
        timestamps: true
    },
    assetsOfficer: {
        type: Schema.Types.ObjectId,
        ref: 'assetsOfficer'
    },
    appointingMtnc: {
        type: Schema.Types.ObjectId,
        ref: 'appointingMtnc'
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.plugin(passportLocalmongoose)
userSchema.plugin(URLSlugs('username', { field: 'slugUser' }));
userSchema.plugin(mongoosePaginate)
/* Schema is not registered for model User is because u is not capitalize */
module.exports = mongoose.model('User', userSchema);