const fs = require('fs');
const path = require('path');
const Printer = require('pdfmake');

const deleteHelper = require('../util/deleteHelper');

/* Requiring model to printing */
const User = require('../models/user');
const Kewpa3 = require('../models/kewpa3');
// const Suppliers = require('../models/suppliers');
// const Placements = require('../models/placements');
// const Maintainances = require('../models/maintainances');
// const Discussions = require('../models/discussions');

exports.getPrintPage = async (req, res, next) => {
    const pageTitle = 'Cetak';
    let assets = await Kewpa3.find().exec();

    try {
        res.status(200).render('main/printer/index', { pageTitle, assets })
    } catch (err) {
        console.log('Error dari getPrint: ' + err);
    }
};

exports.getKewpa3SecAPrint = async (req, res, next) => {
    const kewpa3Id = req.params.id;
    let namaPembekal = await Kewpa3.findById(kewpa3Id).select('sup').populate('sup').exec();
    let alamatPembekal = await Kewpa3.findOne({}).select('sup.supAddr').populate('sup').exec();
    let plc = await Kewpa3.findById(kewpa3Id).select('placements').populate('placements').exec();

    /* Loop for penempatan pegawai */
    let penempatan;
    plc.placements.forEach((p) => {
        penempatan = p;
    });

    /* Format number function */
    function formatNumber(n, c, d, t) {
        var c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d == undefined ? "." : d,
            t = t == undefined ? "," : t,
            s = n < 0 ? "-" : "",
            i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
            j = (j = i.length) > 3 ? j % 3 : 0;

        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    };

    Kewpa3.findById(kewpa3Id)
        .then(kewpa3 => {
            if (!kewpa3) {
                return next(new Error('Tiada daftar harta modal ditemui.'));
            }
            const docName = 'cetak-' + kewpa3.ast_type + '-' + kewpa3Id + '.pdf';
            const docPath = path.join('print', 'kewpa3', docName);

            const printer = new Printer({
                Lato: {
                    normal: path.resolve('src', 'fonts', 'Lato-Regular.ttf'),
                    bold: path.resolve('src', 'fonts', 'Lato-Bold.ttf'),
                    italics: path.resolve('src', 'fonts', 'Lato-Italic.ttf')
                }
            });

            const header1 = 'KEW.PA-3';
            const noSiri = kewpa3.file_ast;
            const hartaModal = 'Daftar Harta Modal';
            const title = 'Majlis Daerah Lenggong';
            const header2 = 'BAHAGIAN A';
            const line = '____________________________________';
            const signature = '*Tandatangan Ketua Jabatan';
            const ydp = 'AHMAD SUQAIRY BIN ALIAS';
            const jawatan = 'YANG DIPERTUA';

            let doc;

            doc = printer.createPdfKitDocument({
                info: {
                    title: title,
                    author: 'Norman',
                    subject: 'PDF with Node'
                },
                content: [
                    {
                        stack: [
                            { text: header1, style: 'subheader', alignment: 'right' },
                            { text: `No. Siri Pendaftaran : ${noSiri}`, alignment: 'right' },
                            { text: hartaModal, style: 'subheader', alignment: 'center' }
                        ]
                    },
                    { text: `Kementerian / Jabatan : ${title}` },
                    { text: 'Bahagian :' },
                    { text: header2, style: 'subheader', alignment: 'center' },
                    {
                        table: {
                            widths: [150, "*", 150, "*"],
                            body: [
                                [{ text: 'Kod Nasional' }, { text: `${kewpa3.nas_code}`, colSpan: 3 }, {}, {}],
                                [{ text: 'Keterangan Aset' }, { text: `${kewpa3.ast_desc}`, colSpan: 3 }, {}, {}],
                                [{ text: 'Kategori' }, { text: `${kewpa3.cat}`, colSpan: 3 }, {}, {}],
                                [{ text: 'Sub Kategori' }, { text: `${kewpa3.sub_cat}`, colSpan: 3 }, {}, {}],
                                [{ text: 'Jenis / Jenama / Model' }, { text: `${kewpa3.ast_type}`, colSpan: 3 }, {}, {}],
                                [
                                    { text: 'Buatan' }, { text: `${kewpa3.ast_make}` },
                                    { text: 'Harga Perolehan Asal (RM)' }, { text: `RM ${formatNumber(kewpa3.ori_acq)}` }
                                ],
                                [{ text: 'No. Casis / Siri Pembuat' }, { text: `${kewpa3.casis}` }, { text: 'No. Pesanan Rasmi Kerajaan / Kontrak' }, { text: `${kewpa3.lOrder}` }],
                                [{ text: 'No. Pendaftaran (Bagi Kenderaan)' }, { text: `${kewpa3.ast_reg}` }, { text: 'Tempoh Jaminan' }, { text: `${kewpa3.wrnt}` }],
                                [{ rowSpan: 3, text: `Spesifikasi / Catatan : ${kewpa3.spec}`, colSpan: 2 }, {}, { text: `Nama Pembekal : ${namaPembekal.sup.supName}\nDan Alamat : ${namaPembekal.sup.supAddr}`, colSpan: 2 }, {}],
                                ['', '', { text: `\n\n\n${line}\n${signature}`, colSpan: 2, alignment: 'center', border: [false, false, true, false] }, {}],
                                ['', '', { text: `Nama Ketua Jabatan : ${ydp}\nJawatan : ${jawatan}\nTarikh : \nCap`, colSpan: 2, border: [false, false, true, true] }, {}],
                                /* PENEMPATAN - AMBIL PENEMPATAN YG PALING LATEST SAHAJA */
                                [{ text: 'PENEMPATAN', style: 'subheader', colSpan: 4, alignment: 'center' }, {}, {}, {}],
                                [{ text: 'Lokasi' }, { text: `${penempatan.loc}`, colSpan: 3 }, {}, {}],
                                [{ text: 'Tarikh' }, { text: `${penempatan.plcDate.toLocaleDateString()}`, colSpan: 3 }, {}, {}],
                                [{ text: 'Nama Pegawai' }, { text: `${penempatan.offName}`, colSpan: 3 }, {}, {}]
                            ]
                        }
                    },
                    {
                        style: 'tableBelow',
                        table: {
                            widths: [150, "*", "*", "*"],
                            body: [
                                [{ text: 'PEMERIKSAAN', style: 'subheader', colSpan: 4, alignment: 'center' }, {}, {}, {}],
                                [{ text: 'Tarikh' }, {}, {}, {}],
                                [{ text: 'Status Aset' }, {}, {}, {}],
                                [{ text: 'Nama Pemeriksa' }, {}, {}, {}]
                            ]
                        }
                    },
                    {
                        style: 'tableBelow',
                        table: {
                            widths: [150, "*", "*", "*"],
                            body: [
                                [{ text: 'USIA GUNA DAN NILAI SEMASA', style: 'subheader', colSpan: 4, alignment: 'center' }, {}, {}, {}],
                                [{ text: 'Tarikh' }, {}, {}, {}],
                                [{ text: 'Usia Guna' }, {}, {}, {}],
                                [{ text: 'Nilai Semasa (RM)' }, {}, {}, {}],
                                [{ text: 'Nama Pegawai' }, {}, {}, {}]
                            ]
                        }
                    },
                    {
                        style: 'tableBelow',
                        table: {
                            widths: [150, "*", "*", "*"],
                            body: [
                                [{ text: 'PINDAHAN / PELUPUSAN / HAPUS KIRA', style: 'subheader', colSpan: 4, alignment: 'center' }, {}, {}, {}],
                                [{ text: 'Perkara', alignment: 'center' }, { text: 'Rujukan Kelulusan', alignment: 'center' }, { text: 'Tarikh Kelulusan', alignment: 'center' }, { text: 'Nama Pegawai' }],
                                [{ text: 'Lupus' }, {}, {}, {}]
                            ]
                        }
                    },
                    {
                        text: '*Nota Tandatangan Ketua Jabatan boleh ditandatangani oleh Ketua Jabatan/ Bahagian/ Seksyen/ Unit',
                        alignment: 'center',
                        style: ['quote', 'small', 'tableBelow']
                    }
                ],
                defaultStyle: {
                    fontSize: 8,
                    font: 'Lato',
                    lineHeight: 1.2
                },
                styles: {
                    subheader: {
                        fontSize: 9,
                        bold: true
                    },
                    tableBelow: {
                        margin: [0, 10, 0, 0]
                    },
                    quote: {
                        italics: true
                    },
                    small: {
                        fontSize: 8
                    }
                }
            });
            doc.end()
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="' + docName + '"');
            doc.pipe(fs.createWriteStream(docPath));
            doc.pipe(res);
        })
        .catch(err => {
            console.log('Error dari Promise getKewpa3SecAPrint: ' + err);
            req.flash('error', err.message);
            res.redirect('/print');
        });

};

