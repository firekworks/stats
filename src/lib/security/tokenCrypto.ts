import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual
} from "crypto";

const algorithm = "aes-256-gcm";
const tokenVersion = 1;

type TokenEnvelope = {
  v: typeof tokenVersion;
  alg: "A256GCM";
  iv: string;
  tag: string;
  data: string;
};

export function encryptToken(token: string | null | undefined) {
  assertServerOnly();

  if (!token) {
    return null;
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv(algorithm, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();

  const envelope: TokenEnvelope = {
    v: tokenVersion,
    alg: "A256GCM",
    iv: iv.toString("base64url"),
    tag: tag.toString("base64url"),
    data: encrypted.toString("base64url")
  };

  return Buffer.from(JSON.stringify(envelope), "utf8").toString("base64url");
}

export function decryptToken(encryptedToken: string | null | undefined) {
  assertServerOnly();

  if (!encryptedToken) {
    return null;
  }

  const envelope = parseEnvelope(encryptedToken);
  const decipher = createDecipheriv(
    algorithm,
    getEncryptionKey(),
    Buffer.from(envelope.iv, "base64url")
  );

  decipher.setAuthTag(Buffer.from(envelope.tag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(envelope.data, "base64url")),
    decipher.final()
  ]).toString("utf8");
}

export function hasUsableEncryptionKey() {
  try {
    getEncryptionKey();
    return true;
  } catch {
    return false;
  }
}

function parseEnvelope(value: string): TokenEnvelope {
  const raw = Buffer.from(value, "base64url").toString("utf8");
  const parsed = JSON.parse(raw) as Partial<TokenEnvelope>;

  if (
    parsed.v !== tokenVersion ||
    parsed.alg !== "A256GCM" ||
    !parsed.iv ||
    !parsed.tag ||
    !parsed.data
  ) {
    throw new Error("Encrypted token has an unsupported format");
  }

  return parsed as TokenEnvelope;
}

let cachedKey: Buffer | null = null;

function getEncryptionKey() {
  if (cachedKey) {
    return cachedKey;
  }

  const value = process.env.ENCRYPTION_KEY;

  if (!value) {
    throw new Error("ENCRYPTION_KEY is required to encrypt integration tokens");
  }

  const candidates = [
    Buffer.from(value, "base64"),
    /^[0-9a-f]{64}$/i.test(value) ? Buffer.from(value, "hex") : null
  ].filter(Boolean) as Buffer[];

  const key = candidates.find((candidate) => candidate.length === 32);

  if (!key) {
    throw new Error("ENCRYPTION_KEY must decode to exactly 32 bytes");
  }

  cachedKey = key;
  return cachedKey;
}

function assertServerOnly() {
  if (typeof window !== "undefined") {
    throw new Error("Token crypto cannot be used in the browser");
  }
}

export function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
