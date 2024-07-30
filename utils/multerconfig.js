const multer = require("multer");
const crypto = require("crypto");
const path = require("path");

//diskStorgas from npm mutler
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(12, function (err, name) {
      const fn = name.toString("hex") + path.extname(file.originalname);
      cb(null, fn);
      // console.log(bytes.toString("hex"));
    });
  },
});

const upload = multer({ storage: storage });
module.exports = upload;