exports.getKewpa15Print = async (req, res, next) => {
    const kewpa3Id = req.params.id;
    let mtnc = await Kewpa3.findById(kewpa3Id).select('maintainances').populate('maintainances').exec();
    let plc = await Kewpa3.findById(kewpa3Id).select('placements').populate('placements').exec();
    /* Loop for penempatan pegawai */
    let placements;
    if (plc > 0) {
        plc.placements.forEach((p) => {
            placements = p;
        });
    }
    console.log(placements)

    function formatNumber(n, c, d, t) {
        var c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d == undefined ? "." : d,
            t = t == undefined ? "," : t,
            s = n < 0 ? "-" : "",
            i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
            j = (j = i.length) > 3 ? j % 3 : 0;

        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    };

    var rows = [];

    rows.push([
        { text: '( a )\nTarikh', alignment: 'center' },
        { text: '( b )\nJenis\nPenyenggaraan', alignment: 'center' },
        { text: '( c )\nButir-butir Kerja', alignment: 'center' },
        { text: '( d )\nNo. Pesanan Kerajaan /\nNo. Kontrak dan Tarikh', alignment: 'center' },
        { text: '( e )\nNama Syarikat / Jabatan\nYang Menyelenggara', alignment: 'center' },
        { text: '( f )\nKos\n( RM )', alignment: 'center' },
        { text: '( g )\nNama dan\nJawatan', alignment: 'center' }
    ])
    if (mtnc) {
        mtnc.maintainances.forEach(function (mtnc) {
            for (var i = 0; i < mtnc.description.length; i++) {
                rows.push([
                    { text: `${mtnc.date.toLocaleDateString()}`, alignment: 'center' },
                    { text: `${mtnc.title}`, alignment: 'center' },
                    { text: `${mtnc.description[i]}` },
                    { text: `${mtnc.lOrderMtnc}`, alignment: 'center' },
                    { text: `${mtnc.vendor}` },
                    { text: `RM ${formatNumber(mtnc.value[i])}`, alignment: 'center' },
                    { text: `${mtnc.lastPerson}\n${mtnc.lastPerson_position}` }
                ])
            }
        });
    }

    Kewpa3.findById(kewpa3Id)
        .then(kewpa3 => {
            if (!kewpa3) {
                return next(new Error('Tiada daftar harta modal ditemui.'));
            }
            const docName = 'cetak-KEWPA-15' + `selenggara-${kewpa3.ast_type}` + '.pdf';
            const docPath = path.join('print', 'kewpa15', docName);

            const printer = new Printer({
                Lato: {
                    normal: path.resolve('src', 'fonts', 'Lato-Regular.ttf'),
                    bold: path.resolve('src', 'fonts', 'Lato-Bold.ttf'),
                    italics: path.resolve('src', 'fonts', 'Lato-Italic.ttf')
                }
            });

            const header1 = 'KEW.PA-15';
            const title = 'REKOD PENYENGGARAAN ASET ALIH';

            let doc;

            doc = printer.createPdfKitDocument({
                // a string or { width: number, height: number }
                pageSize: 'A4',

                // by default we use portrait, you can change it to landscape if you wish
                pageOrientation: 'landscape',
                content: [
                    {
                        stack: [
                            { text: header1, style: 'subheader', alignment: 'right' },
                            { text: title, style: 'subheader', alignment: 'center' },
                        ]
                    },
                    /* ----------------------------------------------------------------- */
                    {
                        style: 'tableBelow',
                        table: {
                            widths: [85, "*", "*", 85, "*", "*"],
                            body: [
                                [
                                    { text: 'Sub Kategori', border: [false, false, false, false] },
                                    { text: `: ${kewpa3.sub_cat}`, colSpan: 2, border: [false, false, false, false] },
                                    { text: '', border: [false, false, false, false] },
                                    { text: 'No. Siri Pendaftaran', border: [false, false, false, false] },
                                    { text: `: ${kewpa3.file_ast}`, colSpan: 2, border: [false, false, false, false] },
                                    { text: '', border: [false, false, false, false] }
                                ],
                                [
                                    { text: 'Jenis', border: [false, false, false, false] },
                                    { text: `: ${kewpa3.ast_type}`, colSpan: 2, border: [false, false, false, false] },
                                    { text: '', border: [false, false, false, false] },
                                    { text: 'Lokasi', border: [false, false, false, false] },
                                    { text: `: `, colSpan: 2, border: [false, false, false, false] },
                                    { text: '', border: [false, false, false, false] }
                                ]
                            ]
                        }

                    },
                    /* ----------------------------------------------------------------- */
                    {
                        style: 'tableBelow2x',
                        table: {
                            widths: [60, 120, 140, 100, 100, 80, 100],
                            body: rows
                        }
                    }
                    /* ----------------------------------------------------------------- */
                ],
                defaultStyle: {
                    fontSize: 8,
                    font: 'Lato',
                    lineHeight: 1.2
                },
                styles: {
                    subheader: {
                        fontSize: 9,
                        bold: true
                    },
                    tableBelow: {
                        margin: [0, 10, 0, 0],
                    },
                    tableBelow2x: {
                        margin: [0, 20, 0, 0]
                    },
                    quote: {
                        italics: true
                    },
                    small: {
                        fontSize: 8
                    }
                }
            });
            doc.end();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="' + docName + '"');
            doc.pipe(fs.createWriteStream(docPath));
            doc.pipe(res);
        })
        .catch(err => {
            req.flash('error', err.message);
            res.redirect('/print');
        });
};

