const userService = require("../services/userService");

// User

const getAllUsers = async (req, res, next) => {
  try {
    const { rows } = await userService.getAllUsers();
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { rows } = await userService.getUserById(req.params.id);
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const {
      firstname,
      lastname,
      username,
      email,
      password,
      phone_number,
      role,
    } = req.body;
    if (!firstname || !lastname || !username || !email || !password)
      return res.status(400).json({
        error: "firstname, lastname, username, email, password are required",
      });
    const { rows } = await userService.createUser(
      firstname,
      lastname,
      username,
      email,
      password,
      phone_number,
      role,
    );
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { firstname, lastname, username, email, phone_number } = req.body;
    const { rows } = await userService.updateUser(
      req.params.id,
      firstname,
      lastname,
      username,
      email,
      phone_number,
    );
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["active", "inactive", "suspended"].includes(status))
      return res
        .status(400)
        .json({ error: "status must be active | inactive | suspended" });
    const { rows } = await userService.updateUserStatus(req.params.id, status);
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { rows } = await userService.deleteUser(req.params.id);
    if (!rows.length) return res.status(404).json({ error: "User not found" });
    res.json({ data: { message: "User deleted", user_id: rows[0].user_id } });
  } catch (err) {
    next(err);
  }
};

// User Address

const getAddresses = async (req, res, next) => {
  try {
    const { rows } = await userService.getAddressesByUser(req.params.id);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const createAddress = async (req, res, next) => {
  try {
    const { recipient_name, phone_number, address_detail, is_default } =
      req.body;
    if (!recipient_name || !phone_number || !address_detail)
      return res.status(400).json({
        error: "recipient_name, phone_number, address_detail are required",
      });
    const { rows } = await userService.createAddress(
      req.params.id,
      recipient_name,
      phone_number,
      address_detail,
      is_default,
    );
    res.status(201).json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const { recipient_name, phone_number, address_detail, is_default } =
      req.body;
    const { rows } = await userService.updateAddress(
      req.params.addressId,
      req.params.id,
      recipient_name,
      phone_number,
      address_detail,
      is_default,
    );
    if (!rows.length)
      return res.status(404).json({ error: "Address not found" });
    res.json({ data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const { rows } = await userService.deleteAddress(
      req.params.addressId,
      req.params.id,
    );
    if (!rows.length)
      return res.status(404).json({ error: "Address not found" });
    res.json({
      data: { message: "Address deleted", address_id: rows[0].address_id },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};
