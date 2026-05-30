const PARAM_ALIASES = {
  username: ["pos_user", "user", "username", "usuario"],
  store: ["pos_store", "store", "company", "tienda", "empresa"],
  password: ["pos_password", "password", "pass", "clave"],
  language: ["pos_language", "language", "lang"],
};

function readFirst(params: URLSearchParams, keys: string[]) {
  for (const key of keys) {
    const value = params.get(key);
    if (value) return value;
  }
  return "";
}

export function readPOSActivationParams(location: Pick<Location, "search" | "hash"> = window.location) {
  const params = new URLSearchParams(location.search);
  const hash = location.hash.startsWith("#") ? location.hash.slice(1) : location.hash;
  const hashQuery = hash.includes("?") ? hash.split("?").slice(1).join("?") : "";
  const hashParams = new URLSearchParams(hashQuery);
  hashParams.forEach((value, key) => {
    if (!params.has(key)) params.set(key, value);
  });

  return {
    username: readFirst(params, PARAM_ALIASES.username),
    store: readFirst(params, PARAM_ALIASES.store),
    password: readFirst(params, PARAM_ALIASES.password),
    language: readFirst(params, PARAM_ALIASES.language),
    isActivation: params.get("activation") === "1" || Boolean(readFirst(params, PARAM_ALIASES.username) && readFirst(params, PARAM_ALIASES.store)),
  };
}

export function cleanPOSActivationParams(searchParams: URLSearchParams) {
  const next = new URLSearchParams(searchParams);
  [...PARAM_ALIASES.username, ...PARAM_ALIASES.store, ...PARAM_ALIASES.password, ...PARAM_ALIASES.language, "activation"].forEach((key) => next.delete(key));
  return next;
}