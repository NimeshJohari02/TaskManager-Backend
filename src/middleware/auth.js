const jwt = require("jsonwebtoken");
const User = require("../model/user");
const authfun = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = await jwt.verify(token, "NewSecretToken");

    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error("User Not Authenticated ");
    }
    req.currToken = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ Error: "Please Enter Valid Auth" });
  }
};

module.exports = authfun;
