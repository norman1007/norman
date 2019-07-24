const fs = require("fs");
const path = require("path");
const Printer = require("pdfmake");
const { validationResult } = require("express-validator/check");

/* REQUIRING THE MODELS FOR STORE USER DATA TO DB */
const User = require("../models/user");
const Kewpa3 = require("../models/kewpa3");
const Suppliers = require("../models/suppliers");
const Placements = require("../models/placements");
const Maintainances = require("../models/maintainances");
const Indens = require("../models/indens");
const PegawaiAset = require("../models/assetsOfficer");
const PegawaiKend = require("../models/appointing_maintainance");
// const Discussions = require('../models/discussions');

/* ------------------------------------------------------ */
// Get all assets
exports.getAllAssets = async (req, res, next) => {
  /* Search function */
  function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  }

  /* Jumlah Aset */
  const sum_ori_acq = await Kewpa3.aggregate()
    .group({
      _id: null,
      total: { $sum: "$ori_acq" }
    })
    .exec();

  /* Jumlah Aset Alih */
  const sum_movable_assets = await Kewpa3.aggregate()
    .match({
      assets_category: "movable_aset"
    })
    .group({
      _id: null,
      total: { $sum: "$ori_acq" }
    })
    .exec();

  /* Jumlah Selenggara */
  const sum_mtnc = await Maintainances.aggregate()
    .group({
      _id: null,
      total: { $sum: "$total" }
    })
    .exec();

  /* Jumlah Pergerakan Inden */
  const sum_indens = await Indens.aggregate()
    .group({
      _id: null,
      total: { $sum: "$amountFilled" }
    })
    .exec();

  /* START - Function untuk tambah Kewpa3, Maintainances, Indens collections */
  // Jumlah Aset Alih
  function jumlahAsetAlih() {
    sum_ori_acq.forEach(el => {
      result1 = el.total;
    });
    return result1;
  }
  jumlahAsetAlih();

  // Jumlah Selenggara
  function jumlahSelenggara() {
    sum_mtnc.forEach(el => {
      result2 = el.total;
    });
    return result2;
  }

  // Jumlah Inden
  function jumlahInden() {
    sum_indens.forEach(el => {
      result3 = el.total;
    });
    return result3;
  }

  // Final stage for adding 3 collection before export for variable
  async function all3Collection() {
    const jumlah1 = await jumlahAsetAlih();
    const jumlah2 = await jumlahSelenggara();
    const jumlah3 = await jumlahInden();

    return jumlah1 + jumlah2 + jumlah3;
  }

  // The result of adding the collection
  const allSum = await all3Collection();
  /* END - Function untuk tambah Kewpa3, Maintainances, Indens collections */

  const p_asset = await PegawaiAset.find()
    .populate("p_aset_name")
    .exec();
  const p_kend = await PegawaiKend.find()
    .populate("p_kend_name")
    .exec();

  // Maintainances Graph
  const maintainancesStat = await Kewpa3.aggregate([
    { $unwind: "$maintainances" },
    {
      $group: {
        _id: "$ast_reg",
        number: { $sum: "$maintainances.total" }
      }
    }
  ]).exec();

  // Maintainances Table
  const maintainancesTable = await Kewpa3.aggregate([
    { $unwind: "$maintainances" },
    {
      $group: {
        _id: "$ast_reg",
        number: { $sum: "$maintainances.total" },
        mtncCount: { $sum: 1 }
      }
    }
  ]).exec();

  // Bil. Selenggara on Maintainances Table
  const maintainancesCount = await Kewpa3.aggregate([
    { $unwind: "$maintainances" },
    {
      $group: {
        _id: "$ast_reg",
        number: { $sum: "$maintainances.total" },
        mtncCount: { $sum: 1 }
      }
    },
    {
      $count: "allCount"
    }
  ]).exec();

  /* Rekod Penggunaan Minyak */
  const indensTable = await Kewpa3.aggregate([
    { $unwind: "$indens" },
    {
      $group: {
        _id: "$ast_reg",
        sumLiter: { $sum: "$indens.liter" },
        sumRM: { $sum: "$indens.amountFilled" }
      }
    }
  ]).exec();
  // console.log(indensTable);

  /*
    const sumAll = await Kewpa3.aggregate([
        { 
            $unwind: "$maintainances" 
        },
        {
            $group: {
                _id: "$ast_reg",
                number: { $sum: "$maintainances.total" },
            }
        },
        {
            $unwind: "$indens"
        },
        {
            $group: {
                _id: "$ast_reg",
                // liter: { $sum: "$indens.liter" },
                amountFilled: { $sum: "$indens.amountFilled" }
            }
        },
        {
            $project: {
                'summAll': { $sum: ['$number', '$amountFilled'] }
            }
        }
    ]).exec();
    console.log(sumAll);
    */

  /* Format number function */
  const formatNumber = (n, c, d, t) => {
    var c = isNaN((c = Math.abs(c))) ? 2 : c,
      d = d == undefined ? "." : d,
      t = t == undefined ? "," : t,
      s = n < 0 ? "-" : "",
      i = String(parseInt((n = Math.abs(Number(n) || 0).toFixed(c)))),
      j = (j = i.length) > 3 ? j % 3 : 0;

    return (
      s +
      (j ? i.substr(0, j) + t : "") +
      i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) +
      (c
        ? d +
          Math.abs(n - i)
            .toFixed(c)
            .slice(2)
        : "")
    );
  };

  const pageTitle = "Senarai Aset";
  let SearchFunction = req.query.search;
  const perPage = 10;
  const pageQuery = parseInt(req.query.page);
  const pageNumber = pageQuery ? pageQuery : 1;
  let noMatch = null;

  if (SearchFunction) {
    const searchAbility = new RegExp(escapeRegex(SearchFunction), "gi");
    const file_ast = searchAbility;
    const ast_reg = searchAbility;

    Kewpa3.find()
      .countDocuments({ ast_reg })
      .then(assets => {
        totalItems = assets;
        return (
          Kewpa3.find({ ast_reg })
            // .populate('userId')
            .skip(perPage * pageNumber - perPage)
            .limit(perPage)
            .sort({ createdAt: -1 })
        );
      })
      .then(assets => {
        if (assets.length < 1) {
          noMatch = "Sila cari semula!";
        }
        try {
          res.render("main/assets/all", {
            pageTitle,
            assets,
            allSum,
            sum_ori_acq,
            sum_indens,
            sum_movable_assets,
            sum_mtnc,
            maintainancesStat,
            maintainancesTable,
            maintainancesCount,
            indensTable,
            p_asset,
            p_kend,
            currentUser: req.user,
            current: pageNumber,
            pages: Math.ceil(totalItems / perPage),
            noMatch,
            search: SearchFunction,
            itemCounts: totalItems,
            formatNumber
          });
        } catch (err) {
          console.log("Error dari render aset page: " + err);
        }
      })
      .catch(err => {
        console.log("Error dari promise that find ast_reg: " + err);
        req.flash("error", err.message);
        res.redirect("back");
      });
  } else {
    Kewpa3.find()
      .countDocuments({})
      .then(assets => {
        totalItems = assets;
        return (
          Kewpa3.find({})
            // .populate('userId')
            .skip(perPage * pageNumber - perPage)
            .limit(perPage)
            .sort({ createdAt: -1 })
        );
      })
      .then(assets => {
        try {
          res.render("main/assets/all", {
            pageTitle,
            assets,
            allSum,
            sum_ori_acq,
            sum_indens,
            sum_movable_assets,
            sum_mtnc,
            maintainancesStat,
            maintainancesTable,
            maintainancesCount,
            indensTable,
            p_asset,
            p_kend,
            currentUser: req.user,
            current: pageNumber,
            pages: Math.ceil(totalItems / perPage),
            noMatch,
            search: false,
            itemCounts: totalItems,
            formatNumber
          });
        } catch (err) {
          console.log("Error dari render aset page: " + err);
        }
      })
      .catch(err => {
        console.log("Error dari promise that not has search function: " + err);
        req.flash("error", err.message);
        res.redirect("back");
      });
  }
};

