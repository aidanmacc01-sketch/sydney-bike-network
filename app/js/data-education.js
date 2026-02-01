/**
 * MICRO2MOVE SYDNEY - Education & Rewards Data
 *
 * Gamified learning system for cycling knowledge
 * Points can be redeemed for e-bike discounts
 *
 * Last updated: February 2026
 */

// ============================================
// POINTS CONFIGURATION
// ============================================
const POINTS_CONFIG = {
  quiz_correct: 10,
  quiz_perfect: 50,      // Bonus for 100% on a quiz
  module_complete: 100,
  community_ride: 150,
  first_ride: 200,
  streak_bonus: 25,      // Per day streak
  referral: 500
};

// ============================================
// USER PROGRESS (would be stored in localStorage/backend)
// ============================================
let USER_PROGRESS = {
  total_points: 850,
  level: 3,
  completed_modules: ['mod_road_rules', 'mod_hand_signals'],
  completed_quizzes: ['quiz_road_rules'],
  community_rides_attended: 2,
  current_streak: 5,
  badges: ['first_ride', 'quiz_master', 'early_bird'],
  redeemed_rewards: []
};

// ============================================
// EDUCATION MODULES
// ============================================
const EDUCATION_MODULES = [
  {
    id: 'mod_road_rules',
    title: 'Sydney Road Rules for Cyclists',
    description: 'Essential NSW road rules every cyclist must know',
    icon: '📜',
    duration_mins: 8,
    points: 100,
    difficulty: 'beginner',
    sections: [
      {
        title: 'Where Can You Ride?',
        content: `In NSW, cyclists can ride on roads, bike paths, and shared paths. You can ride on footpaths if you're supervising a child under 12, or if you have a medical exemption.`
      },
      {
        title: 'Helmet Laws',
        content: `All cyclists in NSW must wear an approved helmet. Fines apply for not wearing one - currently $349. Make sure your helmet meets AS/NZS 2063 standards.`
      },
      {
        title: 'Lights at Night',
        content: `When riding at night or in hazardous conditions, you must have a white front light visible for 200m and a red rear light visible for 200m. A red rear reflector is also required.`
      },
      {
        title: 'Riding Two Abreast',
        content: `Two cyclists can ride side-by-side, but must stay within 1.5m of each other. More than two cyclists cannot ride beside each other.`
      }
    ],
    quiz_id: 'quiz_road_rules'
  },
  {
    id: 'mod_hand_signals',
    title: 'Hand Signals & Communication',
    description: 'How to communicate safely with drivers and other cyclists',
    icon: '👋',
    duration_mins: 5,
    points: 100,
    difficulty: 'beginner',
    sections: [
      {
        title: 'Left Turn Signal',
        content: `Extend your left arm straight out to the side. Hold for a few seconds before turning to give drivers time to react.`
      },
      {
        title: 'Right Turn Signal',
        content: `Extend your right arm straight out to the side, OR bend your left arm upward at a 90-degree angle.`
      },
      {
        title: 'Stopping Signal',
        content: `Extend your left arm downward with palm facing backward. This alerts cyclists and drivers behind you.`
      },
      {
        title: 'Verbal Warnings',
        content: `Use "passing left/right" when overtaking cyclists. "Slowing" or "stopping" warns riders behind you. A bell is required by law!`
      }
    ],
    quiz_id: 'quiz_hand_signals'
  },
  {
    id: 'mod_ebike_basics',
    title: 'E-Bike Essentials',
    description: 'Understanding e-bike classes, charging, and maintenance',
    icon: '⚡',
    duration_mins: 10,
    points: 150,
    difficulty: 'intermediate',
    sections: [
      {
        title: 'E-Bike Classes in Australia',
        content: `Pedelecs (pedal-assist up to 25km/h, max 250W) are legal on roads and bike paths without registration. Speed pedelecs and throttle bikes may require registration.`
      },
      {
        title: 'Battery Care',
        content: `Store batteries at room temperature. Avoid full discharge - charge when 20-30% remaining. Don't leave charging overnight unattended. Most batteries last 500-1000 charge cycles.`
      },
      {
        title: 'Range Factors',
        content: `Range varies by terrain, rider weight, assist level, and temperature. A 500Wh battery typically provides 40-100km range depending on conditions.`
      },
      {
        title: 'Maintenance Tips',
        content: `Check tire pressure weekly. Clean the chain regularly. Have the motor and battery checked annually. Keep electrical connections dry.`
      }
    ],
    quiz_id: 'quiz_ebike_basics'
  },
  {
    id: 'mod_safe_commuting',
    title: 'Safe Commuting in Sydney',
    description: 'Tips for navigating Sydney streets safely',
    icon: '🏙️',
    duration_mins: 12,
    points: 150,
    difficulty: 'intermediate',
    sections: [
      {
        title: 'Planning Your Route',
        content: `Use cycleways wherever possible. Apps like this one show you the safest routes. Avoid peak-hour traffic on roads without bike lanes.`
      },
      {
        title: 'Intersection Safety',
        content: `Make eye contact with drivers. Position yourself visibly - don't hide in blind spots. Use bike boxes where available.`
      },
      {
        title: 'Door Zone Awareness',
        content: `Stay at least 1m from parked cars to avoid being "doored". This is one of the most common urban cycling accidents.`
      },
      {
        title: 'Wet Weather Riding',
        content: `Brake earlier as stopping distance increases. Watch for slippery surfaces: metal grates, painted lines, wet leaves. Use mudguards and lights.`
      }
    ],
    quiz_id: 'quiz_safe_commuting'
  },
  {
    id: 'mod_bike_security',
    title: 'Bike Security & Theft Prevention',
    description: 'Protect your bike from theft in the city',
    icon: '🔒',
    duration_mins: 6,
    points: 100,
    difficulty: 'beginner',
    sections: [
      {
        title: 'Lock Types',
        content: `U-locks offer the best security. Cable locks are lightweight but easier to cut. Use two different lock types together for maximum security.`
      },
      {
        title: 'Locking Technique',
        content: `Lock through the frame AND rear wheel to a solid object. The front wheel can be removed easily, so secure it too or take it with you.`
      },
      {
        title: 'Registration',
        content: `Register your bike with NSW Police (free) and keep photos of it. Record the serial number (usually under the bottom bracket).`
      },
      {
        title: 'Smart Locks & GPS',
        content: `Consider GPS trackers hidden in your bike. Smart locks can alert you if tampered with. E-bikes should have battery locks engaged.`
      }
    ],
    quiz_id: 'quiz_bike_security'
  }
];

