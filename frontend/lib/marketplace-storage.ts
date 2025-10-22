import { getMarketplaceActor, initializeMarketplace } from './ic-marketplace-agent';

// Marketplace storage functions
export async function getBookingsByClientEmail(email: string): Promise<any[]> {
  try {
    console.log('Getting bookings for client:', email);

    // Try to get bookings from the marketplace canister
    try {
      await initializeMarketplace();
      const actor = await getMarketplaceActor();
      const result = await actor.listBookingsForClient(email, [], 100, 0);

      if ('ok' in result) {
        console.log('Retrieved bookings from marketplace:', result.ok);
        return result.ok;
      } else {
        console.log('No bookings found for client:', email);
        return [];
      }
    } catch (canisterError) {
      console.warn('Marketplace canister not available:', canisterError);
      console.log('Marketplace canister unavailable - no bookings to return');
      return [];
    }
  } catch (error) {
    console.error('Error getting bookings for client:', error);
    return [];
  }
}

export async function getBookingsByFreelancerEmail(email: string): Promise<any[]> {
  try {
    console.log('Getting bookings for freelancer:', email);

    // Try to get bookings from the marketplace canister
    try {
      await initializeMarketplace();
      const actor = await getMarketplaceActor();
      const result = await actor.listBookingsForFreelancer(email, [], 100, 0);

      if ('ok' in result) {
        console.log('Retrieved bookings from marketplace:', result.ok);
        return result.ok;
      } else {
        console.log('No bookings found for freelancer:', email);
        return [];
      }
    } catch (canisterError) {
      console.warn('Marketplace canister not available:', canisterError);
      console.log('Marketplace canister unavailable - no bookings to return');
      return [];
    }
  } catch (error) {
    console.error('Error getting bookings for freelancer:', error);
    return [];
  }
}

// Helper function to create chat relationships from bookings
export async function createChatRelationshipsFromBookings(bookings: any[]): Promise<any[]> {
  try {
    const chatRelationships = [];

    for (const booking of bookings) {
      try {
        // Check if chat relationship already exists
        const existingResponse = await fetch('/api/chat/relationships', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (existingResponse.ok) {
          const existingData = await existingResponse.json();
          const existingRelationship = existingData.data?.relationships?.find(
            (rel: any) => rel.clientEmail === booking.client_email && rel.freelancerEmail === booking.freelancer_email
          );

          if (!existingRelationship) {
            // Create new chat relationship
            const createResponse = await fetch('/api/chat/relationships', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                bookingId: booking.booking_id,
                clientEmail: booking.client_email,
                freelancerEmail: booking.freelancer_email
              }),
            });

            if (createResponse.ok) {
              const relationshipData = await createResponse.json();
              chatRelationships.push({
                ...relationshipData.data,
                booking: booking
              });
            }
          } else {
            chatRelationships.push({
              ...existingRelationship,
              booking: booking
            });
          }
        }
      } catch (error) {
        console.error('Error creating chat relationship for booking:', booking.booking_id, error);
      }
    }

    return chatRelationships;
  } catch (error) {
    console.error('Error creating chat relationships from bookings:', error);
    return [];
  }
}
