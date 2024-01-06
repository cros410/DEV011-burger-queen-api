const User = require("../models/user");

module.exports = {
  getUsers: async (req, resp, next) => {
    // TODO: Implement the necessary function to fetch the `users` collection or table
    try {
      const users = await User.find();
      resp.json(users);
    } catch (error) {
      console.error("Error", error);
      resp.status(500).json({ error: "Error al obtener usuarios" });
      next(error);
    }
  },
};
