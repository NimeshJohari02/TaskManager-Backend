const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("./task");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      lowecase: true,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email Not Valid ");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      // ! minlength:6 This can also be used to validate Length
      validate(value) {
        if (value.length <= 6) {
          throw new Error("The Password Should Be Greater than 6 Letters");
        }
        if (value.toLowerCase().includes("password")) {
          throw new Error(" 'Password' Not Allowed ");
        }
      },
    },
    age: {
      type: Number,
      default: 0,
      validate(value) {
        if (value < 0) {
          throw new Error("Age must be +ve ");
        }
      },
    },
    avatar: { type: Buffer },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
userSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "owner",
});
userSchema.pre("save", async function (next) {
  const user = this;
  // console.log("Before Save");
  if (user.isDirectModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});
userSchema.methods.generateToken = async function () {
  user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "NewSecretToken");
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async (email, pass) => {
  const user = await User.findOne({ email: email });
  // console.log(user);
  if (!user) {
    throw new Error("Unable To Find User By Email");
  }
  const matchedPassword = await bcrypt.compare(pass, user.password);
  if (!matchedPassword) {
    throw new Error("The User And The Passwords do not match");
  }
  return user;
};

userSchema.methods.toJSON = function () {
  const user = this;
  const userData = user.toObject();
  delete userData.password;
  delete userData.tokens;
  delete userData.avatar;
  return userData;
};

userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
