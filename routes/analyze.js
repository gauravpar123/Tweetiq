const express = require('express');
const router = express.Router();
const twitterService = require('../services/twitterService');
const openaiService = require('../services/openaiService');

// Track tweet idea regenerations per user per day (in-memory storage)
const tweetIdeaRegenerations = new Map(); // username -> { date, count }

// Check if user can regenerate tweet ideas (max 2 per day)
function canRegenerateTweetIdeas(username) {
  const today = new Date().toDateString();
  const userRegenerations = tweetIdeaRegenerations.get(username);

  if (!userRegenerations || userRegenerations.date !== today) {
    // First regeneration today or new user
    tweetIdeaRegenerations.set(username, { date: today, count: 1 });
    return { allowed: true, remaining: 1 };
  } else if (userRegenerations.count < 2) {
    // Second regeneration today
    userRegenerations.count++;
    return { allowed: true, remaining: 0 };
  } else {
    // Already used 2 regenerations today
    return { allowed: false, remaining: 0, resetTime: 'tomorrow' };
  }
}

// Demo data for when API is unavailable
function getDemoData(username = 'user') {
  // Custom data for GUJJUIIXI
  if (username.toLowerCase() === 'gujjuixi') {
    return {
      profile: {
        id: "1234567890",
        username: "gujjuixi",
        name: "GUJJUIIXI",
        description: "🚀 Tech Enthusiast | 💻 Developer | 🎯 Digital Creator | Building the future one line of code at a time",
        profileImageUrl: "https://unavatar.io/gujjuxi.png",
        profileImageUrl400: "https://unavatar.io/gujjuxi.png",
        metrics: {
          followers_count: 2847,
          following_count: 892,
          tweet_count: 1234
        },
        verified: false,
        createdAt: "2023-01-15T10:30:00.000Z",
        location: "🌍 Digital World",
        url: "https://twitter.com/gujjuxi"
      },
      analysis: {
        contentDNA: {
          viralHook: 76,
          humor: 68,
          opinion: 82,
          depth: 71,
          storytelling: 64,
          technical: 88,
          personal: 52
        },
        contentMix: [
          { label: "Tech insights", percentage: 40 },
          { label: "Personal stories", percentage: 25 },
          { label: "Opinions", percentage: 20 },
          { label: "Tutorials", percentage: 15 }
        ],
        engagement: {
          avgEngagementRate: "6.2%",
          bestPostingTimes: ["9-11 AM", "6-8 PM"],
          topPerformingContent: ["Tech insights", "Personal stories", "Opinions"],
          engagementLevel: "High"
        },
        personality: {
          primaryPersona: "The Tech Innovator",
          secondaryPersona: "Digital Creator",
          tone: "Technical yet approachable",
          communicationStyle: "Data-driven with personal touch"
        },
        strengths: [
          "Strong technical expertise",
          "Engaging content creation",
          "Consistent posting schedule"
        ],
        weaknesses: [
          "Could be more interactive",
          "Sometimes too technical"
        ],
        contentThemes: [
          "Technology",
          "Development",
          "Digital Innovation",
          "Personal Growth"
        ],
        tweetPatterns: {
          avgLength: 145,
          frequency: "2-4 tweets per day",
          hashtags: true,
          mentions: true,
          media: true
        }
      },
      insights: {
        overallScore: 78,
        rankPercentile: "Top 15%",
        keyInsights: [
          {
            type: "strength",
            title: "Technical authority",
            description: "Your tech insights drive 3.5x more engagement than average"
          },
          {
            type: "opportunity",
            title: "Evening posts perform better",
            description: "6-8 PM posts get 2.2x more engagement"
          }
        ],
        growthNiches: [
          {
            niche: "Web Development Trends",
            potential: "+180% reach",
            description: "Your dev insights align perfectly with growing web tech interest",
            tags: ["webdev", "javascript", "react", "frontend"]
          },
          {
            niche: "AI & Machine Learning",
            potential: "+250% reach",
            description: "Your technical content resonates with AI-curious audience",
            tags: ["AI", "machine learning", "tech", "innovation"]
          }
        ],
        optimalPostingSchedule: {
          days: ["Monday", "Wednesday", "Friday"],
          times: ["9-11 AM", "6-8 PM"],
          timezone: "IST"
        },
        recommendations: [
          "Share more behind-the-scenes content",
          "Create technical threads",
          "Engage more with followers"
        ]
      },
      tweetIdeas: {
        tweetIdeas: [
          {
            type: "technical",
            content: "Just discovered an amazing JavaScript trick that reduced my code by 40%! 🚀 Thread 🧵",
            score: 85,
            reasoning: "Your technical tips perform 3.5x better than average",
            hashtags: ["javascript", "webdev", "coding", "tips"],
            bestTime: "9-11 AM"
          },
          {
            type: "opinion",
            content: "Hot take: AI won't replace developers, but developers who use AI will replace those who don't. 🤖",
            score: 88,
            reasoning: "Your tech opinions drive high engagement",
            hashtags: ["AI", "development", "future", "tech"],
            bestTime: "6-8 PM"
          },
          {
            type: "personal",
            content: "My journey from 0 to 1000 followers taught me more about consistency than any coding tutorial 📈",
            score: 76,
            reasoning: "Your personal stories resonate well with audience",
            hashtags: ["journey", "growth", "consistency", "tips"],
            bestTime: "6-8 PM"
          },
          {
            type: "value",
            content: "The best investment you can make is in yourself. Keep learning, keep growing.",
            score: 82,
            reasoning: "Value-driven content performs consistently well",
            hashtags: ["growth", "learning", "value"],
            bestTime: "9-11 AM"
          }
        ]
      },
      metadata: {
        tweetsAnalyzed: 1234,
        analysisDate: new Date().toISOString(),
        username: username,
        demoMode: true,
        dataSource: "Custom profile data for GUJJUIIXI"
      }
    };
  }

  // Default demo data for other users
  return {
    profile: {
      id: '123456789',
      username: username,
      name: username.charAt(0).toUpperCase() + username.slice(1),
      description: 'Demo user for testing TweetIQ analytics',
      profileImageUrl: `https://unavatar.io/${username}.png`,
      profileImageUrl400: `https://unavatar.io/${username}.png`,
      metrics: {
        followers_count: Math.floor(Math.random() * 100000) + 1000,
        following_count: Math.floor(Math.random() * 1000) + 100,
        tweet_count: Math.floor(Math.random() * 10000) + 500
      },
      verified: Math.random() > 0.7,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Demo City',
      url: `https://twitter.com/${username}`
    },
    analysis: {
      contentDNA: {
        viralHook: Math.floor(Math.random() * 30) + 70,
        humor: Math.floor(Math.random() * 30) + 60,
        opinion: Math.floor(Math.random() * 20) + 80,
        depth: Math.floor(Math.random() * 40) + 40,
        storytelling: Math.floor(Math.random() * 30) + 50,
        technical: Math.floor(Math.random() * 30) + 60,
        personal: Math.floor(Math.random() * 40) + 30
      },
      contentMix: [
        { label: "Opinions", percentage: 45 },
        { label: "Tech insights", percentage: 30 },
        { label: "Personal stories", percentage: 25 }
      ],
      engagement: {
        avgEngagementRate: (Math.random() * 5 + 3).toFixed(1) + '%',
        bestPostingTimes: ['8-10 AM', '2-4 PM'],
        topPerformingContent: ['Opinions', 'Tech insights', 'Personal stories'],
        engagementLevel: 'High'
      },
      personality: {
        primaryPersona: 'The Innovator',
        secondaryPersona: 'Thought Leader',
        tone: 'Analytical yet approachable',
        communicationStyle: 'Data-driven with personal touch'
      },
      strengths: ['Strong opinions', 'Technical expertise', 'Engaging writing style'],
      weaknesses: ['Could be more consistent', 'Sometimes too technical'],
      contentThemes: ['Technology', 'Innovation', 'Personal Growth'],
      tweetPatterns: {
        avgLength: Math.floor(Math.random() * 50) + 100,
        frequency: '3-5 tweets per day',
        hashtags: true,
        mentions: true,
        media: true
      }
    },
    insights: {
      overallScore: Math.floor(Math.random() * 20) + 75,
      rankPercentile: 'Top 10%',
      keyInsights: [
        {
          type: 'strength',
          title: 'Strong voice',
          description: 'Your opinions drive 4x more engagement than average'
        },
        {
          type: 'opportunity',
          title: 'Weekend posts perform better',
          description: 'Saturday posts get 2.5x more engagement'
        }
      ],
      growthNiches: [
        {
          niche: 'AI & Future Tech',
          potential: '+250% reach',
          description: 'Your tech insights align perfectly with growing AI interest',
          tags: ['AI', 'innovation', 'future tech']
        },
        {
          niche: 'Personal Development',
          potential: '+180% reach',
          description: 'Your journey resonates with growth-focused audience',
          tags: ['growth', 'mindset', 'success']
        }
      ],
      optimalPostingSchedule: {
        days: ['Tuesday', 'Thursday', 'Saturday'],
        times: ['8-10 AM', '2-4 PM'],
        timezone: 'EST'
      },
      recommendations: ['Post more technical threads', 'Share personal stories', 'Use more hashtags']
    },
    tweetIdeas: {
      tweetIdeas: [
        {
          type: 'opinion',
          content: 'The future of AI isn\'t about replacement—it\'s about augmentation. Those who understand this will thrive.',
          score: 89,
          reasoning: 'Your tech opinions perform 4x better than average',
          hashtags: ['AI', 'future', 'tech'],
          bestTime: '8-10 AM'
        },
        {
          type: 'story',
          content: 'I made a $10K mistake that taught me more than any success. Thread 🧵',
          score: 92,
          reasoning: 'Your personal stories drive high engagement',
          hashtags: ['storytime', 'lessons', 'growth'],
          bestTime: '2-4 PM'
        },
        {
          type: 'hook',
          content: 'Unpopular opinion: Most "productivity hacks" are just procrastination in disguise.',
          score: 85,
          reasoning: 'Your contrarian takes perform well',
          hashtags: ['productivity', 'opinion', 'truth'],
          bestTime: '8-10 AM'
        },
        {
          type: 'value',
          content: 'Here are 3 tools that save me 10 hours a week.',
          score: 88,
          reasoning: 'Tool recommendations perform well',
          hashtags: ['tools', 'productivity', 'tips'],
          bestTime: '2-4 PM'
        }
      ]
    },
    metadata: {
      tweetsAnalyzed: 50,
      analysisDate: new Date().toISOString(),
      username: username,
      demoMode: true
    }
  };
}

