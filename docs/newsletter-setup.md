# Newsletter Email Collection Setup

This guide will help you set up email collection for your newsletter signup form using Mailchimp (free tier: 500 contacts).

## Step 1: Create a Mailchimp Account

1. Go to [mailchimp.com](https://mailchimp.com) and create a free account
2. Verify your email address

## Step 2: Create an Audience

1. In your Mailchimp dashboard, click on "Audience" in the left sidebar
2. Click "Create Audience" or use the default one created for you
3. Note down your **Audience ID** from the audience settings (it looks like this: `a1b2c3d4e5`)

## Step 3: Generate an API Key

1. Click on your profile picture (bottom left) → "Account & billing"
2. Go to "Extras" → "API keys"
3. Click "Create A Key"
4. Copy the generated API key (it should look like: `1234567890abcdef-us1`)
5. Note the server prefix in your API key (the part after the dash, e.g., `us1`)

## Step 4: Configure Environment Variables

Add these variables to your `.env.local` file:

```bash
# Mailchimp Newsletter Configuration
MAILCHIMP_API_KEY=your_mailchimp_api_key_here
MAILCHIMP_SERVER_PREFIX=us1  # Replace with your server prefix
MAILCHIMP_LIST_ID=your_audience_list_id_here  # Your Audience ID
```

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Go to your homepage and try submitting an email in the newsletter form
3. Check your Mailchimp audience to see if the email was added
4. Check your server console for any error messages

## Alternative Email Services

If you prefer other services, the API route is designed to be easily extensible:

### ConvertKit (Free tier: 1,000 subscribers)
- More creator-focused
- Better automation features

### Buttondown (Free tier: 100 subscribers)
- Simple and clean interface
- Good for newsletters

### Beehiiv (Free tier: 2,500 subscribers)
- Growing fast, creator-focused
- Good referral program

## Troubleshooting

### Common Issues:

1. **"Invalid API Key"**: Double-check your API key and server prefix
2. **"Audience not found"**: Verify your Audience ID
3. **Emails not appearing**: Check your Mailchimp spam folder or pending approvals

### Testing the API directly:

You can test the newsletter API endpoint directly:

```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## Features Included

✅ Beautiful form design (preserved your existing styling)
✅ Email validation
✅ Loading states ("Saving...")
✅ Success feedback ("Saved! 🎉")
✅ Error handling
✅ Duplicate email detection
✅ Form reset after successful submission

## Next Steps

Once emails are collecting, you can:

1. Create welcome email sequences
2. Send promotional emails about new features
3. Build community announcements
4. Share exclusive content with subscribers

The form will automatically handle all the user interactions while maintaining your beautiful poker-themed design!