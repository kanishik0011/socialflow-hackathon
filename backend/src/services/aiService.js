const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  generateGreeting(userName, businessInfo) {
    const businessName = businessInfo?.businessName || 'your business';
    return `Hi ${userName}! 👋 I'm your AI content assistant. I'm here to help you create engaging social media content for ${businessName}. 

Let's start by learning more about your business and content goals. What would you like to create content about today?`;
  }

  async generateResponse(message, context, chatHistory) {
    try {
      const systemPrompt = this.createSystemPrompt(context);
      const messages = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.slice(-10).map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      });

      const response = completion.choices[0].message.content;

      // Check if user is requesting content generation
      const isContentRequest = this.isContentGenerationRequest(message);
      let contentGenerated = null;

      if (isContentRequest) {
        contentGenerated = await this.generateContent({
          prompt: message,
          type: 'text',
          platforms: ['twitter', 'linkedin', 'instagram'],
          businessInfo: context.businessInfo,
          contentPreferences: context.contentPreferences
        });
      }

      return {
        message: response,
        suggestions: this.generateSuggestions(message, context),
        contentGenerated
      };
    } catch (error) {
      console.error('AI response generation error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async generateContent({ prompt, type, platforms, businessInfo, contentPreferences }) {
    try {
      const systemPrompt = `You are a professional social media content creator. Generate engaging, authentic content that doesn't sound AI-generated.

Business Context:
- Business: ${businessInfo?.businessName || 'N/A'}
- Industry: ${businessInfo?.industry || 'N/A'}
- Target Audience: ${businessInfo?.targetAudience || 'N/A'}
- Brand Voice: ${businessInfo?.brandVoice || 'Professional and friendly'}

Content Preferences:
- Tone: ${contentPreferences?.tone || 'Professional'}
- Topics: ${contentPreferences?.topics?.join(', ') || 'General business'}

Generate content for these platforms: ${platforms.join(', ')}

Requirements:
1. Make content feel natural and human-written
2. Include relevant hashtags
3. Optimize for each platform's format
4. Keep it engaging and valuable
5. Match the brand voice and tone`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create ${type} content about: ${prompt}` }
        ],
        max_tokens: 800,
        temperature: 0.8
      });

      const content = completion.choices[0].message.content;
      
      return {
        type,
        platforms,
        content: this.formatContentForPlatforms(content, platforms),
        originalPrompt: prompt,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Content generation error:', error);
      throw new Error('Failed to generate content');
    }
  }

  createSystemPrompt(context) {
    const businessInfo = context.businessInfo || {};
    const contentPrefs = context.contentPreferences || {};

    return `You are an expert social media content strategist and creative assistant. Your role is to help users create engaging, authentic social media content.

Context about the user's business:
- Business Name: ${businessInfo.businessName || 'Not specified'}
- Industry: ${businessInfo.industry || 'Not specified'}
- Target Audience: ${businessInfo.targetAudience || 'Not specified'}
- Brand Voice: ${businessInfo.brandVoice || 'Professional and friendly'}
- Business Description: ${businessInfo.description || 'Not provided'}

Content Preferences:
- Preferred Topics: ${contentPrefs.topics?.join(', ') || 'General business content'}
- Tone: ${contentPrefs.tone || 'Professional'}
- Post Frequency: ${contentPrefs.postFrequency || 'Regular'}

Guidelines:
1. Always ask clarifying questions to better understand their needs
2. Suggest content ideas based on their business and audience
3. Help them plan content calendars
4. Provide platform-specific advice (Twitter, LinkedIn, Instagram)
5. Ensure content feels authentic and human, not AI-generated
6. Focus on value-driven content that serves their audience
7. Be conversational and supportive

Keep responses helpful, concise, and actionable.`;
  }

  formatContentForPlatforms(content, platforms) {
    const formatted = {};

    platforms.forEach(platform => {
      switch (platform) {
        case 'twitter':
          formatted.twitter = this.formatForTwitter(content);
          break;
        case 'linkedin':
          formatted.linkedin = this.formatForLinkedIn(content);
          break;
        case 'instagram':
          formatted.instagram = this.formatForInstagram(content);
          break;
      }
    });

    return formatted;
  }

  formatForTwitter(content) {
    // Twitter has 280 character limit
    const lines = content.split('\n').filter(line => line.trim());
    let twitterContent = lines[0];
    
    if (twitterContent.length > 250) {
      twitterContent = twitterContent.substring(0, 250) + '...';
    }

    // Extract hashtags
    const hashtags = content.match(/#\w+/g) || [];
    if (hashtags.length > 0 && twitterContent.length + hashtags.join(' ').length < 280) {
      twitterContent += '\n\n' + hashtags.slice(0, 3).join(' ');
    }

    return twitterContent;
  }

  formatForLinkedIn(content) {
    // LinkedIn allows longer posts, so we can use more of the content
    let linkedinContent = content;
    
    // Add professional formatting
    if (!linkedinContent.includes('\n\n')) {
      const sentences = linkedinContent.split('. ');
      if (sentences.length > 2) {
        linkedinContent = sentences.slice(0, 2).join('. ') + '.\n\n' + sentences.slice(2).join('. ');
      }
    }

    return linkedinContent;
  }

  formatForInstagram(content) {
    // Instagram allows up to 2200 characters and loves hashtags
    let instagramContent = content;
    
    // Extract and enhance hashtags for Instagram
    const hashtags = content.match(/#\w+/g) || [];
    if (hashtags.length < 5) {
      // Add some generic relevant hashtags
      const additionalHashtags = ['#business', '#entrepreneur', '#success', '#motivation', '#growth'];
      hashtags.push(...additionalHashtags.slice(0, 5 - hashtags.length));
    }

    if (hashtags.length > 0) {
      instagramContent += '\n\n' + hashtags.slice(0, 10).join(' ');
    }

    return instagramContent;
  }

  isContentGenerationRequest(message) {
    const contentKeywords = [
      'create', 'generate', 'write', 'post', 'content',
      'caption', 'tweet', 'linkedin post', 'instagram',
      'social media', 'help me with', 'draft'
    ];
    
    const lowerMessage = message.toLowerCase();
    return contentKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  generateSuggestions(message, context) {
    const suggestions = [
      "Create a motivational post for Monday",
      "Generate industry insights post",
      "Write about your latest project",
      "Share a business tip",
      "Create content about your team"
    ];

    // Customize suggestions based on context
    if (context.businessInfo?.industry) {
      suggestions.unshift(`Create content about ${context.businessInfo.industry} trends`);
    }

    return suggestions.slice(0, 3);
  }
}

module.exports = new AIService();