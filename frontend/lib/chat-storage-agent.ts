// Types matching the canister
export interface ChatMessage {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: string;
  delivered: boolean;
  read: boolean;
  messageType: string;
}

export type ChatError =
  | { InvalidInput: string }
  | { Unauthorized: string }
  | { UserNotFound: string };

export type ChatResult<T> =
  | { err: ChatError }
  | { ok: T };

// Canister agent and initialization
let chatStorageActor: any = null;
let authenticatedUsers: Map<string, boolean> = new Map();

function getChatStorageActor() {
  if (!chatStorageActor) {
    const canisterId = process.env.NEXT_PUBLIC_CHAT_STORAGE_CANISTER_ID || 'u6s2n-gx777-77774-qaaba-cai';

    // Create actor using the agent
    const { Actor, HttpAgent } = require('@dfinity/agent');

    // Local development uses 127.0.0.1, production uses the Internet Computer
    const isLocal = process.env.DFX_NETWORK === 'local';

    const agent = new HttpAgent({
      host: isLocal ? 'http://127.0.0.1:4943' : 'https://ic0.app',
    });

    // Fetch root key for local development
    if (isLocal) {
      agent.fetchRootKey().catch((err: any) => {
        console.warn('Unable to fetch root key. Check to ensure that your local replica is running');
      });
    }

    // Create actor interface
    const idlFactory = ({ IDL }: any) => {
      const ChatError = IDL.Variant({
        'InvalidInput': IDL.Text,
        'Unauthorized': IDL.Text,
        'UserNotFound': IDL.Text,
      });
      const ChatMessage = IDL.Record({
        'delivered': IDL.Bool,
        'from': IDL.Text,
        'id': IDL.Text,
        'messageType': IDL.Text,
        'read': IDL.Bool,
        'text': IDL.Text,
        'timestamp': IDL.Text,
        'to': IDL.Text,
      });
      const ChatResult = IDL.Variant({
        'err': ChatError,
        'ok': IDL.Text,
      });
      const ChatResult_2 = IDL.Variant({
        'err': ChatError,
        'ok': IDL.Vec(ChatMessage),
      });
      const ChatResult_1 = IDL.Variant({
        'err': ChatError,
        'ok': IDL.Vec(IDL.Tuple(IDL.Text, ChatMessage)),
      });
      const ChatRelationship = IDL.Record({
        'bookingId': IDL.Text,
        'clientEmail': IDL.Text,
        'createdAt': IDL.Text,
        'freelancerEmail': IDL.Text,
        'serviceTitle': IDL.Text,
        'status': IDL.Text,
      });
      const ChatResult_3 = IDL.Variant({
        'err': ChatError,
        'ok': IDL.Bool,
      });
      const ChatResult_4 = IDL.Variant({
        'err': ChatError,
        'ok': IDL.Vec(ChatRelationship),
      });
      return IDL.Service({
        'authenticateUser': IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
        'canChat': IDL.Func([IDL.Text, IDL.Text], [ChatResult_3], ['query']),
        'createChatRelationship': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text], [ChatResult_3], []),
        'getChatHistory': IDL.Func([IDL.Text, IDL.Text, IDL.Nat, IDL.Nat], [ChatResult_2], ['query']),
        'getChatRelationships': IDL.Func([IDL.Text], [ChatResult_4], ['query']),
        'getRecentChats': IDL.Func([IDL.Text, IDL.Nat], [ChatResult_1], ['query']),
        'getTotalMessages': IDL.Func([], [IDL.Nat], ['query']),
        'healthCheck': IDL.Func([], [IDL.Text], ['query']),
        'saveMessage': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text], [ChatResult], []),
        'updateRelationshipStatus': IDL.Func([IDL.Text, IDL.Text], [ChatResult_3], []),
        'verifySession': IDL.Func([IDL.Text], [IDL.Bool], ['query']),
      });
    };

    chatStorageActor = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    });
  }
  return chatStorageActor;
}

