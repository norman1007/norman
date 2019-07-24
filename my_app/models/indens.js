const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const indensSchema = new Schema({
    // Tarikh Kad Diambil
    cardTaken: {
        type: Date
    },
    // Nama Pegawai Yang Menyerahkan Kad
    cardGivenBy: {
        type: String,
        trim: true
    },
    // Nama Pemandu
    driver: {
        type: String,
        trim: true
    },
    // Tarikh Dikembalikan
    cardReceiveDate: {
        type: Date
    },
    // Nama Penerima Kad Yang Dikembalikan
    returnCardReceiver: {
        type: String,
        trim: true
    },
    // Jumlah Diisi (Liter)
    liter: {
        type: Number,
        trim: true
    },
    // Jumlah Diisi (RM)
    amountFilled: {
        type: Number,
        trim: true
    },
    // No. Resit
    receiptNumber: {
        type: String,
        trim: true
    },
    // No. Plate Kenderaan
    plateNumber: {
        type: String,
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

indensSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Indens', indensSchema);