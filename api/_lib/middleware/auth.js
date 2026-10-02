import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
  const userId = req.auth?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Sign in with your admin account to continue.",
    });
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const roles = [user.privateMetadata?.role, user.publicMetadata?.role];

    if (
      !roles.some(
        (role) => typeof role === "string" && role.toLowerCase() === "admin",
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin access is not enabled for this account. Set role to admin in your Clerk user metadata.",
      });
    }
  } catch (error) {
    return next(error);
  }

  return next();
};