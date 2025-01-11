import { subjects, type SubjectUser } from "@nuxflare-auth/functions/subjects";
import { createClient } from "@openauthjs/openauth/client";

type UserSession = {
  user?: SubjectUser;
};

const useAccessTokenCookie = () =>
  useCookie("nuxflare-access-token", {
    sameSite: "lax",
  });
const useRefreshTokenCookie = () =>
  useCookie("nuxflare-refresh-token", {
    sameSite: "lax",
  });
const useAuthRedirect = () =>
  useCookie("nuxflare-redirect", {
    sameSite: "lax",
  });
const useSessionState = () =>
  useState<UserSession>("nuxflare-session", () => ({}));

const client = createClient({
  clientID: "nuxt",
  issuer: "https://authdemo.nuxflare.com",
});

const setTokens = (access: string, refresh: string) => {
  const accessToken = useAccessTokenCookie();
  const refreshToken = useRefreshTokenCookie();
  accessToken.value = access;
  refreshToken.value = refresh;
};

const getTokens = () => {
  return {
    accessToken: useAccessTokenCookie().value,
    refreshToken: useRefreshTokenCookie().value,
  };
};

export const useSession = () => {
  const sessionState = useSessionState();
  const accessToken = useAccessTokenCookie();
  const refreshToken = useRefreshTokenCookie();
  const clear = () => {
    sessionState.value = {};
    accessToken.value = null;
    refreshToken.value = null;
  };
  return {
    loggedIn: computed(() => !!sessionState.value.user),
    user: computed(() => sessionState.value.user || null),
    session: sessionState,
    clear,
  };
};

export const useAuth = () => {
  const callback = useRequestURL().origin + "/callback";
  const redirect = useAuthRedirect();
  const sessionState = useSessionState();
  return {
    subjects,
    client,
    callback,
    redirect,
    sessionState,
    setTokens,
    getTokens,
  };
};