// ============================================
// QUIZZES
// ============================================
const EDUCATION_QUIZZES = [
  {
    id: 'quiz_road_rules',
    module_id: 'mod_road_rules',
    title: 'Road Rules Quiz',
    points_per_question: 10,
    perfect_bonus: 50,
    questions: [
      {
        question: 'What is the fine for not wearing a helmet in NSW?',
        options: ['$150', '$249', '$349', '$449'],
        correct: 2,
        explanation: 'The fine is $349 as of 2024. Always wear an approved helmet!'
      },
      {
        question: 'How far must your front light be visible at night?',
        options: ['50 metres', '100 metres', '200 metres', '500 metres'],
        correct: 2,
        explanation: 'Both front (white) and rear (red) lights must be visible for 200 metres.'
      },
      {
        question: 'Can you ride on the footpath in NSW?',
        options: [
          'Never',
          'Always',
          'Only if supervising a child under 12 or with medical exemption',
          'Only at night'
        ],
        correct: 2,
        explanation: 'Adults can only ride on footpaths when supervising children under 12 or with a medical exemption.'
      },
      {
        question: 'How close can two cyclists ride side-by-side?',
        options: ['50cm', '1 metre', '1.5 metres', '2 metres'],
        correct: 2,
        explanation: 'Two cyclists must stay within 1.5m of each other when riding abreast.'
      },
      {
        question: 'What colour must your rear light be?',
        options: ['White', 'Yellow', 'Red', 'Any colour'],
        correct: 2,
        explanation: 'Rear lights must be red, front lights must be white.'
      }
    ]
  },
  {
    id: 'quiz_hand_signals',
    module_id: 'mod_hand_signals',
    title: 'Hand Signals Quiz',
    points_per_question: 10,
    perfect_bonus: 50,
    questions: [
      {
        question: 'How do you signal a left turn?',
        options: [
          'Right arm extended',
          'Left arm extended straight out',
          'Left arm bent upward',
          'Wave your hand'
        ],
        correct: 1,
        explanation: 'Extend your left arm straight out to signal a left turn.'
      },
      {
        question: 'What does a left arm pointing down with palm back mean?',
        options: ['Left turn', 'Right turn', 'Stopping', 'Hazard ahead'],
        correct: 2,
        explanation: 'This signals that you are stopping or slowing down.'
      },
      {
        question: 'Is a bell legally required on your bike in NSW?',
        options: ['No', 'Only for children', 'Yes', 'Only on shared paths'],
        correct: 2,
        explanation: 'Yes! A bell or horn is legally required on all bikes in NSW.'
      },
      {
        question: 'What should you call out when passing another cyclist?',
        options: [
          'Nothing, just pass',
          '"Passing left" or "Passing right"',
          'Ring bell only',
          'Honk horn'
        ],
        correct: 1,
        explanation: 'Call out which side you\'re passing on to avoid collisions.'
      }
    ]
  },
  {
    id: 'quiz_ebike_basics',
    module_id: 'mod_ebike_basics',
    title: 'E-Bike Essentials Quiz',
    points_per_question: 10,
    perfect_bonus: 50,
    questions: [
      {
        question: 'What is the maximum speed for a legal pedelec in Australia?',
        options: ['15 km/h', '20 km/h', '25 km/h', '32 km/h'],
        correct: 2,
        explanation: 'Pedelecs must cut motor assist at 25 km/h to be road-legal without registration.'
      },
      {
        question: 'What is the maximum motor power for a legal pedelec?',
        options: ['100W', '250W', '500W', '750W'],
        correct: 1,
        explanation: '250W is the maximum for unrestricted use on roads and bike paths.'
      },
      {
        question: 'When should you charge your e-bike battery?',
        options: [
          'When completely empty',
          'When 20-30% remaining',
          'Only when full',
          'Once a month'
        ],
        correct: 1,
        explanation: 'Charging at 20-30% extends battery lifespan. Avoid full discharge.'
      },
      {
        question: 'How many charge cycles does a typical e-bike battery last?',
        options: ['100-200', '500-1000', '2000-3000', 'Unlimited'],
        correct: 1,
        explanation: 'Most quality batteries last 500-1000 full charge cycles.'
      },
      {
        question: 'What affects e-bike range the MOST?',
        options: ['Bike colour', 'Assist level and terrain', 'Time of day', 'Helmet type'],
        correct: 1,
        explanation: 'Higher assist levels and hills drain the battery faster.'
      }
    ]
  },
  {
    id: 'quiz_safe_commuting',
    module_id: 'mod_safe_commuting',
    title: 'Safe Commuting Quiz',
    points_per_question: 10,
    perfect_bonus: 50,
    questions: [
      {
        question: 'How far should you stay from parked cars to avoid being doored?',
        options: ['30cm', '50cm', '1 metre', '2 metres'],
        correct: 2,
        explanation: 'Stay at least 1m from parked cars - dooring is a very common accident.'
      },
      {
        question: 'What is a "bike box" at an intersection?',
        options: [
          'A storage container',
          'A marked area where cyclists wait ahead of cars',
          'A bike repair station',
          'A parking spot'
        ],
        correct: 1,
        explanation: 'Bike boxes let cyclists position themselves visibly ahead of traffic.'
      },
      {
        question: 'What surfaces become slippery when wet?',
        options: [
          'Only painted lines',
          'Only metal grates',
          'Painted lines, metal grates, wet leaves',
          'Nothing - modern surfaces are safe'
        ],
        correct: 2,
        explanation: 'All of these become hazardous when wet. Brake early and ride cautiously.'
      },
      {
        question: 'Why should you make eye contact with drivers?',
        options: [
          'To be friendly',
          'To confirm they\'ve seen you',
          'It\'s the law',
          'To challenge them'
        ],
        correct: 1,
        explanation: 'Eye contact confirms the driver has seen you before you proceed.'
      }
    ]
  },
  {
    id: 'quiz_bike_security',
    module_id: 'mod_bike_security',
    title: 'Bike Security Quiz',
    points_per_question: 10,
    perfect_bonus: 50,
    questions: [
      {
        question: 'Which lock type offers the BEST security?',
        options: ['Cable lock', 'Chain lock', 'U-lock', 'Combination lock'],
        correct: 2,
        explanation: 'U-locks are hardest to cut. Use with a cable for the front wheel.'
      },
      {
        question: 'What should you lock through?',
        options: [
          'Front wheel only',
          'Rear wheel only',
          'Frame and rear wheel',
          'Seat post'
        ],
        correct: 2,
        explanation: 'Lock through frame AND rear wheel - these are hardest to replace.'
      },
      {
        question: 'Where is your bike\'s serial number usually located?',
        options: [
          'On the handlebars',
          'Under the seat',
          'Under the bottom bracket',
          'On the pedals'
        ],
        correct: 2,
        explanation: 'Check under the bottom bracket (where the pedals attach) for the serial number.'
      },
      {
        question: 'Is bike registration with NSW Police free?',
        options: ['No, it costs $50', 'No, it costs $100', 'Yes, it\'s free', 'Registration doesn\'t exist'],
        correct: 2,
        explanation: 'Register for free at your local police station or online.'
      }
    ]
  }
];

