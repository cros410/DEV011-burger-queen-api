const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("../config");
const User = require("../models/user");

const { secret } = config;

module.exports = (app, nextMain) => {
  app.post("/login", (req, resp, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(400);
    }

    // TODO: Authenticate the user
    User.findOne({ email })
      .then((user) => {
        if (!user) {
          return resp.status(401).json({ error: "Credencial invalida" });
        }
        // It is necessary to confirm if the email and password
        const passwordValid = bcrypt.compareSync(password, user.password);
        if (!passwordValid) {
          return resp.status(404).json({ error: "Credencial invalida" });
        }
        const token = jwt.sign(
          { userId: user._id, email: user.email },
          secret,
          {
            expiresIn: "1h",
          }
        );
        resp.json({ token });
      })
      .catch((error) => {
        console.error("No se pudo autenticar user:", error);
        next(error);
      });

    // match a user in the database
    // If they match, send an access token created with JWT

    next();
  });

  return nextMain();
};
