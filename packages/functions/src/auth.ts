import { issuer } from "@openauthjs/openauth";
import { CloudflareStorage } from "@openauthjs/openauth/storage/cloudflare";
import type {
  Service,
  ExecutionContext,
  KVNamespace,
} from "@cloudflare/workers-types";
import { PasswordProvider } from "@openauthjs/openauth/provider/password";
import { CodeProvider } from "@openauthjs/openauth/provider/code";
import { GithubProvider } from "@openauthjs/openauth/provider/github";
import { GoogleProvider } from "@openauthjs/openauth/provider/google";
import { ofetch } from "ofetch";
import { createId } from "@paralleldrive/cuid2";
import { Resource } from "sst/resource";
import { subjects } from "./subjects";
import type { SubjectUser } from "./subjects";
import type { SendEmailType } from "./emails";

let fromEmail = "";

const sendEmail: SendEmailType = async (...args) => {
  try {
    await Resource.Emails.fetch("https://emails.internal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });
  } catch (err) {
    console.error("sending email err", err);
  }
};

async function sendVerificationCode(email: string, code: string) {
  await sendEmail(fromEmail, email, "VerificationCode", {
    code,
  });
}

interface Env {
  CloudflareAuthKV: KVNamespace;
  DEV_URL?: string;
  FROM_EMAIL: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    fromEmail = env.FROM_EMAIL;
    const storage = CloudflareStorage({
      namespace: env.CloudflareAuthKV,
    });
    const origin = new URL(request.url).origin;
    const devUrl = env.DEV_URL || "";
    const hono = issuer({
      storage,
      subjects,
      async select(_providers, req) {
        const redirect = new URL(devUrl || origin);
        redirect.pathname = "/login";
        if (devUrl)
          redirect.searchParams.set("origin", new URL(req.url).origin);
        return new Response("", {
          status: 302,
          headers: {
            Location: redirect.toString(),
          },
        });
      },
      providers: {
        password: PasswordProvider({
          async sendCode(email, code) {
            await sendVerificationCode(email, code);
          },
          async login(req, form, err) {
            const redirect = new URL(devUrl || origin);
            redirect.pathname = "/login";
            if (devUrl)
              redirect.searchParams.set("origin", new URL(req.url).origin);
            const email = form?.get("email");
            if (email) redirect.searchParams.set("email", email);
            if (err?.type) redirect.searchParams.set("err", err?.type);
            return new Response("", {
              status: 302,
              headers: {
                Location: redirect.toString(),
              },
            });
          },
          async register(req, state, form, err) {
            const redirect = new URL(devUrl || origin);
            redirect.pathname = "/signup";
            if (devUrl)
              redirect.searchParams.set("origin", new URL(req.url).origin);
            const email = form?.get("email");
            if (email) redirect.searchParams.set("email", email);
            if (state?.type) redirect.searchParams.set("state", state?.type);
            if (err?.type) redirect.searchParams.set("err", err?.type);
            return new Response("", {
              status: 302,
              headers: {
                Location: redirect.toString(),
              },
            });
          },
          async change(req, state, form, err) {
            const redirect = new URL(devUrl || origin);
            redirect.pathname = "/forgot-password";
            if (devUrl)
              redirect.searchParams.set("origin", new URL(req.url).origin);
            const email = form?.get("email");
            if (email) redirect.searchParams.set("email", email);
            if (state?.type) redirect.searchParams.set("state", state?.type);
            if (err?.type) redirect.searchParams.set("err", err?.type);
            return new Response("", {
              status: 302,
              headers: {
                Location: redirect.toString(),
              },
            });
          },
        }),
        code: CodeProvider({
          async request(req, state, form, err) {
            const redirect = new URL(devUrl || origin);
            redirect.pathname = "/login";
            if (devUrl)
              redirect.searchParams.set("origin", new URL(req.url).origin);
            const email = form?.get("email") || (state as any)?.claims?.email;
            console.log("state", state);
            if (email) redirect.searchParams.set("email", email);
            if (state?.type) redirect.searchParams.set("state", state?.type);
            if (err?.type) redirect.searchParams.set("err", err?.type);
            return new Response("", {
              status: 302,
              headers: {
                Location: redirect.toString(),
              },
            });
          },
          async sendCode(claims, code) {
            await sendVerificationCode(claims.email, code);
          },
        }),
        github: GithubProvider({
          clientID: Resource.GithubClientID.value,
          clientSecret: Resource.GithubClientSecret.value,
          scopes: ["read:user", "user:email"],
        }),
        google: GoogleProvider({
          clientID: Resource.GoogleClientID.value,
          clientSecret: Resource.GoogleClientSecret.value,
          scopes: ["openid", "email", "profile"],
        }),
      },
      success: async (ctx, value) => {
        async function getUserObject(): Promise<{
          email: string;
          name?: string;
          image?: string;
          data?: object;
        }> {
          if (value.provider === "code") {
            return { email: value.claims.email };
          } else if (value.provider === "google") {
            const accessToken = value.tokenset.access;
            const data = await ofetch(
              "https://www.googleapis.com/oauth2/v3/userinfo",
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              },
            );
            return {
              email: data.email as string,
              name: data.name as string,
              image: data.picture as string,
              data,
            };
          } else if (value.provider === "github") {
            const accessToken = value.tokenset.access;
            const data = await ofetch("https://api.github.com/user", {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "User-Agent": "nuxflare-auth",
              },
            });
            if (!data.email) {
              const emails = (await ofetch(
                "https://api.github.com/user/emails",
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "User-Agent": "nuxflare-auth",
                  },
                },
              )) as any[];
              data.email = (emails.find((email) => email.primary) || emails[0])
                ?.email;
            }
            return {
              email: data.email as string,
              name: data.name as string,
              image: data.avatar_url as string,
              data,
            };
          }
          return { email: value.email };
        }

        try {
          const userObject = await getUserObject();
          const now = new Date().toISOString();
          const existing = (await storage.get([
            "users",
            userObject.email,
          ])) as SubjectUser;
          let user;
          if (existing) {
            user = existing;
            if (!user.email && userObject.email) user.email = userObject.email;
            if (!user.name && userObject.name) user.name = userObject.name;
            if (!user.image && userObject.image) user.image = userObject.image;
            user.updatedAt = now;
            const existingAccount = user.accounts.find(
              (acc) => acc.type === value.provider,
            );
            if (existingAccount) {
              existingAccount.data = userObject.data;
            } else {
              user.accounts.push({
                linkedAt: now,
                type: value.provider,
                data: userObject.data,
              });
            }
          } else {
            user = {
              id: createId(),
              email: userObject.email,
              name: userObject.name || "",
              image: userObject.image || "",
              createdAt: now,
              updatedAt: now,
              accounts: [
                {
                  linkedAt: now,
                  type: value.provider,
                  data: userObject.data,
                },
              ],
            };
            await sendEmail(fromEmail, userObject.email, "Welcome", {
              username: userObject.name || "User",
            });
          }
          await storage.set(["users", user.email], user);
          return ctx.subject("user", user);
        } catch (err) {
          console.error("err in success", err);
          throw new Error("Something went wrong");
        }
      },
    });
    hono.get("/*", async (c) => {
      const res: Response = await (
        (Resource as any).StaticRouter as Service
      ).fetch(c.req.raw);
      return res;
    });
    return hono.fetch(request, env, ctx);
  },
};
