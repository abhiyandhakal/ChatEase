import { Elysia, error, t } from "elysia";
import authHeaderValidator, {
  authHeaderValidation,
} from "../utils/auth-header-validator";
import { db } from "../db";
import { users } from "../db/schema/user";
import { eq, like, or, sql } from "drizzle-orm";

const userRoute = new Elysia({ prefix: "/user" })
  // Get your own profile
  .get(
    "/profile",
    async ({ headers }) => {
      const res = authHeaderValidator(headers);
      if (res.type === "error") {
        return res.error;
      }
      return res.user;
    },
    authHeaderValidation,
  )
  // Get another user's profile
  .get(
    "/:username",
    async ({ params, headers }) => {
      const res = authHeaderValidator(headers);
      if (res.type === "error") {
        return res.error;
      }

      const userArr = await db
        .select()
        .from(users)
        .where(eq(users.username, params.username));

      if (userArr.length === 0) {
        return error(404, { success: false, message: "User not found" });
      }

      const user = userArr[0];
      const publicUser: PublicUser = {
        username: user.username,
        fullName: user.fullName,
        profilePic: user.profilePic,
      };
      return {
        success: true,
        user: publicUser,
      };
    },
    {
      params: t.Object({
        username: t.String(),
      }),
      ...authHeaderValidation,
    },
  )
  .get(
    "/search/:searchString",
    async ({ headers, params: { searchString } }) => {
      const res = authHeaderValidator(headers);
      if (res.type === "error") {
        return res.error;
      }

      const usersArr = await db
        .select()
        .from(users)
        .where(
          or(
            like(users.username, `%${searchString}%`),
            like(users.fullName, `%${searchString}%`),
          ),
        );

      return {
        success: true,
        users: usersArr.map((user) => ({
          username: user.username,
          fullName: user.fullName,
          profilePic: user.profilePic,
        })),
      };
    },
    authHeaderValidation,
  );

export default userRoute;
