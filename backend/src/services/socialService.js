const axios = require('axios');
const { TwitterApi } = require('twitter-api-v2');

class SocialService {
  constructor() {
    // Store pending auth states
    this.authStates = new Map();
  }

  // Twitter Integration
  async getTwitterAuthUrl(userId) {
    try {
      const state = `twitter_${userId}_${Date.now()}`;
      this.authStates.set(state, { userId, platform: 'twitter', timestamp: Date.now() });
      
      const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${process.env.TWITTER_API_KEY}&redirect_uri=${encodeURIComponent(process.env.FRONTEND_URL + '/auth/twitter/callback')}&scope=tweet.read%20tweet.write%20users.read&state=${state}&code_challenge=challenge&code_challenge_method=plain`;
      
      return authUrl;
    } catch (error) {
      console.error('Twitter auth URL error:', error);
      throw error;
    }
  }

  async handleTwitterCallback(userId, code, state) {
    try {
      // Verify state
      const storedState = this.authStates.get(state);
      if (!storedState || storedState.userId !== userId || storedState.platform !== 'twitter') {
        return { success: false, error: 'Invalid state parameter' };
      }

      // Clean up state
      this.authStates.delete(state);

      // Exchange code for access token
      const tokenResponse = await axios.post('https://api.twitter.com/2/oauth2/token', {
        code,
        grant_type: 'authorization_code',
        client_id: process.env.TWITTER_API_KEY,
        redirect_uri: process.env.FRONTEND_URL + '/auth/twitter/callback',
        code_verifier: 'challenge'
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_API_KEY}:${process.env.TWITTER_API_SECRET}`).toString('base64')}`
        }
      });

      const { access_token, refresh_token } = tokenResponse.data;

      // Get user info
      const client = new TwitterApi(access_token);
      const userInfo = await client.v2.me();

      // Update user in database
      const User = require('../models/User');
      await User.findByIdAndUpdate(userId, {
        $set: {
          'socialAccounts.twitter.connected': true,
          'socialAccounts.twitter.accessToken': access_token,
          'socialAccounts.twitter.refreshToken': refresh_token,
          'socialAccounts.twitter.username': userInfo.data.username,
          'socialAccounts.twitter.userId': userInfo.data.id
        }
      });

      return { 
        success: true, 
        username: userInfo.data.username 
      };
    } catch (error) {
      console.error('Twitter callback error:', error);
      return { 
        success: false, 
        error: 'Failed to connect Twitter account' 
      };
    }
  }

  // LinkedIn Integration
  async getLinkedInAuthUrl(userId) {
    try {
      const state = `linkedin_${userId}_${Date.now()}`;
      this.authStates.set(state, { userId, platform: 'linkedin', timestamp: Date.now() });
      
      const scopes = 'r_liteprofile,r_emailaddress,w_member_social';
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.FRONTEND_URL + '/auth/linkedin/callback')}&state=${state}&scope=${encodeURIComponent(scopes)}`;
      