// Main analysis endpoint
router.post('/profile', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Clean username (remove @ if present)
    const cleanUsername = username.replace('@', '').trim();

    console.log(`🔍 Starting analysis for @${cleanUsername}`);

    // Step 1: Fetch user profile and tweets from Twitter API
    const userData = await twitterService.getUserData(cleanUsername);

    if (!userData) {
      return res.status(404).json({ error: 'User not found or account is private' });
    }

    const profile = userData.profile;

    // Step 2: Calculate TweetIQ Score from Twitter data
    console.log('📊 Calculating TweetIQ Score from Twitter data...');

    // Calculate TweetIQ Score based on Twitter metrics
    const followers = profile.metrics.followers_count || 0;
    const following = profile.metrics.following_count || 0;
    const tweets = profile.metrics.tweet_count || 0;
    const verified = profile.verified || false;

    // TweetIQ Score calculation (0-100)
    let tweetIQScore = 0;

    // Followers contribution (40%)
    if (followers > 100000) tweetIQScore += 40;
    else if (followers > 50000) tweetIQScore += 35;
    else if (followers > 10000) tweetIQScore += 30;
    else if (followers > 5000) tweetIQScore += 25;
    else if (followers > 1000) tweetIQScore += 20;
    else if (followers > 500) tweetIQScore += 15;
    else tweetIQScore += 10;

    // Tweet consistency (20%)
    if (tweets > 50000) tweetIQScore += 20;
    else if (tweets > 20000) tweetIQScore += 18;
    else if (tweets > 10000) tweetIQScore += 15;
    else if (tweets > 5000) tweetIQScore += 12;
    else if (tweets > 1000) tweetIQScore += 8;
    else tweetIQScore += 5;

    // Following ratio (15%)
    const followingRatio = following > 0 ? followers / following : followers;
    if (followingRatio > 10) tweetIQScore += 15;
    else if (followingRatio > 5) tweetIQScore += 12;
    else if (followingRatio > 2) tweetIQScore += 8;
    else if (followingRatio > 1) tweetIQScore += 5;
    else tweetIQScore += 2;

    // Verification bonus (15%)
    if (verified) tweetIQScore += 15;

    // Engagement potential (10%)
    if (followers > 0 && tweets > 0) {
      const engagementRatio = tweets / followers;
      if (engagementRatio > 0.5) tweetIQScore += 10;
      else if (engagementRatio > 0.3) tweetIQScore += 8;
      else if (engagementRatio > 0.1) tweetIQScore += 5;
      else tweetIQScore += 3;
    }

    tweetIQScore = Math.min(100, Math.round(tweetIQScore));

    console.log(`📈 TweetIQ Score: ${tweetIQScore}/100 (Followers: ${followers}, Tweets: ${tweets}, Verified: ${verified})`);

    // Step 3: Use Bankr LLM for personalized analysis
    console.log('🧠 Starting personalized AI analysis with Bankr LLM...');

    let analysis, insights, tweetIdeas;

    try {
      // Use Bankr LLM for analysis
      analysis = await openaiService.analyzeTweets(userData.tweets, profile);
      insights = await openaiService.generateInsights(profile, analysis, userData.tweets);
      tweetIdeas = await openaiService.generateTweetIdeas(profile, analysis);
      console.log('✅ Personalized AI analysis completed with Bankr LLM');
    } catch (error) {
      console.log('⚠️ AI analysis failed, using basic analysis:', error.message);

      // Fallback to personalized basic analysis
      analysis = {
        contentDNA: {
          viralHook: tweetIQScore, // Match the main TweetIQ Score exactly
          humor: Math.min(80, Math.floor((followers / 2000) + 45)),
          opinion: Math.min(85, Math.floor((followers / 1500) + 50)),
          depth: Math.min(75, Math.floor((followers / 2500) + 40)),
          storytelling: Math.min(70, Math.floor((followers / 3000) + 35)),
          technical: Math.min(95, Math.floor((followers / 800) + 60)),
          personal: Math.min(65, Math.floor((followers / 4000) + 30))
        },
        contentMix: [
          { label: followers > 10000 ? "Industry insights" : "Tech updates", percentage: 40 },
          { label: "Personal stories", percentage: 35 },
          { label: followers > 10000 ? "Technical content" : "Quick tips", percentage: 25 }
        ],
        engagement: {
          avgEngagementRate: followers > 0 ?
            `${((Math.random() * 3 + 1.5 + (followers > 10000 ? 1 : 0))).toFixed(1)}%` : "2.5%",
          bestPostingTimes: followers > 50000 ? ["8-10 AM", "7-9 PM"] : ["9-11 AM", "6-8 PM"],
          topPerformingContent: followers > 10000 ?
            ["Industry insights", "Personal stories", "Technical content"] :
            ["Tech updates", "Personal journey", "Quick tips"],
          engagementLevel: followers > 10000 ? "High" : followers > 1000 ? "Medium" : "Growing"
        },
        personality: {
          primaryPersona: verified ?
            (followers > 50000 ? "Industry Expert" : "Thought Leader") :
            (followers > 10000 ? "Content Creator" : "Emerging Voice"),
          secondaryPersona: followers > 20000 ? "Influencer" : "Specialist",
          tone: followers > 50000 ? "Authoritative" : "Engaging and informative",
          communicationStyle: followers > 20000 ? "Professional yet approachable" : "Direct and conversational"
        },
        strengths: followers > 5000 ? [
          `Strong ${followers.toLocaleString()} follower base`,
          "Consistent content strategy",
          verified ? "Verified credibility" : "Growing influence"
        ] : [
          "Active engagement",
          "Niche expertise",
          "Consistent posting"
        ],
        weaknesses: followers > 10000 ? [
          "Could optimize posting frequency",
          "More interactive content opportunities"
        ] : [
          "Room for follower growth",
          "Could increase engagement rate"
        ],
        contentThemes: followers > 20000 ?
          ["Industry leadership", "Innovation", "Strategic insights"] :
          ["Technology", "Learning", "Growth journey"],
        tweetPatterns: {
          avgLength: followers > 10000 ? 160 : 120,
          frequency: followers > 50000 ? "5-10 tweets per day" : "2-4 tweets per day",
          hashtags: followers > 5000,
          mentions: followers > 2000,
          media: followers > 3000
        }
      };

      insights = {
        overallScore: tweetIQScore,
        rankPercentile: followers > 50000 ? "Top 10%" : followers > 10000 ? "Top 25%" : followers > 1000 ? "Top 50%" : "Top 75%",
        keyInsights: [
          {
            type: "strength",
            title: followers > 10000 ? "Established presence" : "Growing influence",
            description: `Your ${followers.toLocaleString()} followers show ${followers > 10000 ? "strong" : "steady"} community building`
          },
          {
            type: "opportunity",
            title: followers > 20000 ? "Engagement optimization" : "Growth acceleration",
            description: followers > 20000 ?
              "Your content has potential for higher engagement rates" :
              "Focus on consistent posting to accelerate growth"
          }
        ],
        growthNiches: followers > 10000 ? [
          {
            niche: "Thought Leadership",
            potential: "+180% reach",
            description: `${verified ? "Your verified status" : "Your expertise"} positions you as an authority`,
            tags: ["leadership", "expertise", "authority"]
          },
          {
            niche: "Industry Innovation",
            potential: "+150% reach",
            description: "Your content style aligns with emerging trends",
            tags: ["innovation", "trends", "future"]
          }
        ] : [
          {
            niche: "Skill Development",
            potential: "+200% reach",
            description: "Your journey content resonates with learners",
            tags: ["skills", "learning", "development"]
          },
          {
            niche: "Community Building",
            potential: "+120% reach",
            description: "Your authentic style builds strong connections",
            tags: ["community", "authenticity", "connection"]
          }
        ],
        optimalPostingSchedule: {
          days: followers > 20000 ? ["Monday", "Wednesday", "Friday", "Sunday"] : ["Tuesday", "Thursday", "Saturday"],
          times: followers > 50000 ? ["8-10 AM", "12-2 PM", "7-9 PM"] : ["9-11 AM", "6-8 PM"],
          timezone: "IST"
        },
        recommendations: followers > 5000 ? [
          "Engage more with follower comments",
          "Share behind-the-scenes content",
          "Collaborate with similar creators"
        ] : [
          "Post consistently 3-4 times per day",
          "Use relevant hashtags strategically",
          "Engage with trending topics in your niche"
        ]
      };

      tweetIdeas = {
        tweetIdeas: followers > 10000 ? [
          {
            type: "leadership",
            content: `The future of ${followers > 50000 ? "our industry" : "this space"} is changing rapidly. Here's my perspective on where we're headed and what it means for creators like us.`,
            score: 88,
            reasoning: "Your followers value your strategic insights",
            hashtags: ["future", "strategy", "leadership"],
            bestTime: "9-11 AM"
          },
          {
            type: "personal",
            content: `Reaching ${followers.toLocaleString()} followers taught me these 3 crucial lessons about ${followers > 50000 ? "building movements" : "creating impact"} that I wish I knew earlier.`,
            score: 92,
            reasoning: "Milestone content drives high engagement",
            hashtags: ["milestone", "lessons", "growth"],
            bestTime: "6-8 PM"
          },
          {
            type: "technical",
            content: `Just discovered a game-changing approach to ${followers > 50000 ? "scaling innovation" : "solving complex problems"} that I had to share with my community.`,
            score: 85,
            reasoning: "Technical insights establish your expertise",
            hashtags: ["innovation", "technical", "insights"],
            bestTime: "12-2 PM"
          },
          {
            type: "value",
            content: "Focus on the fundamentals. The shiny new tools will always wait, but strong core skills are forever.",
            score: 82,
            reasoning: "Actionable advice builds trust",
            hashtags: ["skills", "focus", "fundamentals"],
            bestTime: "4-6 PM"
          }
        ] : [
          {
            type: "journey",
            content: `Every expert was once a beginner. Here's what I'm learning on my journey to ${followers.toLocaleString()} followers and the challenges that shaped my perspective.`,
            score: 80,
            reasoning: "Authentic journey content resonates",
            hashtags: ["journey", "learning", "growth"],
            bestTime: "9-11 AM"
          },
          {
            type: "value",
            content: `Here's 3 practical tips that helped me grow from 0 to ${followers.toLocaleString()} followers and how you can apply them to your own journey.`,
            score: 85,
            reasoning: "Value-driven content performs well",
            hashtags: ["tips", "growth", "value"],
            bestTime: "6-8 PM"
          },
          {
            type: "engagement",
            content: "What's the biggest challenge you're facing right now in your creative journey? Let's discuss solutions and support each other in the comments.",
            score: 78,
            reasoning: "Engagement questions boost interaction",
            hashtags: ["community", "engagement", "discussion"],
            bestTime: "7-9 PM"
          },
          {
            type: "motivation",
            content: "It's not about being the best, it's about being better than you were yesterday.",
            score: 80,
            reasoning: "Motivational content resonates",
            hashtags: ["motivation", "consistency", "mindset"],
            bestTime: "8-10 AM"
          }
        ]
      };
    }

    // Always compute engagement from real tweet data when available
    if (userData.tweets.length > 0) {
      const tweetCount = userData.tweets.length;
      let totalLikes = 0, totalRTs = 0, totalReplies = 0, totalQuotes = 0, totalViews = 0;
      userData.tweets.forEach(t => {
        totalLikes += t.likeCount || t.likes || 0;
        totalRTs += t.retweetCount || t.retweets || 0;
        totalReplies += t.replyCount || t.replies || 0;
        totalQuotes += t.quoteCount || t.quotes || 0;
        totalViews += t.viewCount || t.views || 0;
      });
      const avgInteractions = (totalLikes + totalRTs + totalReplies + totalQuotes) / tweetCount;
      const avgViews = totalViews / tweetCount;

      // Use views-based engagement (more accurate), fall back to follower-based
      let engRate;
      if (avgViews > 0) {
        engRate = ((avgInteractions / avgViews) * 100).toFixed(1);
      } else if (followers > 0) {
        engRate = ((avgInteractions / followers) * 100).toFixed(1);
      } else {
        engRate = '0.0';
      }

      const engLevel = parseFloat(engRate) > 3 ? 'Very High' :
                        parseFloat(engRate) > 1 ? 'High' :
                        parseFloat(engRate) > 0.5 ? 'Medium' : 'Growing';

      analysis.engagement = {
        avgEngagementRate: `${engRate}%`,
        avgLikes: Math.round(totalLikes / tweetCount),
        avgRetweets: Math.round(totalRTs / tweetCount),
        avgReplies: Math.round(totalReplies / tweetCount),
        avgViews: Math.round(avgViews),
        bestPostingTimes: analysis.engagement?.bestPostingTimes || (followers > 50000 ? ['8-10 AM', '7-9 PM'] : ['9-11 AM', '6-8 PM']),
        topPerformingContent: analysis.engagement?.topPerformingContent || analysis.contentThemes?.slice(0, 3) || ['General content'],
        engagementLevel: engLevel
      };
    } else if (!analysis.engagement) {
      // Estimate when no tweets available
      const ratio = following > 0 ? Math.min(followers / following, 100) : 1;
      const ratioBonus = Math.log10(Math.max(ratio, 1)) * 0.5;
      let estRate;
      if (followers > 1000000) estRate = (1.2 + ratioBonus).toFixed(1);
      else if (followers > 100000) estRate = (2.5 + ratioBonus).toFixed(1);
      else if (followers > 10000) estRate = (3.5 + ratioBonus).toFixed(1);
      else if (followers > 1000) estRate = (4.5 + ratioBonus).toFixed(1);
      else estRate = (5.5 + ratioBonus).toFixed(1);
      estRate = Math.min(parseFloat(estRate), 10.0).toFixed(1);

      analysis.engagement = {
        avgEngagementRate: `${estRate}%`,
        bestPostingTimes: followers > 50000 ? ['8-10 AM', '7-9 PM'] : ['9-11 AM', '6-8 PM'],
        topPerformingContent: analysis.contentThemes?.slice(0, 3) || ['General content'],
        engagementLevel: followers > 50000 ? 'High' : followers > 10000 ? 'Medium' : 'Growing'
      };
    }

    // Combine all data
    const result = {
      profile: userData.profile,
      analysis,
      insights,
      tweetIdeas,
      tweetIQScore, // Add the calculated TweetIQ Score
      metadata: {
        tweetsAnalyzed: userData.tweets.length,
        analysisDate: new Date().toISOString(),
        username: cleanUsername,
        dataSource: "Twitter API (Real Data)",
        aiProvider: "Bankr LLM",
        model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
        openAIEnabled: true
      }
    };

    console.log(`✅ Analysis completed for @${cleanUsername} (TweetIQ Score: ${tweetIQScore}/100)`);
    res.json(result);

  } catch (error) {
    console.error('❌ Analysis error:', error);

    // Enhanced error handling for different scenarios
    let errorMessage = error.message;
    let statusCode = 500;

    if (error.message.includes('payment') || error.message.includes('credits')) {
      statusCode = 402;
      errorMessage = `TwitterAPI.io payment issue: ${error.message}`;
    } else if (error.message.includes('rate limit') || error.message.includes('429')) {
      statusCode = 429;
      errorMessage = `Rate limit exceeded: ${error.message}`;
    } else if (error.message.includes('not found') || error.message.includes('404')) {
      statusCode = 404;
      errorMessage = `User not found: ${error.message}`;
    } else if (error.message.includes('CORS') || error.message.includes('blocked')) {
      statusCode = 403;
      errorMessage = `Access blocked: ${error.message}`;
    }

    // Return proper error for API issues - NO FALLBACK TO DEMO MODE
    res.status(statusCode).json({
      error: 'API Error',
      message: errorMessage,
      details: {
        code: statusCode,
        suggestion: statusCode === 429 ? 'Rate limit exceeded. Please wait before trying again.' :
          statusCode === 402 ? 'Payment required. Check your TwitterAPI.io credits.' :
            'Please check the username and try again.'
      }
    });
  }
});

