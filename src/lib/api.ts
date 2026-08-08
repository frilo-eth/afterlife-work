export interface SubscribeResponse {
  success: boolean;
  message: string;
}

export async function subscribeToNewsletter(email: string): Promise<SubscribeResponse> {
  try {
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to subscribe'
      };
    }

    return {
      success: true,
      message: data.message || 'Thanks for subscribing!'
    };
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return {
      success: false,
      message: 'An error occurred while subscribing'
    };
  }
} 