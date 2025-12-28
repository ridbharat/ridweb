// Simple in-memory caching utility
class Cache {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes default TTL
  }

  // Set cache value with optional TTL
  set(key, value, ttl = this.ttl) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });

    // Auto-cleanup expired entries
    setTimeout(() => {
      if (this.cache.has(key) && this.cache.get(key).expiresAt <= Date.now()) {
        this.cache.delete(key);
      }
    }, ttl);
  }

  // Get cache value
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  // Delete cache entry
  delete(key) {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear() {
    this.cache.clear();
  }

  // Get cache size
  size() {
    // Clean expired entries first
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
    return this.cache.size;
  }
}

// Create cache instances for different data types
const bookCache = new Cache();
const statsCache = new Cache();
const userCache = new Cache();

// Cache keys
const CACHE_KEYS = {
  BOOK_CATEGORIES: 'book_categories',
  PDF_STATS_TOTAL: 'pdf_stats_total',
  PDF_STATS_BY_CATEGORY: 'pdf_stats_by_category',
  USER_ROLES: 'user_roles'
};

module.exports = {
  Cache,
  bookCache,
  statsCache,
  userCache,
  CACHE_KEYS
};