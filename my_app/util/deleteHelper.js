const fs = require('fs');

const deleteFile = (filePath) => {
    fs.unlink(filePath, (err) => {
        if(err) {
            throw (err);
        }
    });
}

exports.deleteFile = deleteFile;

/*  

// This function will also delete Kew.PA-3
exports.postDeleteKewpa3SectionA = async (req, res, next) => {
    const kewpa3Id = req.body.kewpa3Id;
    Kewpa3.findById(kewpa3Id)
        .then(kewpa3 => {
            if(!kewpa3) {
                return next(new Error('Kew.PA-3 tidak ditemui.'));
            }
            deleteHelper.deleteFile(kewpa3.imageUrl);
            return Kewpa3.deleteOne({ _id: kewpa3Id, userId: req.user._id });
        })
        .then(() => {
            console.log('Kewpa3 telah dipadam');
            res.redirect('/index/assets');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};


*/