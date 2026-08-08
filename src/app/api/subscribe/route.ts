import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    console.log(`API Key: ${process.env.LOOPS_API_KEY?.substring(0, 5)}...`);

    const response = await fetch('https://app.loops.so/api/v1/contacts/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LOOPS_API_KEY}`
      },
      body: JSON.stringify({
        email,
        source: 'afterlife.work homepage'
      })
    });

    const data = await response.json();
    console.log('Loops API Response:', data);

    if (!response.ok) {
      console.error('Loops API Error:', {
        status: response.status,
        data
      });
      return NextResponse.json(
        { success: false, message: data.error || 'Failed to subscribe' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Thanks for subscribing!'
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while subscribing' },
      { status: 500 }
    );
  }
} 