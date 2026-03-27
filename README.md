# TweetIQ - Twitter Analytics with AI

TweetIQ is a powerful Twitter analytics tool that analyzes user profiles, tweets, and generates AI-powered insights to help content creators improve their Twitter performance.

## Features

- **Profile Analysis**: Fetches user profile data and recent tweets
- **AI-Powered Insights**: Uses OpenAI to analyze content DNA and engagement patterns
- **Tweet Ideas Generation**: Generates personalized tweet ideas based on user's writing style
- **Growth Niches**: Identifies potential growth areas and content opportunities
- **Optimal Posting Times**: Suggests best times to post for maximum engagement
- **Shareable Reports**: Beautiful share cards to showcase Twitter analytics

## Tech Stack

### Backend
- **Node.js** with Express.js
- **TwitterAPI.io** for fetching user data (96% cheaper than official API)
- **OpenAI API** for content analysis and insights
- **Security**: Helmet, CORS, rate limiting

### Frontend
- **Vanilla HTML/CSS/JavaScript**
- **Modern UI** with smooth animations
- **Responsive design**

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd tweetiq-backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and update with your API keys:

```bash
cp .env.example .env
```

Update `.env` with your credentials:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# TwitterAPI.io Configuration
TWITTER_API_KEY=your_twitterapi_io_api_key

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 3. Get API Keys

#### TwitterAPI.io
1. Go to [TwitterAPI.io](https://twitterapi.io/)
2. Sign up and get your API key
3. TwitterAPI.io is 96% cheaper than the official Twitter API
4. No authentication required - just use the API key
5. You only need the API key (no bearer tokens, access tokens, etc.)

#### OpenAI API
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get your API key
3. Add the key to your `.env` file

### 4. Start the Backend Server

```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The backend will start on `http://localhost:3001`

### 5. Run the Frontend

Open `tweetiq-final.html` in your browser or serve it with a simple HTTP server:

```bash
# Using Python
python -m http.server 3000

# Using Node.js
npx serve -p 3000

# Or use any live server extension in VS Code
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

### Main Analysis
```
POST /api/analyze/profile
Body: { "username": "elonmusk" }
```

### Quick Profile Lookup
```
GET /api/analyze/profile/:username
```

### Regenerate Tweet Ideas
```
POST /api/analyze/regenerate-ideas
Body: { "profile": {...}, "analysis": {...} }
```

### Health Check
```
GET /api/health
```

## Usage

1. Open the frontend in your browser
2. Enter a Twitter username (with or without @)
3. Click "Analyze" to start the analysis
4. Wait for the AI-powered analysis to complete
5. View your personalized report with:
   - Content DNA analysis
   - Engagement metrics
   - Growth niches
   - Personalized tweet ideas
   - Optimal posting times

## Features in Detail

### Content DNA Analysis
- **Viral Hook Score**: How good your tweets are at grabbing attention
- **Humor Score**: Your ability to use humor effectively
- **Opinion Score**: Strength of your opinions and hot takes
- **Depth Score**: How much value and depth your content provides
- **Storytelling Score**: Your narrative and storytelling abilities

### AI Insights
- **Personal Persona**: Your primary content style
- **Strengths & Weaknesses**: What works and what doesn't
- **Growth Niches**: Untapped content opportunities
- **Optimal Schedule**: Best days and times to post

### Tweet Ideas
- Personalized based on your writing style
- Different types: hooks, opinions, stories, questions
- Scored for potential engagement
- Ready to copy and post

## Development

### Project Structure
```
├── server.js              # Main server file
├── package.json           # Dependencies
├── .env.example           # Environment template
├── routes/
│   └── analyze.js         # API routes
├── services/
│   ├── twitterService.js  # TwitterAPI.io integration
│   └── openaiService.js   # OpenAI API integration
├── tweetiq-final.html     # Frontend application
└── README.md             # This file
```

### Adding New Features
1. Add new routes in `routes/analyze.js`
2. Create new services in `services/`
3. Update frontend to use new endpoints
4. Update this README

## TwitterAPI.io Benefits

- **Cost Effective**: 96% cheaper than official Twitter API
- **No Authentication**: Just use your API key
- **High Performance**: Average response time under 500ms
- **No Rate Limits**: Up to 200 QPS per client
- **Reliable**: 99.99% uptime SLA

## Troubleshooting

### Common Issues

1. **TwitterAPI.io Errors**
   - Make sure your API key is correct
   - Check if you have sufficient credits
   - Verify the username exists

2. **OpenAI API Errors**
   - Check your API key and credits
   - Monitor usage to avoid rate limits

3. **CORS Errors**
   - Make sure `FRONTEND_URL` in `.env` matches your frontend URL
   - Check that the backend is running before accessing frontend

4. **Profile Not Found**
   - User might have a private account
   - Username might be incorrect
   - API might be temporarily unavailable

### Debug Mode
Set `NODE_ENV=development` in your `.env` file to see detailed error messages.

## License

MIT License - feel free to use this for your projects!

## Support

If you run into any issues or have questions, check the troubleshooting section or create an issue in the repository.