exports.getIndensRecordPrint = async (req, res, next) => {
    const kewpa3Id = req.params.id;
    let indens = await Kewpa3.findById(kewpa3Id).select('indens').exec();

    function formatNumber(n, c, d, t) {
        var c = isNaN(c = Math.abs(c)) ? 2 : c,
            d = d == undefined ? "." : d,
            t = t == undefined ? "," : t,
            s = n < 0 ? "-" : "",
            i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
            j = (j = i.length) > 3 ? j % 3 : 0;

        return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
    };

    // Push the indens arr
    let rows = [];

    rows.push(
        [
            { text: 'Bil', alignment: 'center', rowSpan: 2 },
            { text: 'Tarikh Kad Diambil', alignment: 'center', rowSpan: 2 },
            { text: 'Pegawai Yang Menyerahkan Kad', alignment: 'center', colSpan: 2 }, {},
            { text: 'Pemandu', alignment: 'center', colSpan: 2 }, {},
            { text: 'Tarikh Dikembalikan', alignment: 'center', rowSpan: 2 },
            { text: 'Penerima Kad Yang Dikembalikan', alignment: 'center', colSpan: 2 }, {},
            { text: 'Jumlah Diisi', alignment: 'center', colSpan: 2 }, {},
            { text: 'No. Resit', alignment: 'center', rowSpan: 2 },
            { text: 'No. Plat Kenderaan', alignment: 'center', rowSpan: 2 },
        ],
        [
            { text: '' },
            { text: '' },
            { text: 'Nama', alignment: 'center' }, { text: 'Tanda tangan', alignment: 'center' },
            { text: 'Nama', alignment: 'center' }, { text: 'Tanda tangan', alignment: 'center' },
            { text: '' },
            { text: 'Nama', alignment: 'center' }, { text: 'Tanda tangan', alignment: 'center' },
            { text: 'Liter', alignment: 'center' }, { text: 'RM', alignment: 'center' },
            { text: '' },
            { text: '' },
        ]
    )
    if (indens) {
        indens.indens.forEach(function (inden) {
            rows.push([
                // Bil
                { text: '' },
                // Tarikh Kad Diambil
                { text: `${inden.cardTaken.toLocaleDateString()}` },
                // Pegawai Yang Menyerahkan Kad
                { text: `${inden.cardGivenBy}`, alignment: 'center' }, { text: '', alignment: 'center' },
                // Pemandu
                { text: `${inden.driver}`, alignment: 'center' }, { text: '', alignment: 'center' },
                // Tarikh Dikembalikan
                { text: `${inden.cardReceiveDate.toLocaleDateString()}` },
                // Penerima Kad Yang Dikembalikan
                { text: `${inden.returnCardReceiver}`, alignment: 'center' }, { text: '', alignment: 'center' },
                // Jumlah Diisi
                { text: `${inden.liter}`, alignment: 'center' }, { text: `${formatNumber(inden.amountFilled)}`, alignment: 'center' },
                // No. Resit
                { text: `${inden.receiptNumber}`, alignment: 'center' },
                // No. Plat Kenderaan
                { text: `${inden.plateNumber}`, alignment: 'center' },
            ])
        });
    }

    // Print indens according to which kewpa
    Kewpa3.findById(kewpa3Id)
        .then(kewpa3 => {
            if (!kewpa3) {
                return next(new Error('Tiada daftar harta modal ditemui.'));
            }
            const docName = 'cetak-rekod-inden' + `-${kewpa3.ast_type}` + '.pdf';
            const docPath = path.join('print', 'indens', docName);

            const printer = new Printer({
                Lato: {
                    normal: path.resolve('src', 'fonts', 'Lato-Regular.ttf'),
                    bold: path.resolve('src', 'fonts', 'Lato-Bold.ttf'),
                    italics: path.resolve('src', 'fonts', 'Lato-Italic.ttf')
                }
            });

            const title = 'REKOD PERGERAKAN KAD INDEN';
            const no_siri = '';
            const bulan = '';

            let doc;

            doc = printer.createPdfKitDocument({
                pageSize: 'A4',
                pageOrientation: 'landscape',
                content: [
                    {
                        stack: [
                            { text: title, style: 'subheader', alignment: 'center' },

                        ]
                    },
                    {
                        style: 'tableBelow2x',
                        table: {
                            widths: ['*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*'],
                            body: rows
                        }
                        /*
                        table: {
                            widths: [500, 'auto', 'auto'],
                            headerRows: 2,
                            // keepWithHeaderRows: 1,
                            body: [
                                [{rowSpan: 2, text: 'Tarikh Kad Diambil'}, 'Sample value 2', 'Sample value 3'],
                                ['', 'Sample value 2', 'Sample value 3'],
                            ]
                        }
                        */
                    }
                ],
                defaultStyle: {
                    fontSize: 8,
                    font: 'Lato',
                    lineHeight: 1.2
                },
                styles: {
                    subheader: {
                        fontSize: 9,
                        bold: true
                    },
                    tableBelow: {
                        margin: [0, 10, 0, 0],
                    },
                    // tableBelow2x: {
                    //     margin: [0, 20, 0, 0]
                    // },
                    quote: {
                        italics: true
                    },
                    small: {
                        fontSize: 8
                    }
                }
            });
            doc.end();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'inline; filename="' + docName + '"');
            doc.pipe(fs.createWriteStream(docPath));
            doc.pipe(res);
        })
        .catch(err => {
            console.log(err);
            req.flash('error', err.message);
            // res.redirect('/print');
        });
};



