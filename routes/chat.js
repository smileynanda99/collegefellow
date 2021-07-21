const express = require("express");
const router = express.Router();
const { ensureAuthenticated } = require("../config/auth");
const User = require("../models/user");
const { ChatRoom } = require("../models/chatRoom");
const mongoose = require("mongoose");

router.get("/chat", ensureAuthenticated, function (req, res) {
  res.render("chat", { user: req.user, chatwith: "" });
});

router.get("/chat/:id", ensureAuthenticated, async function (req, res) {
  const { id } = req.params;
  const frnd = await User.findOne({ username: req.user.username })
    .populate({
      path: "following",
      match: { _id: id },
    })
    .exec();
  if (frnd.following.length === 0) {
    await User.findOne({ username: req.user.username })
      .populate({
        path: "chatList.userId",
        $elemMatch: { userId: mongoose.Types.ObjectId(id) },
      })
      .exec((err, result) => {
        if (err) {
          console.log(err);
        } else {
          result.chatList.forEach((ele) => {
            if (ele.userId._id == id) {
              User.findOne({ _id: id }, (err, result) => {
                if (err) {
                  console.log(err);
                } else {
                  return res.render("chat", {
                    user: req.user,
                    chatwith: result,
                  });
                }
              });
            }
          });
          // console.log("gdbd");
          // res.send("You can't send any message to this user without following");
        }
      });
  } else {
    // res.send("fine");
    await User.find(
      {
        _id: req.user._id,
        chatList: { $elemMatch: { userId: mongoose.Types.ObjectId(id) } },
      },
      (err, info) => {
        if (err) {
          console.log(err);
        } else {
          if (info.length === 0) {
            const newChat = new ChatRoom({
              _id: new mongoose.Types.ObjectId(),
            });
            newChat.save((err, res) => {
              if (err) {
                console.log(err);
              } else {
                User.findOneAndUpdate(
                  { username: req.user.username },
                  {
                    $push: {
                      chatList: {
                        userId: mongoose.Types.ObjectId(id),
                        chatId: res._id,
                      },
                    },
                  },
                  { upsert: true, new: true },
                  (err, res1) => {
                    if (err) {
                      console.log(err);
                    }
                  }
                );
                User.findOneAndUpdate(
                  { _id: id },
                  {
                    $push: {
                      chatList: { userId: req.user._id, chatId: res._id },
                    },
                  },
                  { upsert: true, new: true },
                  (err, res2) => {
                    if (err) {
                      console.log(err);
                    }
                  }
                );
              }
            });
          }
          User.findOne({ _id: id }, (err, result) => {
            if (err) {
              console.log(err);
            } else {
              res.render("chat", { user: req.user, chatwith: result });
            }
          });
        }
      }
    );
  }
});

router.post("/room", ensureAuthenticated, async function (req, res) {
  const id = req.body.id;
  const info = await User.findOne({ username: req.user.username }).exec();
  // console.log(info);
  info.chatList.forEach((element) => {
    if (element.userId == id) {
      res.send(element.chatId);
    }
  });
});

router.post("/chatWith", ensureAuthenticated, async function (req, res) {
  const id = req.body.id;
  await User.findOne({ _id: id }).exec((err, result) => {
    if (!err) {
      res.send(result);
    }
  });
});

router.post("/chatList", ensureAuthenticated, async function (req, response) {
  await User.findOne({ username: req.user.username })
    .populate({
      path: "chatList.userId",
    })
    .populate({
      path: "chatList.chatId",
    })
    .exec((err, result) => {
      if (err) {
        console.log(err);
      } else {
        // console.log(result);
        var count = 0;
        var resArray = [];
        result.chatList.forEach((ele) => {
          ChatRoom.findById(ele.chatId)
            .populate({
              path: "chats",
              limit: 1,
              options: { sort: { time: -1 } },
            })
            .limit(5)
            .exec((err, res) => {
              if (err) console.log(err);
              else {
                count++;
                // console.log(typeof(res.chats[0].sender), typeof(req.user._id));
                // console.log(res.chats[0].sender, req.user._id );
                if (String(res.chats[0].sender) === String(req.user._id)) {
                  resArray.push({ ele, who: false });
                } else {
                  resArray.push({ ele, who: true });
                }
                if (count == result.chatList.length) {
                  response.send(resArray);
                }
              }
            });
        });
      }
    });
});

router.post("/chatMessage", ensureAuthenticated, async function (req, res) {
  const room = req.body.room;
  await ChatRoom.findOne({ _id: mongoose.Types.ObjectId(room) })
    .populate({
      path: "chats",
      populate: { path: "sender" },
      options: { sort: { time: -1 }, limit: 7 },
    })
    .exec((err, result) => {
      if (err) {
        console.log(err);
      } else {
        // console.log(result);
        // console.log(result.chats[0].sender._id, req.user._id );
        if (
          result.chats.length !== 0 &&
          String(result.chats[0].sender._id) !== String(req.user._id)
        ) {
          ChatRoom.findOneAndUpdate(
            { _id: room },
            { seen: true },
            (err, res) => {
              if (err) {
                console.log(err);
              }
              // console.log("seen true kr rha hu!!");
            }
          );
        }
        res.send(result);
      }
    });
});

router.post("/oldChatMessage", ensureAuthenticated, async function (req, res) {
  const room = req.body.room;
  const scroll = Number(req.body.scroll);
  await ChatRoom.findOne({ _id: mongoose.Types.ObjectId(room) })
    .populate({
      path: "chats",
      populate: { path: "sender" },
      options: { sort: { time: -1 }, skip: 7 * scroll, limit: 7 },
    })
    .exec((err, result) => {
      if (err) {
        console.log(err);
      } else {
        // console.log(result);
        res.send(result);
      }
    });
});

module.exports = router;
