import { createServer } from "node:http";

const PORT = Number(process.env.PORT ?? 8787);
const HOST = process.env.HOST ?? "127.0.0.1";

const json = (statusCode, payload) => ({
  statusCode,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
  },
  body: JSON.stringify(payload),
});

const server = createServer((req, res) => {
  const method = req.method ?? "GET";
  const url = req.url ?? "/";

  if (method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "access-control-allow-headers": "content-type,authorization",
    });
    res.end();
    return;
  }

  if (method === "GET" && (url === "/health" || url === "/api/health")) {
    const response = json(200, {
      status: "ok",
      service: "urban-api",
      timestamp: new Date().toISOString(),
    });
    res.writeHead(response.statusCode, response.headers);
    res.end(response.body);
    return;
  }

  if (method === "GET" && url === "/api/locations") {
    const response = json(200, {
      items: [],
      message: "API scaffold is ready. Next step: connect real location data source.",
    });
    res.writeHead(response.statusCode, response.headers);
    res.end(response.body);
    return;
  }

  const response = json(404, {
    error: "Not Found",
    path: url,
  });

  res.writeHead(response.statusCode, response.headers);
  res.end(response.body);
});

server.listen(PORT, HOST, () => {
  console.log(`@urban/api listening on http://${HOST}:${PORT}`);
});
