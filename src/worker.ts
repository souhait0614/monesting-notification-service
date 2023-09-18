import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { PushSubscription } from "web-push";
import { cors } from "hono/cors";
import { Notification, NotificationData } from "./types/Notification";

export type Env = {
  API_SECRET: string;
  API_URL: string;
  MONESTING_NOTIFICATION_STORAGE: KVNamespace;
};

const subscriptionsPrefix = "subscriptions:";
const notificationsPrefix = "notifications:";

const app = new Hono<{ Bindings: Env }>()
  .use(
    "*",
    cors({
      origin: "*",
    })
  )
  .use("*", async (c, next) => {
    const auth = bearerAuth({
      token: c.env.API_SECRET,
    });
    return await auth(c, next);
  })
  .get("/subscriptions", async (c) => {
    const result = await c.env.MONESTING_NOTIFICATION_STORAGE.list<PushSubscription[]>({
      prefix: subscriptionsPrefix,
    });
    const subscriptionsList = await Promise.all(
      result.keys.map(async (key) => {
        const res = await c.env.MONESTING_NOTIFICATION_STORAGE.get<PushSubscription[]>(key.name, "json");
        const sub = key.name.replace(subscriptionsPrefix, "");
        return [sub, res ?? []] as const;
      })
    );
    return c.json(Object.fromEntries(subscriptionsList));
  })
  .get("/subscriptions/:sub", async (c) => {
    const sub = c.req.param("sub");
    const subscriptions = await c.env.MONESTING_NOTIFICATION_STORAGE.get<PushSubscription[]>(
      subscriptionsPrefix + sub,
      "json"
    );
    return c.json(subscriptions ?? []);
  })
  .put("/subscriptions/:sub", async (c) => {
    const sub = c.req.param("sub");
    const body = await c.req.json<PushSubscription[]>();
    if (body.length > 0) {
      await c.env.MONESTING_NOTIFICATION_STORAGE.put(subscriptionsPrefix + sub, JSON.stringify(body));
    } else {
      await c.env.MONESTING_NOTIFICATION_STORAGE.delete(subscriptionsPrefix + sub);
    }
    return new Response(null, {
      status: 201,
    });
  })
  .get("/notifications/:sub", async (c) => {
    const sub = c.req.param("sub");
    const subscriptions = await c.env.MONESTING_NOTIFICATION_STORAGE.get<NotificationData>(
      notificationsPrefix + sub,
      "json"
    );
    return c.json(subscriptions ?? []);
  })
  .put("/notifications/:sub", async (c) => {
    const sub = c.req.param("sub");
    const body = await c.req.json<NotificationData>();
    if (body.notifications.length > 0) {
      await c.env.MONESTING_NOTIFICATION_STORAGE.put(notificationsPrefix + sub, JSON.stringify(body));
    } else {
      await c.env.MONESTING_NOTIFICATION_STORAGE.delete(notificationsPrefix + sub);
    }
    return new Response(null, {
      status: 201,
    });
  });

const scheduled: ExportedHandlerScheduledHandler<Env> = async (controller, env, ctx) => {
  const secret = env.API_SECRET;
  const apiUrl = env.API_URL;
  await fetch(`${apiUrl}/notifications/push`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
    },
  });
};

const handler: ExportedHandler<Env> = {
  ...app,
  scheduled,
};

export default handler;
