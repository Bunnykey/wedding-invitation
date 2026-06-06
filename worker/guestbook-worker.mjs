const ALLOWED_ORIGINS = new Set([
  "https://bunnykey.github.io",
  "http://127.0.0.1:3000",
  "http://localhost:3000",
])

const RULES = {
  nameMaxLength: 10,
  contentMaxLength: 100,
  passwordMinLength: 4,
  passwordMaxLength: 20,
}

const json = (value, init = {}) =>
  new Response(JSON.stringify(value), {
    ...init,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(init.headers || {}),
    },
  })

const text = (value, init = {}) =>
  new Response(value, {
    ...init,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      ...(init.headers || {}),
    },
  })

const toHex = (bytes) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")

const fromHex = (hex) => {
  const bytes = new Uint8Array(hex.length / 2)

  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }

  return bytes
}

const timingSafeEqual = (a, b) => {
  if (a.length !== b.length) return false

  let diff = 0
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i]
  }

  return diff === 0
}

const hashPassword = async (password, saltHex) => {
  const encoder = new TextEncoder()
  const salt = saltHex
    ? fromHex(saltHex)
    : crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations: 100000,
    },
    key,
    256,
  )

  return {
    salt: toHex(salt),
    hash: toHex(new Uint8Array(bits)),
  }
}

const publicPost = (post) => ({
  id: post.id,
  timestamp: post.timestamp,
  name: post.name,
  content: post.content,
})

const assertString = (value, minLength, maxLength) => {
  if (typeof value !== "string") throw new Error("INVALID_INPUT")

  const trimmed = value.trim()
  if (trimmed.length < minLength || trimmed.length > maxLength) {
    throw new Error("INVALID_INPUT")
  }

  return trimmed
}

const corsHeaders = (request) => {
  const origin = request.headers.get("Origin")

  if (!origin) return {}
  if (ALLOWED_ORIGINS.has(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin",
    }
  }

  return null
}

const withCors = (response, headers) => {
  if (!headers) return response

  const nextHeaders = new Headers(response.headers)
  Object.entries(headers).forEach(([key, value]) => nextHeaders.set(key, value))

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: nextHeaders,
  })
}

const handleGuestbook = async (request, env, url) => {
  if (request.method === "GET") {
    const offset = Number(url.searchParams.get("offset") || 0)
    const limit = Number(url.searchParams.get("limit") || 5)

    if (
      !Number.isInteger(offset) ||
      !Number.isInteger(limit) ||
      offset < 0 ||
      limit < 1
    ) {
      return text("Bad Request", { status: 400 })
    }

    const totalResult = await env.DB.prepare(
      "SELECT COUNT(*) AS count FROM guestbook",
    ).first()
    const rows = await env.DB.prepare(
      "SELECT id, timestamp, name, content FROM guestbook ORDER BY timestamp DESC, id DESC LIMIT ? OFFSET ?",
    )
      .bind(Math.min(limit, 50), offset)
      .all()

    return json({
      posts: rows.results.map(publicPost),
      total: totalResult.count,
    })
  }

  if (request.method === "POST") {
    const body = await request.json()
    const name = assertString(body.name, 1, RULES.nameMaxLength)
    const content = assertString(body.content, 1, RULES.contentMaxLength)
    const password = assertString(
      body.password,
      RULES.passwordMinLength,
      RULES.passwordMaxLength,
    )
    const { salt, hash } = await hashPassword(password)
    const timestamp = Math.floor(Date.now() / 1000)
    const result = await env.DB.prepare(
      "INSERT INTO guestbook (timestamp, name, content, password_salt, password_hash) VALUES (?, ?, ?, ?, ?)",
    )
      .bind(timestamp, name, content, salt, hash)
      .run()

    return json({
      id: result.meta.last_row_id,
      timestamp,
      name,
      content,
    })
  }

  if (request.method === "PUT") {
    const body = await request.json()
    const id = Number(body.id)
    const password = assertString(
      body.password,
      RULES.passwordMinLength,
      RULES.passwordMaxLength,
    )

    if (!Number.isInteger(id)) {
      return text("Bad Request", { status: 400 })
    }

    const post = await env.DB.prepare(
      "SELECT id, password_salt, password_hash FROM guestbook WHERE id = ?",
    )
      .bind(id)
      .first()

    if (!post) {
      return text("Not Found", { status: 404 })
    }

    const { hash } = await hashPassword(password, post.password_salt)
    if (!timingSafeEqual(fromHex(hash), fromHex(post.password_hash))) {
      return text("Forbidden", { status: 403 })
    }

    await env.DB.prepare("DELETE FROM guestbook WHERE id = ?").bind(id).run()

    return json({ success: true })
  }

  return text("Method Not Allowed", { status: 405 })
}

export default {
  async fetch(request, env) {
    const headers = corsHeaders(request)

    if (headers === null) {
      return text("Forbidden", { status: 403 })
    }

    if (request.method === "OPTIONS") {
      return withCors(new Response(null, { status: 204 }), headers)
    }

    const url = new URL(request.url)

    try {
      if (url.pathname === "/healthz") {
        return withCors(json({ ok: true }), headers)
      }

      if (url.pathname === "/guestbook" || url.pathname === "/api/guestbook") {
        return withCors(await handleGuestbook(request, env, url), headers)
      }

      return withCors(text("Not Found", { status: 404 }), headers)
    } catch (error) {
      if (error instanceof SyntaxError || error.message === "INVALID_INPUT") {
        return withCors(text("Bad Request", { status: 400 }), headers)
      }

      console.error(error)
      return withCors(text("Internal Server Error", { status: 500 }), headers)
    }
  },
}
