const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// User CRUD
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
router.patch("/:id/status", userController.updateUserStatus);
router.delete("/:id", userController.deleteUser);

// User Address
router.get("/:id/addresses", userController.getAddresses);
router.post("/:id/addresses", userController.createAddress);
router.put("/:id/addresses/:addressId", userController.updateAddress);
router.delete("/:id/addresses/:addressId", userController.deleteAddress);

module.exports = router;
