require("../db/mongoose");
const express = require("express");
const authfun = require("../middleware/auth");
const TaskRouter = new express.Router();
const Task = require("../model/task");

//! API OPTIONS :)
//* /tasks?completed=true
//* tasks?limit=10&skip=0
//! NOTE WE SKIP BY THE  MULTIPLE OF LIMIT BECAUSE THEN ONLY IT MAKES SENSE
TaskRouter.get("/tasks", authfun, async (req, res) => {
  const completedQuery = req.query.completed;
  let matchPattern = {};
  if (req.query.completed) {
    matchPattern.completed = req.query.completed === "true" ? true : false;
  }

  try {
    // const data = await Task.find({ owner: req.user._id });
    //! SInce We have Setup Ref for the following . WE CAN USE THIS
    await req.user
      .populate({
        path: "tasks",
        match: matchPattern,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
        },
      })
      .execPopulate();
    res.status(200).send(req.user.tasks);
  } catch (e) {
    res.send(e);
  }
});

TaskRouter.get("/tasks/:id", authfun, async (req, res) => {
  try {
    const id = req.params.id;
    const task = await Task.findOne({ _id: id, owner: req.user._id });
    if (!task) {
      return res.status(404).send("Invalid Task Id Or You Dont Own It ");
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

TaskRouter.post("/tasks", authfun, async (req, res) => {
  // const newTask = new Task(req.body);
  const newTask = new Task({ ...req.body, owner: req.user._id });
  try {
    await newTask.save();
    res.status("201").send(newTask);
  } catch (e) {
    res.status("400").send(e);
  }
});

TaskRouter.patch("/tasks/:id", authfun, async (req, res) => {
  const id = req.params.id;
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValid = updates.every((el) => allowedUpdates.includes(el));
  if (!isValid) {
    return res.status(400).send("Error Invalid Updates");
  }
  try {
    const task = await Task.findOne({ _id: id, owner: req.user._id });
    if (!task) {
      return res.status(400).send("Can't Find Task ");
    }
    updates.forEach((e) => (task[e] = req.body[e]));
    await task.save();
    res.send(task);
  } catch (e) {
    // console.log(e);
    res.status(500).send(e);
  }
});

TaskRouter.delete("/tasks/:id", authfun, async (req, res) => {
  const id = req.params.id;
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: id,
      owner: req.user._id,
    });
    if (!deletedTask) {
      return res.status(404).send("Can't Find Task");
    }
    res.send(deletedTask);
  } catch (e) {
    res.status(500).send(e);
  }
});
module.exports = TaskRouter;
