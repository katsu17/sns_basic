const router = require("express").Router(); //expressを使う宣言
const User = require("../routes/models/User");

//CRUD
//ユーザー情報の更新
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("ユーザー情報が更新されました");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res
      .status(403)
      .json("あなたは自分のアカウントの時だけ情報を更新できます");
  }
});

//ユーザー情報の削除
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("ユーザー情報が削除されました");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res
      .status(403)
      .json("あなたは自分のアカウントの時だけ情報を削除できます");
  }
});

//ユーザー情報の取得
// router.get("/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     const { password, updatedAt, ...other } = user._doc;
//     return res.status(200).json(other);
//   } catch (err) {
//     return res.status(500).json(err);
//   }
// });

//クエリでユーザー情報を取得
router.get("/", async (req, res) => {
  const userId = req.query.userId; // queryは?直後のパラメータ以降のランダムな値を取りにいく
  const username = req.query.username;
  try {
    const user = userId
      ? await User.findById(userId)
      : await User.findOne({ username: username });

    const { password, updatedAt, ...other } = user._doc;
    return res.status(200).json(other);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//ユーザーのフォロー
router.put("/:id/follow", async (req, res) => {
  //フォローするURL
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id); //フォロー相手のid
      const currentUser = await User.findById(req.body.userId);
      //フォロワーに自分がいなかったらフォローできる
      if (!user.followers.includes(req.body.userId)) {
        //相手のフォロワーに自分を追加
        await user.updateOne({
          $push: {
            followers: req.body.userId,
          },
        });
        //自分のフォローに相手を追加
        await currentUser.updateOne({
          $push: {
            followings: req.params.id,
          },
        });
        return res.status(200).json("フォローに成功しました");
      } else {
        return res
          .status(403)
          .json("あなたはすでにこのユーザーをフォローしています");
      }
    } catch {
      return res.status(500).json(err);
    }
  } else {
    return res.status(500).json("自分自身はフォローできません");
  }
});

//ユーザーのフォローを外す
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id); //フォロー相手のid
      const currentUser = await User.findById(req.body.userId);
      //相手のフォロワーに自分が存在したらフォローを外せる
      if (user.followers.includes(req.body.userId)) {
        //相手のフォロワーに自分を追加
        await user.updateOne({
          $pull: {
            followers: req.body.userId,
          },
        });
        //自分のフォローに相手を追加
        await currentUser.updateOne({
          $pull: {
            followings: req.params.id,
          },
        });
        return res.status(200).json("フォロー解除に成功しました");
      } else {
        return res.status(403).json("このユーザーはフォロー解除できません");
      }
    } catch {
      return res.status(500).json(err);
    }
  } else {
    return res.status(500).json("自分自身はフォロー解除できません");
  }
});

// router.get("/", (req, res) => {
//   res.send("user router");
// });

module.exports = router;
