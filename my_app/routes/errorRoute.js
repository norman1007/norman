exports.report = function(req, res) {

    var info = res.app.settings.pkginfo,
      msg = res.app.settings.errorMessage || "Internal server error.";
  
    res.render("error", {
      appTitle: info.title,
      pageTitle: "Error",
      msg: msg 
    });
  
  }