// ============================================
// REWARDS & DISCOUNTS
// ============================================
const REWARDS = [
  {
    id: 'reward_helmet_10',
    name: '10% Off Helmets',
    description: 'Valid at 99 Bikes and Reid Cycles',
    points_cost: 200,
    icon: '🪖',
    category: 'gear',
    partner: '99 Bikes',
    valid_until: '2026-06-30',
    terms: 'One use per customer. Cannot combine with other offers.'
  },
  {
    id: 'reward_accessories_15',
    name: '15% Off Accessories',
    description: 'Lights, locks, bags & more',
    points_cost: 300,
    icon: '🎒',
    category: 'gear',
    partner: 'Reid Cycles',
    valid_until: '2026-06-30',
    terms: 'Excludes sale items. One use per customer.'
  },
  {
    id: 'reward_service_20',
    name: '$20 Off Bike Service',
    description: 'Any service over $80',
    points_cost: 400,
    icon: '🔧',
    category: 'service',
    partner: 'Electric Bikes Sydney',
    valid_until: '2026-12-31',
    terms: 'Valid for services $80+. Book in advance.'
  },
  {
    id: 'reward_coffee_free',
    name: 'Free Coffee',
    description: 'At partner cafes when you ride in',
    points_cost: 150,
    icon: '☕',
    category: 'lifestyle',
    partner: 'Single O / Campos',
    valid_until: '2026-12-31',
    terms: 'Show app and bike. One per day.'
  },
  {
    id: 'reward_ebike_100',
    name: '$100 Off E-Bike Purchase',
    description: 'On any e-bike over $2000',
    points_cost: 1500,
    icon: '⚡',
    category: 'ebike',
    partner: '99 Bikes / Lekker',
    valid_until: '2026-12-31',
    terms: 'E-bikes $2000+. Cannot combine with finance offers.',
    featured: true
  },
  {
    id: 'reward_ebike_250',
    name: '$250 Off E-Bike Purchase',
    description: 'On any e-bike over $3500',
    points_cost: 3000,
    icon: '🚴‍♂️',
    category: 'ebike',
    partner: 'Lekker / Omafiets',
    valid_until: '2026-12-31',
    terms: 'E-bikes $3500+. Cannot combine with other offers.',
    featured: true
  },
  {
    id: 'reward_ebike_500',
    name: '$500 Off Premium E-Bike',
    description: 'On e-bikes over $5000',
    points_cost: 5000,
    icon: '🏆',
    category: 'ebike',
    partner: 'Electric Bikes Sydney',
    valid_until: '2026-12-31',
    terms: 'Premium e-bikes only. Subject to availability.',
    featured: true
  },
  {
    id: 'reward_ride_free',
    name: 'Free Community Ride Entry',
    description: 'Join any premium group ride',
    points_cost: 250,
    icon: '👥',
    category: 'experience',
    partner: 'Sydney Cycling Community',
    valid_until: '2026-12-31',
    terms: 'One free entry to premium guided rides.'
  }
];

