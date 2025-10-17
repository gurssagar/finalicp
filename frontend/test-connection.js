// Test script to verify frontend-backend connectivity
const { Actor, HttpAgent } = require('@dfinity/agent');

// Simple test to connect to the backend canister
async function testBackendConnection() {
  try {
    const agent = new HttpAgent({
      host: 'http://localhost:4943',
    });

    // Disable certificate verification for local development
    await agent.fetchRootKey();

    const canisterId = 'bkyz2-fmaaa-aaaaa-qaaaq-cai';

    // Simple actor interface
    const actor = Actor.createActor(canisterId, {
      agent,
      canisterId,
    });

    // Test the greet function
    const response = await actor.greet('Frontend JavaScript Test');
    console.log('✅ Backend connection successful!');
    console.log('Response:', response);

    // Test version function
    const version = await actor.getVersion();
    console.log('Backend version:', version);

  } catch (error) {
    console.error('❌ Backend connection failed:', error);
  }
}

testBackendConnection();