// Quick profile lookup (for profile picture and basic info)
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const cleanUsername = username.replace('@', '').trim();

    const profile = await twitterService.getUserProfile(cleanUsername);

    if (!profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('❌ Profile lookup error:', error);
    res.status(500).json({
      error: 'Profile lookup failed',
      message: error.message
    });
  }
});

// Regenerate tweet ideas endpoint
router.post('/regenerate-ideas', async (req, res) => {
  try {
    const { profile, analysis } = req.body;

    if (!profile || !analysis) {
      return res.status(400).json({ error: 'Profile and analysis data are required' });
    }

    console.log(`🎯 Regenerating tweet ideas for @${profile.username}`);

    // Generate new tweet ideas
    const tweetIdeas = await openaiService.generateTweetIdeas(profile, analysis);

    console.log(`✅ New tweet ideas generated for @${profile.username}`);
    res.json(tweetIdeas);

  } catch (error) {
    console.error('❌ Error regenerating ideas:', error);
    res.status(500).json({
      error: 'Failed to regenerate ideas',
      message: error.message
    });
  }
});

// New endpoint for regenerating tweet ideas (max 2 per day per user)
router.post('/regenerate-tweet-ideas', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Check regeneration limit
    const regenerationStatus = canRegenerateTweetIdeas(username);

    if (!regenerationStatus.allowed) {
      return res.status(429).json({
        error: 'Daily regeneration limit reached',
        remaining: regenerationStatus.remaining,
        resetTime: regenerationStatus.resetTime
      });
    }

    console.log(`🔄 Regenerating tweet ideas for @${username} (remaining: ${regenerationStatus.remaining})`);

    // Get user data
    const userData = await twitterService.getUserData(username);

    if (!userData) {
      return res.status(404).json({ error: 'User not found or account is private' });
    }

    const profile = userData.profile;

    // Calculate TweetIQ Score
    const followers = profile.metrics.followers_count || 0;
    const following = profile.metrics.following_count || 0;
    const tweets = profile.metrics.tweet_count || 0;
    const verified = profile.verified || false;

    let tweetIQScore = 0;

    if (followers > 100000) tweetIQScore += 40;
    else if (followers > 50000) tweetIQScore += 35;
    else if (followers > 10000) tweetIQScore += 30;
    else if (followers > 5000) tweetIQScore += 25;
    else if (followers > 1000) tweetIQScore += 20;
    else if (followers > 500) tweetIQScore += 15;
    else tweetIQScore += 10;

    if (tweets > 50000) tweetIQScore += 20;
    else if (tweets > 20000) tweetIQScore += 18;
    else if (tweets > 10000) tweetIQScore += 15;
    else if (tweets > 5000) tweetIQScore += 12;
    else if (tweets > 1000) tweetIQScore += 8;
    else tweetIQScore += 5;

    const followingRatio = following > 0 ? followers / following : followers;
    if (followingRatio > 10) tweetIQScore += 15;
    else if (followingRatio > 5) tweetIQScore += 12;
    else if (followingRatio > 2) tweetIQScore += 8;
    else if (followingRatio > 1) tweetIQScore += 5;
    else tweetIQScore += 2;

    if (verified) tweetIQScore += 15;

    if (followers > 0 && tweets > 0) {
      const engagementRatio = tweets / followers;
      if (engagementRatio > 0.5) tweetIQScore += 10;
      else if (engagementRatio > 0.3) tweetIQScore += 8;
      else if (engagementRatio > 0.1) tweetIQScore += 5;
      else tweetIQScore += 3;
    }

    tweetIQScore = Math.min(100, Math.round(tweetIQScore));

    // Generate new analysis and tweet ideas
    let analysis, tweetIdeas;

    try {
      analysis = await openaiService.analyzeTweets(userData.tweets, profile);
      tweetIdeas = await openaiService.generateTweetIdeas(profile, analysis);
    } catch (error) {
      console.log('⚠️ AI regeneration failed, using personalized fallback:', error.message);

      analysis = {
        contentDNA: {
          viralHook: tweetIQScore,
          humor: Math.min(80, Math.floor((followers / 2000) + 45)),
          opinion: Math.min(85, Math.floor((followers / 1500) + 50)),
          depth: Math.min(75, Math.floor((followers / 2500) + 40)),
          storytelling: Math.min(70, Math.floor((followers / 3000) + 35)),
          technical: Math.min(95, Math.floor((followers / 800) + 60)),
          personal: Math.min(65, Math.floor((followers / 4000) + 30))
        },
        contentMix: [
          { label: followers > 10000 ? "Industry insights" : "Tech updates", percentage: 40 },
          { label: "Personal stories", percentage: 35 },
          { label: followers > 10000 ? "Technical content" : "Quick tips", percentage: 25 }
        ]
      };

      tweetIdeas = {
        tweetIdeas: followers > 10000 ? [
          {
            type: "leadership",
            content: `The future of ${followers > 50000 ? "our industry" : "this space"} is changing rapidly. Here's my perspective on where we're headed and what it means for creators like us.`,
            score: 88,
            reasoning: "Your followers value your strategic insights",
            hashtags: ["future", "strategy", "leadership"],
            bestTime: "9-11 AM"
          },
          {
            type: "personal",
            content: `Reaching ${followers.toLocaleString()} followers taught me these 3 crucial lessons about ${followers > 50000 ? "building movements" : "creating impact"} that I wish I knew earlier.`,
            score: 92,
            reasoning: "Milestone content drives high engagement",
            hashtags: ["milestone", "lessons", "growth"],
            bestTime: "6-8 PM"
          },
          {
            type: "technical",
            content: `Just discovered a game-changing approach to ${followers > 50000 ? "scaling innovation" : "solving complex problems"} that I had to share with my community.`,
            score: 85,
            reasoning: "Technical insights establish your expertise",
            hashtags: ["innovation", "technical", "insights"],
            bestTime: "12-2 PM"
          },
          {
            type: "value",
            content: "Focus on the fundamentals. The shiny new tools will always wait, but strong core skills are forever.",
            score: 82,
            reasoning: "Actionable advice builds trust",
            hashtags: ["skills", "focus", "fundamentals"],
            bestTime: "4-6 PM"
          }
        ] : [
          {
            type: "journey",
            content: `Every expert was once a beginner. Here's what I'm learning on my journey to ${followers.toLocaleString()} followers and the challenges that shaped my perspective.`,
            score: 80,
            reasoning: "Authentic journey content resonates",
            hashtags: ["journey", "learning", "growth"],
            bestTime: "9-11 AM"
          },
          {
            type: "value",
            content: `Here's 3 practical tips that helped me grow from 0 to ${followers.toLocaleString()} followers and how you can apply them to your own journey.`,
            score: 85,
            reasoning: "Value-driven content performs well",
            hashtags: ["tips", "growth", "value"],
            bestTime: "6-8 PM"
          },
          {
            type: "engagement",
            content: "What's the biggest challenge you're facing right now in your creative journey? Let's discuss solutions and support each other in the comments.",
            score: 78,
            reasoning: "Engagement questions boost interaction",
            hashtags: ["community", "engagement", "discussion"],
            bestTime: "7-9 PM"
          },
          {
            type: "motivation",
            content: "It's not about being the best, it's about being better than you were yesterday.",
            score: 80,
            reasoning: "Motivational content resonates",
            hashtags: ["motivation", "consistency", "mindset"],
            bestTime: "8-10 AM"
          }
        ]
      };
    }

    res.json({
      tweetIdeas,
      analysis,
      remaining: regenerationStatus.remaining,
      message: regenerationStatus.remaining > 0 ?
        `Tweet ideas regenerated! You have ${regenerationStatus.remaining} regeneration left today.` :
        'Tweet ideas regenerated! Daily limit reached.'
    });

  } catch (error) {
    console.error('❌ Tweet idea regeneration error:', error);
    res.status(500).json({ error: 'Failed to regenerate tweet ideas' });
  }
});

module.exports = router;
