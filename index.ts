import jukebox from "./index.html"

import { BodyInit, ResponseInit } from "undici-types";

export class ClientResponse extends Response {
  constructor(body?: BodyInit, init?: ResponseInit) {
    super(body, init);
    this.headers.set("Access-Control-Allow-Origin", "*");
    this.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    this.headers.set("Access-Control-Allow-Headers", "Content-Type");
  }
}

const server = Bun.serve({
  port: process.env.SERVER_PORT || 3000,
  hostname: "0.0.0.0",
  development: process.env.NODE_ENV == 'development',
  routes: {
    "/": jukebox,
    "/public/*": async (req) => new Response(await Bun.file(`./public/${req.url.split("/").reverse()[0]}`).bytes()),
    "/dist/*": async (req) => new Response(await Bun.file(`./dist/${req.url.split("/").reverse()[0]}`).bytes()),
    "/api/yuri": async (req) => {
      const uri = new URL(req.url)
      // focus, p
      const p = uri.searchParams
      const page = p.get("page") || "0";
      const limit = p.get("limit") || "10";
      const tags = p.get("tags") || "yuri+-loli";
      const safebooruUrl = `https://safebooru.org/index.php?page=dapi&s=post&q=index&limit=${limit}&json=1&tags=${tags}&pid=${page}`;
      const response = await fetch(safebooruUrl);
      return Response.json(await response.json())
    },
    "/api/station/:id/queue": async (req) => Response.json(await (await fetch(`https://radio.cansu.dev/api/station/${req.params.id}/queue`, {headers: {'X-API-Key': process.env.AZURACAST_API_KEY || ''}})).json())
  }
});