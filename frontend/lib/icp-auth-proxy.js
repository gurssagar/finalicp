/**
 * ICP Authentication Proxy
 * Provides backend proxy functionality for ICP canister authentication
 * This solves the issue of browser vs Node.js environment incompatibilities
 */

// Use built-in fetch (Node.js 18+)

class ICPAuthProxy {
  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
    this.cache = new Map();
  }

  /**
   * Authenticate user with chat storage canister
   */
  async authenticateUser(email, displayName) {
    const cacheKey = `auth_${email}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 5 * 60 * 1000) { // 5 minutes cache
        return cached.result;
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/chat/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ICP-Auth-Proxy/1.0'
        },
        body: JSON.stringify({
          email,
          displayName
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.cache.set(cacheKey, {
          result: data.success,
          timestamp: Date.now()
        });
        return data.success;
      } else {
        console.error('Authentication failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  }

  /**
   * Save message to chat storage canister
   */
  async saveMessage(from, to, text, messageType = 'text', timestamp, displayName) {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/messages/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ICP-Auth-Proxy/1.0'
        },
        body: JSON.stringify({
          from,
          to,
          text,
          messageType,
          timestamp: timestamp || new Date().toISOString(),
          displayName: displayName || from.split('@')[0]
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.success ? data.messageId : null;
      } else {
        console.error('Save message failed:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Save message error:', error);
      return null;
    }
  }

  /**
   * Check if users can chat (have active booking relationship)
   */
  async canChat(userEmail, otherUserEmail) {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/can-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ICP-Auth-Proxy/1.0'
        },
        body: JSON.stringify({
          userEmail,
          otherUserEmail
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.canChat;
      } else {
        console.error('Can chat check failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Can chat check error:', error);
      return false;
    }
  }

  /**
   * Create chat relationship
   */
  async createChatRelationship(clientEmail, freelancerEmail, bookingId, serviceTitle, status = 'Active') {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/create-relationship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ICP-Auth-Proxy/1.0'
        },
        body: JSON.stringify({
          clientEmail,
          freelancerEmail,
          bookingId,
          serviceTitle,
          status
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.success;
      } else {
        console.error('Create relationship failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Create relationship error:', error);
      return false;
    }
  }

  /**
   * Get chat relationships for a user
   */
  async getChatRelationships(userEmail) {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/relationships?userEmail=${encodeURIComponent(userEmail)}`, {
        headers: {
          'User-Agent': 'ICP-Auth-Proxy/1.0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.relationships || [];
      } else {
        console.error('Get relationships failed:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Get relationships error:', error);
      return [];
    }
  }

  /**
   * Update relationship status
   */
  async updateRelationshipStatus(bookingId, newStatus) {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/update-relationship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ICP-Auth-Proxy/1.0'
        },
        body: JSON.stringify({
          bookingId,
          newStatus
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.success;
      } else {
        console.error('Update relationship status failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Update relationship status error:', error);
      return false;
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat/health`, {
        headers: {
          'User-Agent': 'ICP-Auth-Proxy/1.0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.status;
      } else {
        return 'Error';
      }
    } catch (error) {
      console.error('Health check error:', error);
      return 'Error';
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Singleton instance
const icpAuthProxy = new ICPAuthProxy();

module.exports = {
  ICPAuthProxy,
  icpAuthProxy
};