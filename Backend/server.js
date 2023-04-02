const express = require("express");
const app = express();
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const uploadRoute = require("./routes/upload");
const PORT = 4000;
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

//データベース接続
//mongodbの「connect」「connect your application」より、URLをコピー、.envファイルの作成
mongoose
  .connect(process.env.MONGOURL) //connect()でdbに接続
  .then(() => {
    console.log("DBと接続中...");
  })
  .catch((err) => {
    console.log(err);
  });

//「ミドルウェア」ファイルを分ける、json使用の宣言、ルーティングを行なっている
app.use("/images", express.static(path.join(__dirname, "public/images"))); //冒頭の"images"はfrontendのenvで設定している。参照先を"public/images"に指定している
app.use(express.json());
app.use("/api/users", userRoute); //users.jsでは、/api/usersがデフォルトのURLになる
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);
app.use("/api/upload", uploadRoute);

//ブラウザをクライアントと認識して、getメソッドの結果を表示、バックエンドは今回はexpressで作っている
//("/")エンドポイント、URLに打ち込むと、getメソッドが発動する状態。getやpostメソッドをreqで受け取って、resでバックエンドサーバーからクライアントに返す
// app.get("/", (req, res) => {
//   res.send("hello express");
// });
// app.get("/users", (req, res) => {
//   res.send("users express");
// });
app.listen(PORT, () => console.log("鯖が起動しました"));
