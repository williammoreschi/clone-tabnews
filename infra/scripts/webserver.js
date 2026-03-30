function getOrigin() {
  const { NODE_ENV, VERCEL_ENV, VERCEL_URL, APP_URL } = process.env;

  // 1. Preview (Vercel)
  if (VERCEL_ENV === "preview" && VERCEL_URL) {
    return `https://${VERCEL_URL}`;
  }

  // 2. Ambiente local / teste
  if (NODE_ENV === "development" || NODE_ENV === "test") {
    return APP_URL || "http://localhost:3000";
  }

  // 3. Produção (obrigatório)
  if (!APP_URL) {
    throw new Error("APP_URL não definido em produção");
  }

  return APP_URL;
}

function normalizeUrl(url) {
  return url.replace(/\/$/, "");
}

const webserver = {
  origin: normalizeUrl(getOrigin()),
};

export default webserver;
