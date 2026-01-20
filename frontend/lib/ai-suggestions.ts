// Simple AI suggestion utility for civic issues
// In production, this would connect to actual AI services

export interface AIAnalysis {
  suggestedType: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  estimatedResolutionTime: string;
}

export const aiSuggestions = {
  // Analyze image and location to suggest issue type
  analyzeIssue(
    imageBase64?: string, 
    location?: { lat: number; lng: number },
    userSelectedType?: string
  ): AIAnalysis {
    // Simple rule-based AI simulation
    // In production, this would use computer vision and ML models
    
    if (userSelectedType) {
      return this.getAnalysisForType(userSelectedType, location);
    }

    // Mock image analysis
    if (imageBase64) {
      // Simulate AI image recognition
      const mockAnalysis = this.mockImageAnalysis(imageBase64);
      return mockAnalysis;
    }

    // Default analysis
    return {
      suggestedType: 'general',
      confidence: 0.5,
      priority: 'medium',
      description: 'सामान्य नागरिक समस्या / General civic issue detected',
      estimatedResolutionTime: '2-3 दिन / 2-3 days'
    };
  },

  // Get detailed analysis for specific issue type
  getAnalysisForType(issueType: string, location?: { lat: number; lng: number }): AIAnalysis {
    const analyses: Record<string, AIAnalysis> = {
      pothole: {
        suggestedType: 'pothole',
        confidence: 0.9,
        priority: 'high',
        description: 'सड़क में गड्डा - तत्काल मरम्मत आवश्यक / Road pothole - immediate repair needed',
        estimatedResolutionTime: '1-2 दिन / 1-2 days'
      },
      garbage: {
        suggestedType: 'garbage',
        confidence: 0.85,
        priority: 'medium',
        description: 'कचरा संग्रह आवश्यक - स्वच्छता टीम को सूचित करें / Garbage collection needed - notify sanitation team',
        estimatedResolutionTime: '1 दिन / 1 day'
      },
      drainage: {
        suggestedType: 'drainage',
        confidence: 0.8,
        priority: 'high',
        description: 'नाली की समस्या - जल निकासी विभाग को सूचित करें / Drainage issue - notify water department',
        estimatedResolutionTime: '2-4 दिन / 2-4 days'
      },
      streetlight: {
        suggestedType: 'streetlight',
        confidence: 0.75,
        priority: 'medium',
        description: 'स्ट्रीट लाइट की समस्या - इलेक्ट्रिकल टीम को सूचित करें / Street light issue - notify electrical team',
        estimatedResolutionTime: '1-2 दिन / 1-2 days'
      },
      road: {
        suggestedType: 'road',
        confidence: 0.8,
        priority: 'high',
        description: 'सड़क क्षति - PWD को सूचित करें / Road damage - notify PWD',
        estimatedResolutionTime: '3-7 दिन / 3-7 days'
      },
      water: {
        suggestedType: 'water',
        confidence: 0.85,
        priority: 'critical',
        description: 'पानी की समस्या - जल विभाग को तत्काल सूचित करें / Water issue - notify water department immediately',
        estimatedResolutionTime: '4-6 घंटे / 4-6 hours'
      }
    };

    return analyses[issueType] || analyses.pothole;
  },

  // Mock image analysis (simulates computer vision)
  mockImageAnalysis(imageBase64: string): AIAnalysis {
    // Simple mock based on image size/characteristics
    const imageSize = imageBase64.length;
    
    if (imageSize > 100000) {
      // Large image might be road/infrastructure
      return this.getAnalysisForType('road');
    } else if (imageSize > 50000) {
      // Medium image might be pothole
      return this.getAnalysisForType('pothole');
    } else {
      // Small image might be garbage
      return this.getAnalysisForType('garbage');
    }
  },

  // Get ward-specific recommendations
  getWardRecommendations(wardName: string): string[] {
    const recommendations: Record<string, string[]> = {
      'Ward 1 - Alkapuri': [
        'इस क्षेत्र में अक्सर जल भराव की समस्या होती है / This area often faces waterlogging',
        'मुख्य सड़कों पर ध्यान दें / Focus on main roads',
        'पार्क क्षेत्रों की जांच करें / Check park areas'
      ],
      'Ward 2 - Fatehgunj': [
        'व्यावसायिक क्षेत्र - कचरा संग्रह पर ध्यान दें / Commercial area - focus on garbage collection',
        'ट्रैफिक जाम के कारण सड़क क्षति / Road damage due to traffic congestion',
        'स्ट्रीट लाइट्स की नियमित जांच / Regular street light checks'
      ],
      default: [
        'सामान्य निरीक्षण करें / Conduct general inspection',
        'नागरिकों से फीडबैक लें / Take citizen feedback',
        'फोटो प्रमाण जरूर लें / Always take photo evidence'
      ]
    };

    return recommendations[wardName] || recommendations.default;
  },

  // Priority color coding for UI
  getPriorityColor(priority: string): string {
    const colors = {
      low: 'text-green-400 bg-green-500/20',
      medium: 'text-yellow-400 bg-yellow-500/20',
      high: 'text-orange-400 bg-orange-500/20',
      critical: 'text-red-400 bg-red-500/20'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  }
};