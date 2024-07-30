const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/miniproject");

const postSchema = mongoose.Schema(
  {
    content: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  { timestamps: true }
);
module.exports = mongoose.model("post", postSchema);
