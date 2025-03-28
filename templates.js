export const personaTemplates = {
    business: {
        name: 'Business Professional',
        categories: ['Enterprise', 'B2B', 'Corporate'],
        templates: [
            {
                name: 'IT Decision Maker',
                defaults: {
                    industry: 'Technology',
                    ageRange: '35-50',
                    goals: [
                        'Improve infrastructure efficiency',
                        'Reduce operational costs',
                        'Enhance security measures'
                    ],
                    challenges: [
                        'Managing legacy systems',
                        'Budget constraints',
                        'Security compliance'
                    ],
                    role: 'IT Manager',
                    decisionMaking: 'Analytical and risk-aware'
                }
            },
            {
                name: 'Finance Executive',
                defaults: {
                    industry: 'Financial Services',
                    ageRange: '40-55',
                    goals: [
                        'Optimize investment returns',
                        'Reduce financial risks',
                        'Improve reporting accuracy'
                    ],
                    challenges: [
                        'Market volatility',
                        'Regulatory compliance',
                        'Data accuracy'
                    ],
                    role: 'CFO',
                    decisionMaking: 'Data-driven and compliance-focused'
                }
            }
        ]
    },
    consumer: {
        name: 'Consumer',
        categories: ['B2C', 'Retail', 'Services'],
        templates: [
            {
                name: 'Young Professional',
                defaults: {
                    industry: 'Digital Services',
                    ageRange: '25-35',
                    goals: [
                        'Save time on daily tasks',
                        'Stay organized',
                        'Professional growth'
                    ],
                    challenges: [
                        'Limited free time',
                        'Work-life balance',
                        'Information overload'
                    ],
                    role: 'Urban Professional',
                    decisionMaking: 'Fast-paced and value-driven'
                }
            },
            {
                name: 'Digital Native',
                defaults: {
                    industry: 'Mobile Apps',
                    ageRange: '18-24',
                    goals: [
                        'Connect with friends',
                        'Express creativity',
                        'Stay trendy'
                    ],
                    challenges: [
                        'Short attention span',
                        'Information filtering',
                        'Privacy concerns'
                    ],
                    role: 'Digital Consumer',
                    decisionMaking: 'Social proof and trend-based'
                }
            }
        ]
    }
};