// Get insert new assets
exports.getNewAssets = async (req, res, next) => {
  const pageTitle = "Daftar Aset Baharu";
  let suppliers = await Suppliers.find().exec();

  try {
    res.render("main/assets/new", {
      pageTitle,
      suppliers,
      hasError: false,
      errorMsg: null,
      oldInput: {
        file_ast: "",
        ast_desc: "",
        ast_type: "",
        cat: "",
        ori_acq: "",
        acq_dt: "",
        rcv_dt: "",
        casis: "",
        lOrder: "",
        ast_reg: "",
        sup: "",
        supAddr: ""
      },
      boxColorValidate: []
    });
  } catch (err) {
    console.log(err);
  }
};

// Post new assets
exports.postNewAsset = async (req, res, next) => {
  const file_ast = req.body.file_ast;
  const nas_code = req.body.nas_code;
  const ast_desc = req.body.ast_desc;
  const cat = req.body.cat;
  const sub_cat = req.body.sub_cat;
  const ast_type = req.body.ast_type;
  const ast_make = req.body.ast_make;
  const ori_acq = req.body.ori_acq;
  const eng_no = req.body.eng_no;
  const acq_dt = req.body.acq_dt;
  const rcv_dt = req.body.rcv_dt;
  const casis = req.body.casis;
  const lOrder = req.body.lOrder;
  const ast_reg = req.body.ast_reg;
  const wrnt = req.body.wrnt;
  const sup = req.body.sup;
  const supAddr = req.body.supAddr;
  const spec = req.body.spec;
  const assets_category = req.body.assets_category;
  const userId = {
    id: req.user._id,
    emp_name: req.user.emp_name,
    username: req.user.username,
    department: req.user.department
  };

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    let assets = await Kewpa3.find().exec();
    let suppliers = await Suppliers.find().exec();

    return res.status(422).render("main/assets/new", {
      pageTitle: "Isi semula Kew.PA-3",
      assets,
      suppliers,
      hasError: true,
      assets: {
        file_ast: file_ast,
        nas_code: nas_code,
        ast_desc: ast_desc,
        cat: cat,
        sub_cat: sub_cat,
        ast_type: ast_type,
        ast_make: ast_make,
        ori_acq: ori_acq,
        eng_no: eng_no,
        acq_dt: acq_dt,
        rcv_dt: rcv_dt,
        casis: casis,
        lOrder: lOrder,
        ast_reg: ast_reg,
        wrnt: wrnt,
        sup: sup,
        supAddr: supAddr,
        spec: spec
      },
      oldInput: {
        file_ast: file_ast,
        ast_desc: ast_desc,
        ast_type: ast_type,
        cat: cat,
        ori_acq: ori_acq,
        acq_dt: acq_dt,
        rcv_dt: rcv_dt,
        casis: casis,
        lOrder: lOrder,
        ast_reg: ast_reg,
        sup: sup,
        supAddr: supAddr
      },
      errorMsg: errors.array()[0].msg,
      boxColorValidate: errors.array()
    });
  }

  const newAsset = new Kewpa3({
    file_ast: file_ast,
    nas_code: nas_code,
    ast_desc: ast_desc,
    cat: cat,
    sub_cat: sub_cat,
    ast_type: ast_type,
    ast_make: ast_make,
    ori_acq: ori_acq,
    eng_no: eng_no,
    acq_dt: acq_dt,
    rcv_dt: rcv_dt,
    casis: casis,
    lOrder: lOrder,
    ast_reg: ast_reg,
    wrnt: wrnt,
    sup: sup,
    supAddr: supAddr,
    spec: spec,
    assets_category: assets_category,
    userId: req.user
  });

  await newAsset
    .save()
    .then(data => {
      req.flash("success", "New asset has successfully create.");
      res.redirect("/index/assets");
    })
    .catch(err => {
      console.log(err);
      req.flash("error", err.message);
      res.redirect("back");
    });
};