// ============================================
// BADGES
// ============================================
const BADGES = [
  {
    id: 'first_ride',
    name: 'First Ride',
    description: 'Complete your first tracked ride',
    icon: '🎉',
    points_bonus: 200
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Score 100% on any quiz',
    icon: '🧠',
    points_bonus: 100
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a ride before 7am',
    icon: '🌅',
    points_bonus: 50
  },
  {
    id: 'safety_pro',
    name: 'Safety Pro',
    description: 'Complete all safety modules',
    icon: '🛡️',
    points_bonus: 300
  },
  {
    id: 'community_champion',
    name: 'Community Champion',
    description: 'Attend 5 community rides',
    icon: '🏅',
    points_bonus: 500
  },
  {
    id: 'eco_warrior',
    name: 'Eco Warrior',
    description: 'Ride 100km total',
    icon: '🌱',
    points_bonus: 250
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    points_bonus: 175
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Complete all education modules',
    icon: '🎓',
    points_bonus: 1000
  }
];

// ============================================
// LEVELS
// ============================================
const LEVELS = [
  { level: 1, name: 'Learner', min_points: 0, icon: '🌱' },
  { level: 2, name: 'Novice Rider', min_points: 250, icon: '🚲' },
  { level: 3, name: 'Confident Cyclist', min_points: 500, icon: '🚴' },
  { level: 4, name: 'Urban Navigator', min_points: 1000, icon: '🏙️' },
  { level: 5, name: 'Road Warrior', min_points: 2000, icon: '⚡' },
  { level: 6, name: 'Cycling Champion', min_points: 3500, icon: '🏆' },
  { level: 7, name: 'Sydney Cycling Legend', min_points: 5000, icon: '👑' }
];

