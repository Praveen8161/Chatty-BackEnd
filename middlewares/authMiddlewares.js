import { verifyToken } from "../auth/auth.js";
import { User } from "../models/userModel.js";

// Get User By Token
export async function checkUser(req, res, next) {
  try {
    // Check for Token

    if (
      !req.headers.authorization &&
      !req.headers.authorization.startsWith("Bearer")
    ) {
      return res
        .status(401)
        .json({ acknowledged: false, error: "token required" });
    }

    let token = req.headers.authorization.split(" ")[1];
    if (!token)
      return res
        .status(400)
        .json({ acknowledged: false, error: "Token is required" });
    //verify token Id
    const verToken = await verifyToken(token);
    if (!verToken)
      return res
        .status(400)
        .json({ acknowledged: false, error: "No data found" });

    // Find user
    const user = await User.findById({ _id: verToken.id }).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ acknowledged: false, error: "No data found" });

    req.user = user;

    next();
  } catch (err) {
    console.log("In middle ware");

    console.log(err);
    res.status(500).json({ acknowledged: false, error: err });
  }
}
