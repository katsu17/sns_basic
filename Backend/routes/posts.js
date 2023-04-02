const router = require("express").Router();
const Post = require("../routes/models/Post");
const User = require("../routes/models/User");

//投稿を作成する
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savePost = await newPost.save();
    return res.status(200).json(savePost);
  } catch {
    return res.status(500).json(err);
  }
});

//投稿を更新する
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({
        $set: req.body,
      });
      return res.status(200).json("投稿編集に成功しました");
    } else {
      return res.status(403).json("あなたは他の人の投稿を編集できません");
    }
  } catch {
    return res.status(403).json(err);
  }
});

//投稿を削除する
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      return res.status(200).json("投稿削除に成功しました");
    } else {
      return res.status(403).json("あなたは他の人の投稿を削除できません");
    }
  } catch {
    return res.status(403).json(err);
  }
});

//投稿を取得する
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    return res.status(200).json(post);
  } catch {
    return res.status(403).json(err);
  }
});

//特定の投稿にいいねする
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); //req.params.idは冒頭の:idを指定している
    //まだ投稿にいいねを押していなかったらいいねできる
    if (!post.likes.includes(req.body.userId)) {
      //likes（postSchema）に自分のidがなければ追加する処理
      await post.updateOne({
        $push: {
          likes: req.body.userId,
        },
      });
      return res.status(200).json("投稿にいいねしました");
    } else {
      //すでにいいねを押していたら再度いいねした人のIDを取り除く
      await post.updateOne({
        $pull: {
          likes: req.body.userId,
        },
      });
      return res.status(403).json("投稿のいいねを外しました");
    }
  } catch {
    return res.status(500).json(err);
  }
});

//プロフィール専用のタイムラインの取得
router.get("/profile/:username", async (req, res) => {
  //userIdは元々all
  try {
    const user = await User.findOne({ username: req.params.username }); //paramsは元々body（bodyはポストマンで使ったリクエストボディーのこと）
    const posts = await Post.find({ userId: user._id }); //currentUserの_id（投稿に振られたオブジェクトid）を取得している
    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//タイムラインの投稿を取得
//すでにgetメソッドは使っているので、/allとして他のurlを差別化が必要
router.get("/timeline/:userId", async (req, res) => {
  //userIdは元々all
  try {
    const currentUser = await User.findById(req.params.userId); //paramsは元々body
    const userPosts = await Post.find({ userId: currentUser._id }); //currentUserの_id（投稿に振られたオブジェクトid）を取得している
    //自分がフォローしている人の投稿内容を全て取得する
    const friendPosts = await Promise.all(
      //↑awaitの非同期を行なっていて、いつ返って来るかわからない、promiseを取り除くと空の配列になる=非同期処理の配列を作るときにpromiseが必要？
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    return res.status(200).json(userPosts.concat(...friendPosts)); //concat()で配列を組み合わせる
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