// ============================================
// HELPER FUNCTIONS
// ============================================
function getUserLevel(points) {
  let userLevel = LEVELS[0];
  for (const level of LEVELS) {
    if (points >= level.min_points) {
      userLevel = level;
    }
  }
  return userLevel;
}

function getNextLevel(points) {
  for (const level of LEVELS) {
    if (points < level.min_points) {
      return level;
    }
  }
  return null; // Max level
}

function getPointsToNextLevel(points) {
  const next = getNextLevel(points);
  if (!next) return 0;
  return next.min_points - points;
}

function getLevelProgress(points) {
  const current = getUserLevel(points);
  const next = getNextLevel(points);
  if (!next) return 100;
  const levelRange = next.min_points - current.min_points;
  const progress = points - current.min_points;
  return Math.round((progress / levelRange) * 100);
}

function canAffordReward(reward) {
  return USER_PROGRESS.total_points >= reward.points_cost;
}

function isModuleCompleted(moduleId) {
  return USER_PROGRESS.completed_modules.includes(moduleId);
}

function isQuizCompleted(quizId) {
  return USER_PROGRESS.completed_quizzes.includes(quizId);
}

// Export for use
if (typeof module !== 'undefined') {
  module.exports = {
    POINTS_CONFIG,
    USER_PROGRESS,
    EDUCATION_MODULES,
    EDUCATION_QUIZZES,
    REWARDS,
    BADGES,
    LEVELS,
    getUserLevel,
    getNextLevel,
    getPointsToNextLevel,
    getLevelProgress,
    canAffordReward,
    isModuleCompleted,
    isQuizCompleted
  };
}