// Helper function to check if user is authenticated
async function ensureUserAuthenticated(email: string, displayName?: string): Promise<boolean> {
  if (authenticatedUsers.has(email)) {
    return authenticatedUsers.get(email)!;
  }

  // Try to verify existing session first
  try {
    const actor = getChatStorageActor();
    const isVerified = await actor.verifySession(email);
    if (isVerified) {
      authenticatedUsers.set(email, true);
      return true;
    }
  } catch (error) {
    console.warn('Session verification failed, attempting authentication:', error);
  }

  // If verification fails, try to authenticate
  if (displayName) {
    try {
      const actor = getChatStorageActor();
      const isAuthenticated = await actor.authenticateUser(email, displayName);
      authenticatedUsers.set(email, isAuthenticated);
      return isAuthenticated;
    } catch (error) {
      console.error('Authentication failed:', error);
      authenticatedUsers.set(email, false);
      return false;
    }
  }

  return false;
}

// Wrapper functions
export const chatStorageApi = {
  // Authenticate user with email and display name
  async authenticateUser(email: string, displayName: string): Promise<boolean> {
    try {
      const actor = getChatStorageActor();
      const result = await actor.authenticateUser(email, displayName);
      authenticatedUsers.set(email, result);
      return result;
    } catch (error) {
      console.error('Error authenticating user:', error);
      authenticatedUsers.set(email, false);
      return false;
    }
  },

  // Verify user session
  async verifySession(email: string): Promise<boolean> {
    try {
      const actor = getChatStorageActor();
      return await actor.verifySession(email);
    } catch (error) {
      console.error('Error verifying session:', error);
      return false;
    }
  },

  // Save a message
  async saveMessage(
    from: string,
    to: string,
    text: string,
    messageType: string = 'text',
    timestamp?: string,
    displayName?: string
  ): Promise<string | null> {
    try {
      // Ensure user is authenticated before saving
      const isAuthenticated = await ensureUserAuthenticated(from, displayName);
      if (!isAuthenticated) {
        console.error('User not authenticated, cannot save message:', from);
        return null;
      }

      const actor = getChatStorageActor();
      const result = await actor.saveMessage(
        from,
        to,
        text,
        messageType,
        timestamp || new Date().toISOString()
      );

      if ('ok' in result) {
        return result.ok;
      } else {
        console.error('Error saving message:', result.err);
        return null;
      }
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  },

  // Get chat history between two users
  async getChatHistory(
    userEmail: string,
    contactEmail: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ChatMessage[]> {
    try {
      const actor = getChatStorageActor();
      const result = await actor.getChatHistory(userEmail, contactEmail, limit, offset);

      if ('ok' in result) {
        return result.ok.map((msg: any) => ({
          id: msg.id,
          from: msg.from,
          to: msg.to,
          text: msg.text,
          timestamp: msg.timestamp,
          delivered: msg.delivered,
          read: msg.read,
          messageType: msg.messageType,
        }));
      } else {
        console.error('Error getting chat history:', result.err);
        return [];
      }
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  },

  // Get recent chats for a user
  async getRecentChats(userEmail: string, limit: number = 20): Promise<Array<{contact: string, lastMessage: ChatMessage}>> {
    try {
      const actor = getChatStorageActor();
      const result = await actor.getRecentChats(userEmail, limit);

      if ('ok' in result) {
        return result.ok.map(([contact, message]: [string, any]) => ({
          contact,
          lastMessage: {
            id: message.id,
            from: message.from,
            to: message.to,
            text: message.text,
            timestamp: message.timestamp,
            delivered: message.delivered,
            read: message.read,
            messageType: message.messageType,
          },
        }));
      } else {
        console.error('Error getting recent chats:', result.err);
        return [];
      }
    } catch (error) {
      console.error('Error getting recent chats:', error);
      return [];
    }
  },

  // Get total messages count
  async getTotalMessages(): Promise<number> {
    try {
      const actor = getChatStorageActor();
      return await actor.getTotalMessages();
    } catch (error) {
      console.error('Error getting total messages:', error);
      return 0;
    }
  },

  // Health check
  async healthCheck(): Promise<string> {
    try {
      const actor = getChatStorageActor();
      return await actor.healthCheck();
    } catch (error) {
      console.error('Error during health check:', error);
      return 'Error';
    }
  },

  // Check if two users can chat (have active or completed booking relationship)
  async canChat(userEmail: string, otherUserEmail: string): Promise<boolean> {
    try {
      const actor = getChatStorageActor();
      const result = await actor.canChat(userEmail, otherUserEmail);

      if ('ok' in result) {
        return result.ok;
      } else {
        console.error('Error checking chat permission:', result.err);
        return false;
      }
    } catch (error) {
      console.error('Error checking chat permission:', error);
      // Fallback: check booking-contacts API if chat storage fails
      return this.checkBookingContactsFallback(userEmail, otherUserEmail);
    }
  },

  // Fallback method to check booking contacts via API
  async checkBookingContactsFallback(userEmail: string, otherUserEmail: string): Promise<boolean> {
    try {
      console.log('Using fallback booking contacts check for:', { userEmail, otherUserEmail });

      // Check if users have any booking relationship (active or completed)
      const [user1Contacts, user2Contacts] = await Promise.all([
        this.getBookingContacts(userEmail),
        this.getBookingContacts(otherUserEmail)
      ]);

      // Check if there's a mutual booking relationship
      const hasRelationship =
        user1Contacts.some(contact => contact.email === otherUserEmail) ||
        user2Contacts.some(contact => contact.email === userEmail);

      console.log('Fallback booking check result:', { hasRelationship });
      return hasRelationship;
    } catch (error) {
      console.error('Fallback booking check failed:', error);
      return false;
    }
  },

  // Get booking contacts for a user
  async getBookingContacts(userEmail: string): Promise<Array<{email: string, status: string}>> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/chat/booking-contacts?userEmail=${encodeURIComponent(userEmail)}&userType=client`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      if (data.success && data.contacts) {
        return data.contacts.map((contact: any) => ({
          email: contact.email,
          status: contact.status
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting booking contacts:', error);
      return [];
    }
  },

  // Create chat relationship based on booking
  async createChatRelationship(
    clientEmail: string,
    freelancerEmail: string,
    bookingId: string,
    serviceTitle: string,
    status: string = 'Active'
  ): Promise<boolean> {
    try {
      const actor = getChatStorageActor();
      const result = await actor.createChatRelationship(
        clientEmail,
        freelancerEmail,
        bookingId,
        serviceTitle,
        status
      );

      if ('ok' in result) {
        return result.ok;
      } else {
        console.error('Error creating chat relationship:', result.err);
        return false;
      }
    } catch (error) {
      console.error('Error creating chat relationship:', error);
      return false;
    }
  },

  // Get all chat relationships for a user
  async getChatRelationships(userEmail: string): Promise<Array<{
    clientEmail: string;
    freelancerEmail: string;
    bookingId: string;
    serviceTitle: string;
    status: string;
    createdAt: string;
  }>> {
    try {
      const actor = getChatStorageActor();
      const result = await actor.getChatRelationships(userEmail);

      if ('ok' in result) {
        return result.ok.map((rel: any) => ({
          clientEmail: rel.clientEmail,
          freelancerEmail: rel.freelancerEmail,
          bookingId: rel.bookingId,
          serviceTitle: rel.serviceTitle,
          status: rel.status,
          createdAt: rel.createdAt,
        }));
      } else {
        console.error('Error getting chat relationships:', result.err);
        return [];
      }
    } catch (error) {
      console.error('Error getting chat relationships:', error);
      return [];
    }
  },

  // Update relationship status (e.g., when booking is completed or cancelled)
  async updateRelationshipStatus(bookingId: string, newStatus: string): Promise<boolean> {
    try {
      const actor = getChatStorageActor();
      const result = await actor.updateRelationshipStatus(bookingId, newStatus);

      if ('ok' in result) {
        return result.ok;
      } else {
        console.error('Error updating relationship status:', result.err);
        return false;
      }
    } catch (error) {
      console.error('Error updating relationship status:', error);
      return false;
    }
  },
};