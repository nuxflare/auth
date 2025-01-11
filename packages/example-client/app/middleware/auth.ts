export default defineNuxtRouteMiddleware(async (to) => {
  const {
    callback,
    sessionState,
    subjects,
    client,
    getTokens,
    setTokens,
    redirect,
  } = useAuth();
  const { accessToken, refreshToken } = getTokens();

  if (!accessToken || !refreshToken) {
    return navigateTo(await login(), { external: true });
  }
  const verified = await client.verify(subjects, accessToken, {
    refresh: refreshToken,
  });
  if (!verified.err) {
    if (verified.tokens)
      setTokens(verified.tokens.access, verified.tokens.refresh);
    sessionState.value = { user: verified.subject.properties };
  } else {
    return navigateTo(await login(), { external: true });
  }

  async function login() {
    redirect.value = to.path;
    const { url } = await client.authorize(callback, "code");
    return url;
  }
});
