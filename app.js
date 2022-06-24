require("dotenv").config();
const express = require("express");
const { db, isErrNoData } = require("./db");
const app = express();
const multer = require("multer");
const session = require("express-session");
const bodyParser = require("body-parser");

// 必要なモジュールをインポートする
const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} = require("firebase/storage");
const { initializeApp } = require("firebase/app");

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};
initializeApp(firebaseConfig);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  session({
    secret: "my_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use((req, res, next) => {
  if (req.session.isLoggedIn) {
    res.locals.username = req.session.username;
    res.locals.isLoggedIn = true;
  } else {
    res.locals.username = "ゲスト";
    res.locals.isLoggedIn = false;
  }
  next();
});

app.get("/", (req, res) => {
  return res.render("top.ejs");
});

app.get("/users/:userId", (req, res) => {
  db.one("SELECT * FROM users WHERE id=$1", [req.params.userId])
    .then((data) => {
      res.send(data);
    })
    .catch((error) => {
      console.log("ERROR:", error);
    });
});

app.get("/create-select", (req, res) => {
  return res.render("create-select.ejs");
});

app.get("/login", (req, res) => {
  res.locals.apiKey = firebaseConfig.apiKey;
  res.locals.authDomain = firebaseConfig.authDomain;
  res.locals.projectId = firebaseConfig.projectId;
  res.locals.storageBucket = firebaseConfig.storageBucket;
  res.locals.messagingSenderId = firebaseConfig.messagingSenderId;
  res.locals.appId = firebaseConfig.appId;
  res.locals.measurementId = firebaseConfig.measurementId;
  return res.render("login 3.ejs");
});

app.post("/login", async (req, res) => {
  const firebaseUUiD = req.body.id;
  const username = req.body.name || req.body.email;

  req.session.isLoggedIn = true;
  // ======== write here your code =============
  db.one("SELECT * FROM users WHERE firebase_uuid=$1", [firebaseUUiD])
    .then((data) => {
      // ======== write here your code =============
      // req seesion に対応するdata のフィールドを入れる
      // e.g) req.session.username = data.name;
      req.session.username = data.name;
      res.sendStatus(200);
    })
    .catch((error) => {
      // データが無かった場合
      if (isErrNoData(error)) {
        // ======== write here your code =============
        db.one("INSERT INTO users (firebase_uuid, name) VALUES ($1, $2)", [
          req.body.id,
          username,
        ]) // req.body.id とreq.body.namen など必要なデータを挿入する
          .then((data) => {
            // ======== write here your code =============
            // req seesion に対応するdata のフィールドを入れる
            // e.g) req.session.username = data.name;
            // 1/ req.session.id  にdata.id を追加しておく。works テーブルにデータ挿入するときにreq,session.id にアクセスできるようにする
            // ============================================
            req.session.user_id = data.id;
            req.session.username = data.name;
            res.sendStatus(200);
            return;
          })
          .catch((error) => {
            console.log("ERROR:", error);
            res.sendStatus(500);
            return;
          });
      } else {
        console.log("ERROR:", error);
        res.sendStatus(500);
        return;
      }
    });
});

app.get("/upload", (req, res) => {
  // ======== write here your code =============
  // ログインしていなかったらloginにとばすコードを書きましょう
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  // ===========================================
  return res.render("upload.ejs");
});

app.post("/upload", multer().single("file"), (req, res) => {
  const fileBuf = req.file.buffer;
  // .env 内のUPLOAD_BUCKET=XXXに記載したバケットにアップロードする
  // req.file.originalname はアップロードされたファイルのファイル名
  const fileRef = `${process.env.UPLOAD_BUCKET}/${req.file.originalname}`;

  // firebase storage の情報を取得
  const storage = getStorage();
  const storageRef = ref(storage, fileRef);

  // firebase storage にupload する関数
  uploadBytes(storageRef, fileBuf)
    // then は成功したときに実行される条件文
    .then((result) => {
      // firebase のURLを取得する関数
      getDownloadURL(storageRef).then((url) => {
        // ======== write here your code =============
        // db.one ~ でworks テーブルにインサートするコードを書きましょう。
        // 基本的にl.101 にかかれているusersのインサートと同じです。
        // ユーザーIDはreq.session.id とする
        // ひとまずurl とuserid 以外のexplanationとかはnullにならないように適当に埋めておく
        // =============================================
        db.one("INSERT INTO works (user_id, url, explanation, title, inspiration) VALUES ($1, $2, $3, $4, $5)", [
          req.session.user_id,
          url, 
          req.session.user_id, 
          req.session.user_id, 
          req.session.user_id, 
        ])
        .then((result) => {
          return res.redirect("/success"); // 成功したらsuccessにリダイレクト
        })
      });
    })
    .catch((err) => {
      // catch(err) はエラーしたときに実行される条件文
      res.send(err);
    });
});