// Get one asset
exports.getOneAsset = async (req, res, next) => {
  // const slugAsset = req.params.slugAsset;

  /* 
    BEGIN Darrells aggregation code

    set month and year based on the query string and convert it to an integer
  */
  const month = parseInt(req.query.month);
  const year = parseInt(req.query.year);
  /* 
    Define the variables needed outside of the loop 
    that way the page will still work even if nothing is returned.

    IF you rename any of the variables below, make sure you also change them
    where you are rendering the page and within your ejs file.
  */
  let sortedAssets;
  let adjustedTotalAmt;
  let allMaint;
  /* 
    If query includes month and year params
  */
  if (month && year || month && !year) {
    sortedAssets = await Maintainances.aggregate([
      /* 
        $addFields will just append 2 new fields to the returned documents
        then we can use $match to only return the documents that fit the criteria.
        https://docs.mongodb.com/manual/reference/operator/aggregation/addFields/
      */
      {
        $addFields: {
          month: { $month: "$date" },
          year: { $year: "$date" }
        }
      },
      {
        /* 
          Match by month and year, if year is not selected then it will default to the current year
        */
        $match: {
          month,
          year: year || new Date().getFullYear()
        }
      }
    ]).exec();
    let totals = 0;
    sortedAssets.forEach(totalAmt => {
      totals += totalAmt.total;
    });
    /* 
      Convert totals to adjustedTotalAmt and only allow 2 digits after the decimal(for currency)
    */
    adjustedTotalAmt =
      Math.round(totals * Math.pow(10, 2)) / Math.pow(10, 2).toFixed(2);
    /* 
      If query only contains a year param
    */
  } else if (year && !month) {
    sortedAssets = await Maintainances.aggregate([
      /* 
        $addFields will just append 2 new fields to the returned documents
        then we can use $match to only return the documents that fit the criteria.
        https://docs.mongodb.com/manual/reference/operator/aggregation/addFields/
      */
      {
        $addFields: {
          year: { $year: "$date" }
        }
      },
      {
        $match: {
          year: parseInt(year)
        }
      }
    ]).exec();
    let totals = 0;
    sortedAssets.forEach(totalAmt => {
      totals += totalAmt.total;
    });
    /* 
      Convert totals to adjustedTotalAmt and only allow 2 digits after the decimal(for currency)
    */
    adjustedTotalAmt =
      Math.round(totals * Math.pow(10, 2)) / Math.pow(10, 2).toFixed(2);
  } else {
    allMaint = await Maintainances.aggregate([
      /* 
        $addFields will just append 2 new fields to the returned documents
        then we can use $match to only return the documents that fit the criteria.
        https://docs.mongodb.com/manual/reference/operator/aggregation/addFields/
      */
      {
        $group: { 
          _id: {
            month: {
              $month: "$date"
            },
            year: {
              $year: "$date"
            }
          },
          titles: {
            $push: {
              title: '$title'
            }
          },
          total: { $sum: '$total'} ,
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': -1,
          '_id.month': -1,
        }
      }
    ]).exec();
  }
  /* END Darrells aggregation code */

  const assetId = req.params.id;
  const p_kend = await PegawaiKend.find()
    .populate("p_kend_name")
    .exec();
  const p_asset = await PegawaiAset.find()
    .populate("p_aset_name")
    .exec();

  /*
    db.collection.aggregate([

        // Unwind the first array
        { "$unwind": "$clicks" },

        // Sum results and keep the other array per document
        {
            "$group": {
                "_id": "$_id",
                "total_clicks": { "$sum": "$clicks.clicks" }
            "impressions": { "$first": "$impressions" }
            }
        },

        // Unwind the second array
        { "$unwind": "$impressions" },

        // Group the final result keeping the first result
        {
            "$group": {
                "_id": "$_id",
                "total_clicks": { "$first": "$total_clicks" },
                "total_impressions": { "$sum": "$impressions.impressions" }
            }
        }

    ])
    */

  /* Format number function */
  const formatNumber = (n, c, d, t) => {
    var c = isNaN((c = Math.abs(c))) ? 2 : c,
      d = d == undefined ? "." : d,
      t = t == undefined ? "," : t,
      s = n < 0 ? "-" : "",
      i = String(parseInt((n = Math.abs(Number(n) || 0).toFixed(c)))),
      j = (j = i.length) > 3 ? j % 3 : 0;

    return (
      s +
      (j ? i.substr(0, j) + t : "") +
      i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) +
      (c
        ? d +
          Math.abs(n - i)
            .toFixed(c)
            .slice(2)
        : "")
    );
  };

  const limitUserChatName = (name, limit = 14) => {
    const newName = [];
    if (name.length > limit) {
      name.split(" ").reduce((acc, cur) => {
        if (acc + cur.length <= limit) {
          newName.push(cur);
        }
        return acc + cur.length;
      }, 0);

      return `${newName.join(" ")}...`;
    }
    return name;
  };

  // let asset = await Kewpa3.findOne({ slugAsset: req.params.slugAsset })
  let a = await Kewpa3.findById(assetId);
  let asset = await Kewpa3.findById(assetId)
    .populate("userId")
    .populate("sup");
  // .populate('placements')
  // .populate('maintainances') I comment it out because in schema : maintainances is Object and it does not require populate to get the data.
  let users = await User.find().exec();
  let grpCht = await Kewpa3.findById(assetId)
    .populate({
      path: "discussions", // 1st level subdoc (get discussions)
      populate: {
        path: "sender", // 2nd level subdoc (get users in discussions)
        select: "emp_name"
      }
    })
    .exec();

  let placements = await Placements.find().exec();
  placements = await Placements.paginate(
    {
      _id: {
        $in: asset.placements
      }
    },
    {
      page: req.query.page || 1,
      limit: 10,
      sort: { createdAt: -1 }
    }
  );
  let maintainances = await Maintainances.paginate(
    {
      _id: {
        $in: asset.maintainances
      }
    },
    {
      page: req.query.page || 1,
      limit: 1,
      sort: "-date"
    }
  );
  let indens = await Indens.paginate(
    {
      _id: {
        $in: asset.indens
      }
    },
    {
      page: req.query.page || 1,
      limit: 100,
      sort: { createdAt: -1 }
    }
  );

  placements.page = Number(placements.page);
  maintainances.page = Number(maintainances.page);
  indens.page = Number(indens.page);

  const pageTitle = asset.file_ast;
  try {
    res.render("main/assets/show", {
      pageTitle,
      asset,
      users,
      userChats: req.user,
      placements,
      maintainances,
      indens,
      formatNumber,
      sortedAssets,
      adjustedTotalAmt,
      allMaint,
      p_asset,
      p_kend,
      grpCht,
      limitUserChatName,
      hasError: false,
      errorMsg: null,
      oldInput: {
        offName: "",
        plcDate: "",
        loc: ""
      },
      boxColorValidate: []
    });
  } catch (err) {
    console.log("Error dari render page: " + err);
  }
};

