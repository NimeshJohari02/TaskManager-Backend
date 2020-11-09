require("../db/mongoose");
const express = require("express");

const userRouter = new express.Router();
const User = require("../model/user");
const authfun = require("../middleware/auth");

userRouter.post("/users", async (req, res) => {
  const newUser = new User(req.body);
  try {
    await newUser.save();
    const newToken = await newUser.generateToken();
    res.status("201").send({ user: newUser, token: newToken });
  } catch (e) {
    res.status(200).send(e);
  }
});

userRouter.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateToken();
    // console.log(token);
    res.send({ user, token });
  } catch (e) {
    // console.log(e);
    res.status(404).send();
  }
});
userRouter.get("/users/me", authfun, async (req, res) => {
  res.send(req.user);
});

userRouter.post("/users/logout", authfun, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (el) => el.token !== req.currToken
    );
    await req.user.save();
    res.send("Logout Successfull");
  } catch (e) {}
});

userRouter.post("/users/logoutAll", authfun, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send("Logged Out Of All Devices ! ");
  } catch (e) {
    res.status(500).send("Error ");
  }
});

userRouter.patch("/users/me", authfun, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValid = updates.every((el) => allowedUpdates.includes(el));
  if (!isValid) {
    return res.status(400).send("Error Invalid Updates");
  }
  try {
    const user = req.user;
    updates.forEach((el) => {
      user[el] = req.body[el];
    });
    await user.save();
    res.send(user);
  } catch (e) {
    res.status(400).send();
  }
});

userRouter.delete("/users/me", authfun, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = userRouter;
