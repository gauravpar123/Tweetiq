const OpenAI = require('openai');

function parseJsonResponse(text) {
  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  const stripped = text.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
  return JSON.parse(stripped);
}

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
    });
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  }

  async analyzeTweets(tweets, profile) {
    try {
      console.log(`🧠 Deep analysis of ${tweets.length} tweets for @${profile.username}`);

      // If no tweets, use simple profile analysis
      if (!tweets || tweets.length === 0) {
        return this.generateProfileOnlyAnalysis(profile);
      }

      // Use actual tweets for deep analysis
      const tweetTexts = tweets.map(tweet => tweet.text).join('\n---\n');

      const prompt = `
Analyze @${profile.username}'s REAL Twitter content:

PROFILE:
Name: ${profile.name}
Bio: "${profile.description}"
Followers: ${profile.metrics?.followers_count || 0}

ACTUAL TWEETS:
${tweetTexts}

Generate PERSONALIZED analysis based on their REAL content:
{
  "contentDNA": {
    "viralHook": number,
    "humor": number,
    "opinion": number,
    "depth": number,
    "storytelling": number,
    "technical": number,
    "personal": number
  },
  "contentMix": [
    { "label": "string", "percentage": number }
  ],
  "personality": {
    "primaryPersona": string (based on their real tweet style),
    "tone": string (from their actual writing),
    "communicationStyle": string (how they really interact)
  },
  "engagement": {
    "avgEngagementRate": string (e.g. "4.2%", estimate based on follower count and content quality),
    "bestPostingTimes": array of strings (e.g. ["9-11 AM", "6-8 PM"]),
    "topPerformingContent": array of strings (content types that perform best),
    "engagementLevel": string ("High", "Medium", or "Growing")
  },
  "contentThemes": array of strings (extracted from ACTUAL tweets),
  "tweetPatterns": {
    "avgLength": number (from their real tweets),
    "hashtags": boolean (from actual usage),
    "mentions": boolean (from actual usage)
  }
}

IMPORTANT: Base analysis ONLY on their actual tweet content and bio. Make it unique to @${profile.username}.
You must return real calculated scores between 1 and 100 based on the actual tweet data provided. Never return 0. If data is insufficient return 50 as default.
Analyse the tweet content and return contentMix as a JSON array: [{ label: string, percentage: number }] with 5 categories that reflect this specific user's actual posting style. Percentages must add up to 100.
`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1500
      });

      const analysis = parseJsonResponse(response.choices[0].message.content);
      
      if (analysis && analysis.contentDNA) {
        for (const key in analysis.contentDNA) {
          const val = analysis.contentDNA[key];
          if (!val || val === 0 || isNaN(val)) {
            analysis.contentDNA[key] = 50;
          }
        }
      }

      console.log(`✅ Deep analysis completed for @${profile.username}`);
      return analysis;

    } catch (error) {
      console.error('❌ Error in analysis:', error.message);
      return this.generateProfileOnlyAnalysis(profile);
    }
  }

  async generateInsights(profile, analysis, tweets = []) {
    try {
      console.log(`💡 Generating personalized insights for @${profile.username}`);

      // Get actual tweet content for analysis
      const tweetTexts = tweets && tweets.length > 0 ?
        tweets.map(tweet => tweet.text).join('\n---\n') :
        'No tweets available';

      const prompt = `
Generate UNIQUE insights for @${profile.username} based on their REAL content:

PROFILE:
Name: ${profile.name}
Bio: "${profile.description}"
Followers: ${profile.metrics?.followers_count || 0}

CONTENT ANALYSIS:
Themes: ${analysis.contentThemes?.join(', ') || 'None'}
Persona: ${analysis.personality?.primaryPersona || 'Unknown'}

ACTUAL TWEETS:
${tweetTexts}

Create PERSONALIZED insights:
{
  "overallScore": number (0-100 based on their profile strength),
  "rankPercentile": string (e.g., "Top 15%"),
  "keyInsights": [
    {
      "type": "strength" or "opportunity",
      "title": string (specific to their content),
      "description": string (based on their actual tweets)
    }
  ],
  "growthNiches": [
    {
      "niche": string (based on gaps in their current content),
      "potential": string (e.g., "+200% reach"),
      "description": string (why this niche fits them),
      "tags": array of strings (relevant to their style)
    }
  ],
  "optimalPostingSchedule": {
    "days": array of strings,
    "times": array of strings,
    "timezone": string
  },
  "recommendations": array of strings (based on their actual content gaps)
}

IMPORTANT: Make niches and insights UNIQUE to @${profile.username} based on their ACTUAL tweets and bio. Don't use generic suggestions.
IMPORTANT: Provide exactly 2 niches only. Make insights directly actionable based on their actual metrics and content style.
`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 1500
      });

      const insights = parseJsonResponse(response.choices[0].message.content);
      console.log(`✅ Personalized insights generated for @${profile.username}`);
      return insights;

    } catch (error) {
      console.error('❌ Error generating insights:', error.message);
      throw new Error('Insight generation failed');
    }
  }

  async generateTweetIdeas(profile, analysis) {
    try {
      console.log(`💡 Generating 100% personalized tweet ideas for @${profile.username}`);

      const prompt = `
Generate 4 thoughtful, relatable tweet ideas that sound EXACTLY like @${profile.username} wrote them:

PROFILE:
Name: ${profile.name}
Username: @${profile.username}
Bio: "${profile.description}"

THEIR CONTENT STYLE:
Themes: ${analysis.contentThemes?.join(', ') || 'None'}
Persona: ${analysis.personality?.primaryPersona || 'Creator'}
Tone: ${analysis.personality?.tone || 'Neutral'}
Communication Style: ${analysis.personality?.communicationStyle || 'Standard'}

Create 4 thoughtful tweets in THEIR exact voice (NO EMOJIS):
{
  "tweetIdeas": [
    {
      "type": string (based on their actual content themes),
      "content": string (written EXACTLY like they would write it, thoughtful and relatable, NO EMOJIS),
      "score": number (0-100),
      "reasoning": string (why this fits their style),
      "hashtags": array of strings (they would actually use),
      "bestTime": string
    }
  ]
}

CRITICAL: Make these tweets sound like @${profile.username} ACTUALLY wrote them:
1. Use their exact tone: "${analysis.personality?.tone}"
2. Match their communication style: "${analysis.personality?.communicationStyle}"
3. Focus on their themes: ${analysis.contentThemes?.join(', ')}
4. Write in their voice based on bio: "${profile.description}"
5. Consider their name: ${profile.name}
6. NO EMOJIS - make content thoughtful and relatable
7. Make it feel authentic and personal to their journey

Create tweets their followers would think were genuinely written by them.
`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.9,
        max_tokens: 1500
      });

      const ideas = parseJsonResponse(response.choices[0].message.content);
      console.log(`✅ Personalized tweet ideas completed for @${profile.username}`);
      return ideas;

    } catch (error) {
      console.error('❌ Error generating tweet ideas:', error.message);
      // Return basic ideas if AI fails
      return {
        tweetIdeas: [
          { type: "tech", content: "Building something new and wanted to share my thoughts on the process", score: 80, hashtags: ["tech", "innovation"] },
          { type: "personal", content: "Growth journey continues and I'm learning valuable lessons along the way", score: 75, hashtags: ["growth", "journey"] },
          { type: "opinion", content: "My thoughts on the future and where things are heading in our space", score: 70, hashtags: ["opinion", "future"] }
        ]
      };
    }
  }

  async generateProfileOnlyAnalysis(profile) {
    try {
      console.log('📊 Quick profile analysis');

      const prompt = `
Quick analysis of @${profile.username}:
Name: ${profile.name}
Bio: "${profile.description}"

Simple JSON response:
{
  "contentDNA": {"viralHook": 65, "humor": 55, "opinion": 60, "depth": 50, "storytelling": 45, "technical": 70, "personal": 40},
  "personality": {"primaryPersona": "Creator", "tone": "Casual", "communicationStyle": "Friendly"},
  "contentThemes": ["building", "tech"],
  "tweetPatterns": {"avgLength": 120, "hashtags": true, "mentions": false}
}
`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 200
      });

      const analysis = parseJsonResponse(response.choices[0].message.content);
      console.log(`✅ Quick profile analysis completed for @${profile.username}`);
      return analysis;

    } catch (error) {
      console.error('❌ Error in profile analysis:', error.message);
      // Return basic analysis if AI fails
      return {
        contentDNA: { viralHook: 50, humor: 50, opinion: 50, depth: 50, storytelling: 50, technical: 50, personal: 50 },
        personality: { primaryPersona: "User", tone: "Neutral", communicationStyle: "Standard" },
        contentThemes: ["general"],
        tweetPatterns: { avgLength: 100, hashtags: false, mentions: false }
      };
    }
  }
}

module.exports = new OpenAIService();