// Get edit one asset
exports.getEditOneAsset = async (req, res, next) => {
  const kewpa3Id = req.params.id;
  let suppliers = await Suppliers.find().exec();

  Kewpa3.findById(kewpa3Id)
    .populate("sup")
    .then(updateAsset => {
      res.render("main/assets/edit", {
        asset: updateAsset,
        pageTitle: updateAsset.file_ast + " aset sedang dikemaskini",
        suppliers,
        hasError: false,
        errorMsg: null,
        oldInput: {
          file_ast: "",
          ast_desc: "",
          ast_type: "",
          cat: "",
          ori_acq: "",
          acq_dt: "",
          rcv_dt: "",
          casis: "",
          lOrder: "",
          ast_reg: "",
          sup: "",
          sup_addr: ""
        },
        boxColorValidate: []
      });
    })
    .catch(err => {
      console.log(err);
      req.flash("error", err.message);
      res.redirect("back");
    });
};

// Put edit one asset
exports.putEditOneAsset = async (req, res, next) => {
  const kewpa3Id = req.params.id;
  const PUTasset = req.body.asset;
  const file_ast = req.body.file_ast;
  const nas_code = req.body.nas_code;
  const ast_desc = req.body.ast_desc;
  const cat = req.body.cat;
  const sub_cat = req.body.sub_cat;
  const ast_type = req.body.ast_type;
  const ast_make = req.body.ast_make;
  const ori_acq = req.body.ori_acq;
  const eng_no = req.body.eng_no;
  const acq_dt = req.body.acq_dt;
  const rcv_dt = req.body.rcv_dt;
  const casis = req.body.casis;
  const lOrder = req.body.lOrder;
  const ast_reg = req.body.ast_reg;
  const wrnt = req.body.wrnt;
  const sup = req.body.sup;
  const supAddr = req.body.supAddr;
  const spec = req.body.spec;
  const assets_category = req.body.assets_category;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Error validation: " + errors.array());
    let asset = await Kewpa3.find().exec();
    let suppliers = await Suppliers.find().exec();

    return res.status(422).render("main/assets/edit", {
      pageTitle: "Kemaskini semula Kew.PA-3",
      asset,
      suppliers,
      hasError: true,
      assets: {
        file_ast: file_ast,
        nas_code: nas_code,
        ast_desc: ast_desc,
        cat: cat,
        sub_cat: sub_cat,
        ast_type: ast_type,
        ast_make: ast_make,
        ori_acq: ori_acq,
        eng_no: eng_no,
        acq_dt: acq_dt,
        rcv_dt: rcv_dt,
        casis: casis,
        lOrder: lOrder,
        ast_reg: ast_reg,
        wrnt: wrnt,
        sup: sup,
        supAddr: supAddr,
        spec: spec
      },
      oldInput: {
        file_ast: file_ast,
        ast_desc: ast_desc,
        ast_type: ast_type,
        cat: cat,
        ori_acq: ori_acq,
        acq_dt: acq_dt,
        rcv_dt: rcv_dt,
        casis: casis,
        lOrder: lOrder,
        ast_reg: ast_reg,
        sup: sup,
        supAddr: supAddr
      },
      errorMsg: errors.array()[0].msg,
      boxColorValidate: errors.array()
    });
  }

  Kewpa3.findByIdAndUpdate(kewpa3Id, PUTasset)
    .then(asset => {
      asset.file_ast = file_ast;
      asset.nas_code = nas_code;
      asset.ast_desc = ast_desc;
      asset.cat = cat;
      asset.sub_cat = sub_cat;
      asset.ast_type = ast_type;
      asset.ast_make = ast_make;
      asset.ori_acq = ori_acq;
      asset.eng_no = eng_no;
      asset.acq_dt = acq_dt;
      asset.rcv_dt = rcv_dt;
      asset.casis = casis;
      asset.lOrder = lOrder;
      asset.ast_reg = ast_reg;
      asset.wrnt = wrnt;
      asset.sup = sup;
      asset.supA = supAddr;
      asset.spec = spec;
      asset.assets_category = assets_category;
      return asset.save().then(result => {
        console.log("Error dari findOne and update: " + result);
        req.flash("success", result.file_ast + " telah dikemaskini");
        // res.redirect('/index/assets/' + result._id);
        res.redirect("/index/assets");
      });
    })
    .catch(err => {
      console.log("Error dari Promise: " + err);
      req.flash("error", err.message);
      res.redirect("back");
    });
};
