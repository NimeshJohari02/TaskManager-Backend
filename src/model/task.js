const mongoose = require("mongoose");
const TaskSchema = new mongoose.Schema(
  {
    description: {
      trim: true,
      required: true,
      type: String,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
