const axios = require('axios');

class TwitterService {
  constructor() {
    this.baseURL = 'https://api.twitterapi.io/twitter';
    this.apiKey = process.env.TWITTER_API_KEY;
    
    if (!this.apiKey) {
      throw new Error('TWITTER_API_KEY is required');
    }
  }

  async getUserProfile(username) {
    try {
      console.log(`📱 Fetching profile for @${username}`);
      
      const response = await axios.get(`${this.baseURL}/user/info`, {
        headers: {
          'X-API-Key': this.apiKey
        },
        params: {
          userName: username
        }
      });

      if (response.data.status !== 'success' || !response.data.data) {
        return null;
      }

      const userData = response.data.data;
      
      const profileData = {
        id: userData.id,
        username: userData.userName,
        name: userData.name,
        description: userData.description || '',
        profileImageUrl: userData.profilePicture || `https://unavatar.io/${userData.userName}.png`,
        profileImageUrl400: userData.profilePicture?.replace('_normal', '_400x400') || `https://unavatar.io/${userData.userName}.png`,
        metrics: {
          followers_count: userData.followers || 0,
          following_count: userData.following || 0,
          tweet_count: userData.statusesCount || 0,
          listed_count: 0,
          like_count: userData.favouritesCount || 0
        },
        verified: userData.isBlueVerified || false,
        createdAt: userData.createdAt || new Date().toISOString(),
        location: userData.location || '',
        url: userData.url || '',
        protected: false,
        possibly_sensitive: userData.possiblySensitive || false
      };

      console.log(`✅ Profile fetched for @${username}`);
      return profileData;

    } catch (error) {
      console.error(`❌ Error fetching profile for @${username}:`, error.message);
      
      if (error.response?.status === 404) {
        throw new Error('User not found');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid API credentials');
      } else if (error.response?.status === 402) {
        throw new Error('TwitterAPI.io requires payment or credits. Please check your account balance.');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded');
      }
      
      throw new Error('Failed to fetch user profile');
    }
  }

  async getUserTweets(userId, maxTweets = 5) {
    try {
      console.log(`📝 Fetching only ${maxTweets} tweets for user ID: ${userId}`);
      
      // No delay - get tweets quickly
      const response = await axios.get(`${this.baseURL}/user/tweet_timeline`, {
        headers: {
          'X-API-Key': this.apiKey
        },
        params: {
          userId: userId,
          includeReplies: false, // Exclude replies
          count: maxTweets // Only get 5 tweets
        }
      });

      if (response.data.status !== 'success') {
        console.log(`⚠️ Timeline API returned status: ${response.data.status}`);
        return [];
      }

      const tweets = response.data.data?.tweets || response.data.tweets || [];
      console.log(`✅ Fetched ${tweets.length} tweets quickly`);
      return tweets;

    } catch (error) {
      console.error(`❌ Error fetching tweets for user ${userId}:`, error.message);
      
      // If tweets fail, return empty array - we can still analyze profile
      console.log('🔄 Using profile analysis only (no tweets)');
      return [];
    }
  }

  async getUserData(username) {
    try {
      console.log(`🔍 Fetching user data for @${username}`);
      
      // Fetch profile first
      const profile = await this.getUserProfile(username);
      
      if (!profile) {
        throw new Error('User not found');
      }

      // Then fetch tweets (may fail due to rate limits)
      const tweets = await this.getUserTweets(profile.id);

      console.log(`✅ Successfully fetched user data for @${username}`);
      return {
        profile,
        tweets
      };

    } catch (error) {
      console.error(`❌ Error fetching user data for @${username}:`, error.message);
      throw error;
    }
  }
}

module.exports = new TwitterService();