      return authUrl;
    } catch (error) {
      console.error('LinkedIn auth URL error:', error);
      throw error;
    }
  }

  async handleLinkedInCallback(userId, code, state) {
    try {
      // Verify state
      const storedState = this.authStates.get(state);
      if (!storedState || storedState.userId !== userId || storedState.platform !== 'linkedin') {
        return { success: false, error: 'Invalid state parameter' };
      }

      // Clean up state
      this.authStates.delete(state);

      // Exchange code for access token
      const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: process.env.FRONTEND_URL + '/auth/linkedin/callback'
      }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { access_token } = tokenResponse.data;

      // Get user profile
      const profileResponse = await axios.get('https://api.linkedin.com/v2/people/~', {
        headers: { 'Authorization': `Bearer ${access_token}` }
      });

      // Update user in database
      const User = require('../models/User');
      await User.findByIdAndUpdate(userId, {
        $set: {
          'socialAccounts.linkedin.connected': true,
          'socialAccounts.linkedin.accessToken': access_token,
          'socialAccounts.linkedin.profileId': profileResponse.data.id
        }
      });

      return { 
        success: true, 
        profileId: profileResponse.data.id 
      };
    } catch (error) {
      console.error('LinkedIn callback error:', error);
      return { 
        success: false, 
        error: 'Failed to connect LinkedIn account' 
      };
    }
  }

  // Instagram Integration (using Meta Graph API)
  async getInstagramAuthUrl(userId) {
    try {
      const state = `instagram_${userId}_${Date.now()}`;
      this.authStates.set(state, { userId, platform: 'instagram', timestamp: Date.now() });
      
      const scopes = 'instagram_basic,instagram_content_publish,pages_show_list';
      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(process.env.FRONTEND_URL + '/auth/instagram/callback')}&scope=${encodeURIComponent(scopes)}&response_type=code&state=${state}`;
      
      return authUrl;
    } catch (error) {
      console.error('Instagram auth URL error:', error);
      throw error;
    }
  }

  async handleInstagramCallback(userId, code, state) {
    try {
      // Verify state
      const storedState = this.authStates.get(state);
      if (!storedState || storedState.userId !== userId || storedState.platform !== 'instagram') {
        return { success: false, error: 'Invalid state parameter' };
      }

      // Clean up state
      this.authStates.delete(state);

      // Exchange code for access token
      const tokenResponse = await axios.post(`https://graph.facebook.com/v18.0/oauth/access_token`, {
        client_id: process.env.INSTAGRAM_APP_ID,
        client_secret: process.env.INSTAGRAM_APP_SECRET,
        redirect_uri: process.env.FRONTEND_URL + '/auth/instagram/callback',
        code
      });

      const { access_token } = tokenResponse.data;

      // Get user's Instagram business account
      const accountsResponse = await axios.get(`https://graph.facebook.com/v18.0/me/accounts?access_token=${access_token}`);
      const instagramAccount = accountsResponse.data.data.find(account => account.instagram_business_account);

      if (!instagramAccount) {
        return { success: false, error: 'No Instagram business account found' };
      }

      // Update user in database
      const User = require('../models/User');
      await User.findByIdAndUpdate(userId, {
        $set: {
          'socialAccounts.instagram.connected': true,
          'socialAccounts.instagram.accessToken': access_token,
          'socialAccounts.instagram.userId': instagramAccount.id,
          'socialAccounts.instagram.businessAccountId': instagramAccount.instagram_business_account.id
        }
      });

      return { 
        success: true, 
        userId: instagramAccount.instagram_business_account.id 
      };
    } catch (error) {
      console.error('Instagram callback error:', error);
      return { 
        success: false, 
        error: 'Failed to connect Instagram account' 
      };
    }
  }

  // Publishing Methods
  async publishPost(post, socialAccounts) {
    const results = {};

    try {
      // Publish to Twitter
      if (post.platforms.twitter.enabled && socialAccounts.twitter.connected) {
        try {
          const client = new TwitterApi(socialAccounts.twitter.accessToken);
          const tweetText = post.content.platforms?.twitter || post.content.text;
          const tweet = await client.v2.tweet(tweetText);
          
          results.twitter = {
            posted: true,
            postId: tweet.data.id,
            postedAt: new Date(),
            error: null
          };
        } catch (error) {
          results.twitter = {
            posted: false,
            postId: null,
            postedAt: null,
            error: error.message
          };
        }
      }

      // Publish to LinkedIn
      if (post.platforms.linkedin.enabled && socialAccounts.linkedin.connected) {
        try {
          const postText = post.content.platforms?.linkedin || post.content.text;
          const linkedinPost = await axios.post('https://api.linkedin.com/v2/ugcPosts', {
            author: `urn:li:person:${socialAccounts.linkedin.profileId}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                  text: postText
                },
                shareMediaCategory: 'NONE'
              }
            },
            visibility: {
              'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
          }, {
            headers: {
              'Authorization': `Bearer ${socialAccounts.linkedin.accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          results.linkedin = {
            posted: true,
            postId: linkedinPost.data.id,
            postedAt: new Date(),
            error: null
          };
        } catch (error) {
          results.linkedin = {
            posted: false,
            postId: null,
            postedAt: null,
            error: error.message
          };
        }
      }

      // Publish to Instagram
      if (post.platforms.instagram.enabled && socialAccounts.instagram.connected) {
        try {
          const postText = post.content.platforms?.instagram || post.content.text;
          
          // For text-only posts (Instagram requires media, so this would need to be adapted)
          // This is a simplified version - Instagram typically requires images
          const instagramPost = await axios.post(`https://graph.facebook.com/v18.0/${socialAccounts.instagram.businessAccountId}/media`, {
            caption: postText,
            access_token: socialAccounts.instagram.accessToken
          });

          if (instagramPost.data.id) {
            await axios.post(`https://graph.facebook.com/v18.0/${socialAccounts.instagram.businessAccountId}/media_publish`, {
              creation_id: instagramPost.data.id,
              access_token: socialAccounts.instagram.accessToken
            });

            results.instagram = {
              posted: true,
              postId: instagramPost.data.id,
              postedAt: new Date(),
              error: null
            };
          }
        } catch (error) {
          results.instagram = {
            posted: false,
            postId: null,
            postedAt: null,
            error: error.message
          };
        }
      }

      return results;
    } catch (error) {
      console.error('Publish post error:', error);
      throw error;
    }
  }

  async testPost(platform, message, accountInfo) {
    try {
      switch (platform) {
        case 'twitter':
          const client = new TwitterApi(accountInfo.accessToken);
          const tweet = await client.v2.tweet(message + ' (Test post)');
          return { success: true, postId: tweet.data.id };

        case 'linkedin':
          const linkedinPost = await axios.post('https://api.linkedin.com/v2/ugcPosts', {
            author: `urn:li:person:${accountInfo.profileId}`,
            lifecycleState: 'PUBLISHED',
            specificContent: {
              'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                  text: message + ' (Test post)'
                },
                shareMediaCategory: 'NONE'
              }
            },
            visibility: {
              'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
            }
          }, {
            headers: {
              'Authorization': `Bearer ${accountInfo.accessToken}`,
              'Content-Type': 'application/json'
            }
          });
          return { success: true, postId: linkedinPost.data.id };

        case 'instagram':
          // Instagram test post would require media
          return { success: false, error: 'Instagram requires media for posts' };

        default:
          return { success: false, error: 'Unsupported platform' };
      }
    } catch (error) {
      console.error('Test post error:', error);
      return { success: false, error: error.message };
    }
  }

  // Clean up expired auth states (run periodically)
  cleanupExpiredStates() {
    const now = Date.now();
    const expireTime = 10 * 60 * 1000; // 10 minutes

    for (const [state, data] of this.authStates.entries()) {
      if (now - data.timestamp > expireTime) {
        this.authStates.delete(state);
      }
    }
  }
}

module.exports = new SocialService();