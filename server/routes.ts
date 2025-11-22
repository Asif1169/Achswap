import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { readFile } from "fs/promises";
import { join } from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve token list
  app.get("/api/tokens", async (req, res) => {
    try {
      const tokensPath = join(process.cwd(), "server/data/tokens.json");
      const tokensData = await readFile(tokensPath, "utf-8");
      const tokens = JSON.parse(tokensData);
      res.json(tokens);
    } catch (error) {
      console.error("Failed to load tokens:", error);
      res.status(500).json({ error: "Failed to load token list" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
