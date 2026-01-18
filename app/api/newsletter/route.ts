import { NextRequest, NextResponse } from 'next/server';

// Mailchimp configuration
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX; // e.g., 'us1'
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;

// Alternative: You can use other services like ConvertKit, Buttondown, etc.
// For now, we'll use Mailchimp as it's the most popular free option

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // If Mailchimp is configured, use it
        if (MAILCHIMP_API_KEY && MAILCHIMP_SERVER_PREFIX && MAILCHIMP_LIST_ID) {
            const mailchimpResponse = await fetch(
                `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `apikey ${MAILCHIMP_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email_address: email,
                        status: 'subscribed',
                        tags: ['newsletter', 'website-signup'],
                    }),
                }
            );

            if (!mailchimpResponse.ok) {
                const errorData = await mailchimpResponse.json();

                // If user is already subscribed, that's actually OK
                if (errorData.title === 'Member Exists') {
                    return NextResponse.json(
                        { message: 'Already subscribed!' },
                        { status: 200 }
                    );
                }

                console.error('Mailchimp error:', errorData);
                return NextResponse.json(
                    { error: 'Failed to subscribe' },
                    { status: 500 }
                );
            }

            const mailchimpData = await mailchimpResponse.json();
            return NextResponse.json(
                { message: 'Successfully subscribed!', data: mailchimpData },
                { status: 200 }
            );
        }

        // Fallback: Log to console for development/testing
        console.log('Newsletter subscription:', {
            email,
            timestamp: new Date().toISOString(),
        });

        // You could also save to a database here
        // Example: await saveToDatabase(email);

        return NextResponse.json(
            {
                message:
                    'Subscription logged (configure email service for production)',
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Newsletter API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Optional: Handle GET requests for testing
export async function GET() {
    return NextResponse.json({
        message: 'Newsletter API is working',
        configured: !!(
            MAILCHIMP_API_KEY &&
            MAILCHIMP_SERVER_PREFIX &&
            MAILCHIMP_LIST_ID
        ),
    });
}
