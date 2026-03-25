const { randomUUID } = require("crypto");

class MemStorage {
    constructor() {
        this.extractions = new Map();
    }
    async getExtractions() {
        return Array.from(this.extractions.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
    async getExtraction(id) {
        return this.extractions.get(id);
    }
    async createExtraction(data) {
        const id = randomUUID();
        const extraction = {
            ...data,
            id,
            createdAt: new Date().toISOString(),
        };
        this.extractions.set(id, extraction);
        return extraction;
    }
    async deleteExtraction(id) {
        this.extractions.delete(id);
    }
}
const storage = new MemStorage();

module.exports = { storage };
