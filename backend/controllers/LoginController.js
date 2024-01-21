const userController = require("../models/registration");
const HashPasswordx = require("../security/hashing");

const Login = async (req, res, next) => {
  try {
    const { username, password } = req?.body;

    if (!username || !password)
      return res
        .status(400)
        .json({ Alert: `Username or password not provided` });

    const userValidity = await userController
      .findOne({ username: username })
      .exec();

    if (!userValidity) {
      return res.status(403).json({ Alert: `${username} Invalid Username` });
    } else {
      const secure = new HashPasswordx();
      const passwordMatch = secure.compare(password, userValidity.password);

      if (!passwordMatch)
        return res.status(404).json({ Alert: "Invalid password" });

      // Set the "user" cookie to be sent in the response
      res.cookie("user", { username, password }, { maxAge: 60000 });

      // Set session user
      req.session.user = { username, passwordMatch };
      res.redirect("/home");
      return res.status(200).json({
        Alert: `${username} logged in! ${JSON.stringify(req.session.user)}`,
      });
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
};

const status = (req, res) => {
  try {
    if (req.session.user) {
      console.log("Load back!");
      return res.status(200).json({ status: "User is logged in" });
    } else {
      console.log("Cannot Load!");
      return res.status(401).json({ status: "User is not logged in" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const logout = (req, res) => {
  const { loginCounter } = req?.body;
  try {
    if (req.session.user && loginCounter === 1) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          res.status(500).send("Internal Server Error");
        } else {
          res.status(200).send("Logout successful");
        }
      });
    } else {
      res.status(401).send("User not authenticated");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { Login, status, logout };
