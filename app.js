const express = require("express");
const app = express();
const userModel = require("./models/user.models.js");
const postModel = require("./models/post.models.js");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

const upload = require("./utils/multerconfig.js");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

//now last below we update profileupload route with new profileupload image with the help of image
app.get("/profile/upload", (req, res) => {
  res.render("profileupload");
});

app.post(
  "/profilepicupload",
  isLoggedin,
  upload.single("image"),
  async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email });
    // console.log(req.file);
    user.profilepic = req.file.filename;
    await user.save();
    res.redirect("/profile");
  }
);
//route 1 in chrome localhost:3000/ 1 index.ejs

app.get("/", (req, res) => {
  // console.log("home successful");
  res.render("index");
});
//route 2 in chrome localhost:3000/login
app.get("/login", (req, res) => {
  // console.log("login successful");
  res.render("login");
});
//route 3 in chrome localhost:3000/profile
// to check middlware we make dummy profile route and inject middlware
app.get("/profile", isLoggedin, async (req, res) => {
  let user = await userModel
    .findOne({ email: req.user.email })
    .populate("posts");
  //console.log(user);
  // console.log("login successful");
  // console.log(req.user);
  res.render("profile", { user });
});
//not a route but inside of /profile like and unlike option below post
app.get("/like/:id", isLoggedin, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");

  //likes and unlike algorithm
  if (post.likes.indexOf(req.user.userid) === -1) {
    post.likes.push(req.user.userid); // to increase 1 like
  } else {
    post.likes.splice(post.likes.indexOf(req.user.userid), 1); //to reduce 1 like
  }

  //console.log(req.user);gives userid:....

  await post.save();
  res.redirect("/profile");
});
//it is route inside of /profile route 4 in chrome /edit
app.get("/edit/:id", isLoggedin, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");

  res.render("edit", { post });
});
//it is route inside of /profile route 05 /update
app.post("/update/:id", isLoggedin, async (req, res) => {
  let post = await postModel.findOneAndUpdate(
    { _id: req.params.id },
    { content: req.body.content }
  );

  res.redirect("/profile");
});

//route 06 in chorome html or ejs localhost:3000/avtar
//bleow route is chrome ejs or html file avtar
app.get("/avtar", async (req, res) => {
  res.render("avtar");
});
// route 06
// below image string is taken from form input name value
/*app.post("/upload", upload.single("image"), (req, res) => {
  // console.log(req.body);
  console.log(req.file);
});*/

// 05
//now we create blow post mehtod to use postmodel.js that already imported
app.post("/post", isLoggedin, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  let { content } = req.body;
  let post = await postModel.create({
    user: user._id,
    content,
  });
  user.posts.push(post._id); //user ko btana hy k us ny post create kia hy by id
  await user.save();
  res.redirect("/profile");
});
//01
app.post("/register", async (req, res) => {
  let { email, username, password, name, age } = req.body;
  let user = await userModel.findOne({ email });
  if (user) {
    return res.status(500).send("User already resgistered");
  }
  //if user not exist then we use bcrypt to create user
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      // console.log(hash);
      let user = await userModel.create({
        username,
        name,
        email,
        age,
        password: hash,
      });
      //genrate tokens from jwt
      const token = jwt.sign({ email: email, userid: user._id }, "janab");
      res.cookie("token", token);
      res.send("user registerd successfuly");
    });
  });
});
//02
app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) {
    return res.status(500).send("Username or password Incorrect");
  }

  const match = await bcrypt.compare(password, user.password);
  const token = jwt.sign({ email: email, userid: user._id }, "janab");
  res.cookie("token", token);
  if (!match) {
    return res.status(500).send("Username or password Incorrect");
  }
  //now below line66 comentd due woriking on profile and also write below line with minor change
  //   return res.status(200).send("you are logged in ");
  return res.status(200).redirect("profile");

  // return res.redirect("/login")
});
//03  now we make logout
app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});
// 04  now we make a middleWare for protected routes
function isLoggedin(req, res, next) {
  //console.log(req.cookies);
  if (!req.cookies || !req.cookies.token || req.cookies.token === "")
    //return res.send("You must be logged in");
    //now abve be commented due to working below on profile
    return res.redirect("/login");

  let data = jwt.verify(req.cookies.token, "janab");
  req.user = data;

  next();
}

app.listen(3000);
