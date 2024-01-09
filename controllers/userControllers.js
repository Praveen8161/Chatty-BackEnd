import { generateToken } from "../auth/auth.js";
import { User } from "../models/userModel.js";

// Register Users // Route - POST - ' /user/register '
export async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    // Check fields
    if (!name || !email || !password) {
      res
        .status(400)
        .json({ acknowledged: false, error: "Field are required" });
    }

    // Check user exist
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res
        .status(404)
        .json({ acknowledged: false, error: "Invalid credentials" });
    }

    // Save User
    const user = await new User({
      name,
      email,
      password,
    }).save();

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        pic: user.pic,
        token: generateToken(user._id),
        acknowledged: true,
      });
    } else {
      return res
        .status(400)
        .json({ acknowledged: false, error: "Error saving user data" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ acknowledged: false, error: err });
  }
}

// Login User // Route - POST - ' /user/login '
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    // Get User
    const user = await User.findOne({ email });

    // Check the user and password
    if (user && (await user.matchPassword(password))) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        pic: user.pic,
        token: generateToken(user._id),
        acknowledged: true,
      });
    } else {
      return res
        .status(401)
        .json({ acknowledged: false, error: "Invalid email or Password" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ acknowledged: false, error: err });
  }
}

// Get All Users - Search users // Route - GET - ' /user?search=praveen '
export async function getAllUsers(req, res) {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword)
      .find({ _id: { $ne: req.user._id } })
      .select("-password");

    if (!users || users.length < 1)
      return res
        .status(404)
        .json({ acknowledged: false, error: "No User Found" });

    return res.status(201).json({ acknowledged: true, users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ acknowledged: false, error: err });
  }
}