app.get("/success", (req, res) => {
  return res.render("success.ejs");
});

app.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    return res.redirect("/");
  });
});

app.get("/painting-know", (req, res) => {
  return res.render("painting-know.ejs");
  // if(req.session.isLoggedIn === true){
  //   ...
  // }else{
  //   ...
  // }
});

app.get("/painting-comment", (req, res) => {
  return res.render("painting-comment.ejs");
});

app.get("/music-comment", (req, res) => {
  return res.render("music-comment.ejs");
});

app.get("/prof", (req, res) => {
  return res.render("prof.ejs");
});

app.get("/purchase", (req, res) => {
  return res.render("purchase.ejs");
});

app.get("/contribute", (req, res) => {
  return res.render("contribute.ejs");
});

app.get("/purchase-finish", (req, res) => {
  return res.render("purchase-finish.ejs");
});

app.get("/contribute-finish", (req, res) => {
  return res.render("contribute-finish.ejs");
});

app.get("/human-know", (req, res) => {
  return res.render("human-know.ejs");
});

app.get("/rinri-know", (req, res) => {
  return res.render("rinri-know.ejs");
});

app.get("/japan-know", (req, res) => {
  return res.render("japan-know.ejs");
});

app.get("/tech-know", (req, res) => {
  return res.render("tech-know.ejs");
});

app.get("/school-know", (req, res) => {
  return res.render("school-know.ejs");
});

app.get("/book-know", (req, res) => {
  return res.render("book-know.ejs");
});

app.get("/movie-know", (req, res) => {
  return res.render("movie-know.ejs");
});

app.get("/music-know", (req, res) => {
  return res.render("music-know.ejs");
});

app.get("/nature-know", (req, res) => {
  return res.render("nature-know.ejs");
});

app.get("/policy-know", (req, res) => {
  return res.render("policy-know.ejs");
});

app.get("/love-know", (req, res) => {
  return res.render("love-know.ejs");
});

app.get("/global-know", (req, res) => {
  return res.render("global-know.ejs");
});

app.get("/corona-know", (req, res) => {
  return res.render("corona-know.ejs");
});

app.get("/sei-know", (req, res) => {
  return res.render("sei-know.ejs");
});

app.get("/battle-know", (req, res) => {
  return res.render("battle-know.ejs");
});

app.get("/event-know", (req, res) => {
  return res.render("event-know.ejs");
});

app.get("/now-know", (req, res) => {
  return res.render("now-know.ejs");
});

app.get("/seikatsu-know", (req, res) => {
  return res.render("seikatsu-know.ejs");
});

app.get("/walk-know", (req, res) => {
  return res.render("walk-know.ejs");
});

app.get("/relation-know", (req, res) => {
  return res.render("relation-know.ejs");
});

app.get("/sns-know", (req, res) => {
  return res.render("sns-know.ejs");
});

app.get("/japanese-know", (req, res) => {
  return res.render("japanese-know.ejs");
});

app.get("/english-know", (req, res) => {
  return res.render("english-know.ejs");
});

app.get("/society-know", (req, res) => {
  return res.render("society-know.ejs");
});

app.get("/math-know", (req, res) => {
  return res.render("math-know.ejs");
});

app.get("/science-know", (req, res) => {
  return res.render("science-know.ejs");
});

app.get("/all-know", (req, res) => {
  return res.render("all-know.ejs");
});

app.get("/moral-know", (req, res) => {
  return res.render("moral-know.ejs");
});

app.get("/info-know", (req, res) => {
  return res.render("info.ejs");
});

app.get("/helth-know", (req, res) => {
  return res.render("helth-know.ejs");
});

app.get("/pe-know", (req, res) => {
  return res.render("pe-know.ejs");
});

app.get("/merosu-know", (req, res) => {
  return res.render("merosu-know.ejs");
});

app.get("/sangetsuki-know", (req, res) => {
  return res.render("sangetsuki-know.ejs");
});

app.get("/friend-know", (req, res) => {
  return res.render("friend-know.ejs");
});

app.get("/ukuraina-know", (req, res) => {
  return res.render("ukuraina-know.ejs");
});

app.get("/rossia-know", (req, res) => {
  return res.render("rossia-know.ejs");
});

app.get("/upload-works", (req, res) => {
  return res.render("upload-works.ejs");
});

app.listen(3000);