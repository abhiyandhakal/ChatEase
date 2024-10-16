import { Elysia, error, t } from "elysia";
import authHeaderValidator, {
  authHeaderValidation,
} from "../utils/auth-header-validator";
import ChatService from "../services/chat";

const chatRoute = new Elysia({ prefix: "/chat" })
  .decorate("chatService", new ChatService())
  .get(
    "",
    ({ chatService, headers }) => {
      const res = authHeaderValidator(headers);
      if (res.type === "error") {
        return res.error;
      }
      if (typeof res.user === "string") return error(401);
      return chatService.getAllChats(res.user.username);
    },
    authHeaderValidation,
  )
  .post(
    "/create",
    ({ chatService, headers, body: { username } }) => {
      const authRes = authHeaderValidator(headers);
      if (authRes.type === "error") return authRes.error;
      if (typeof authRes.user === "string") return error(401);
      return chatService.createDmChannel(authRes.user.username, username);
    },
    {
      ...authHeaderValidation,
      body: t.Object({ username: t.String() }),
    },
  )
  .get(
    "/:channelId",
    ({
      chatService,
      headers,
      params: { channelId },
      query: { isDirect, limit, offset },
    }) => {
      const authRes = authHeaderValidator(headers);
      if (authRes.type === "error") return authRes.error;
      if (typeof authRes.user === "string") return error(401);
      return chatService.getMessages(
        channelId,
        isDirect ? "direct" : "group",
        limit,
        offset,
      );
    },
    {
      ...authHeaderValidation,
      params: t.Object({
        channelId: t.String(),
      }),
      query: t.Object({
        isDirect: t.Boolean(),
        limit: t.Number(),
        offset: t.Number(),
      }),
    },
  );

export default chatRoute;
