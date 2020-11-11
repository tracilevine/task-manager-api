const router = require("express").Router(),
  { createUser, loginUser } = require("../../controllers/users");

router.post("/", createUser);
router.post("/login", loginUser);

module.exports = router;
