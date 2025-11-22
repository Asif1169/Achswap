import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // Add storage methods as needed
}

export class MemStorage implements IStorage {
  constructor() {
    // Initialize storage
  }
}

export const storage = new MemStorage();
