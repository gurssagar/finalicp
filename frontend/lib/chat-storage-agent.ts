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
      agent.fetchRootKey().catch(err => {
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
      return IDL.Service({
        'authenticateUser': IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
        'getChatHistory': IDL.Func([IDL.Text, IDL.Text, IDL.Nat, IDL.Nat], [ChatResult_2], ['query']),
        'getRecentChats': IDL.Func([IDL.Text, IDL.Nat], [ChatResult_1], ['query']),
        'getTotalMessages': IDL.Func([], [IDL.Nat], ['query']),
        'healthCheck': IDL.Func([], [IDL.Text], ['query']),
        'saveMessage': IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text], [ChatResult], []),
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

// Wrapper functions
export const chatStorageApi = {
  // Authenticate user with email and display name
  async authenticateUser(email: string, displayName: string): Promise<boolean> {
    try {
      const actor = getChatStorageActor();
      return await actor.authenticateUser(email, displayName);
    } catch (error) {
      console.error('Error authenticating user:', error);
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
    timestamp?: string
  ): Promise<string | null> {
    try {
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
};