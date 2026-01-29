import { Exam, Question } from '../types';

export const EXAMS: Exam[] = [
  {
    id: 'jee',
    name: 'JEE Main',
    description: 'Joint Entrance Examination for Engineering',
    subjects: [
      {
        id: 'phy',
        name: 'Physics',
        icon: 'Atom',
        topics: [
          {
            id: 'phy_1',
            name: 'Kinematics',
            description: 'Motion in one and two dimensions.',
            subtopics: ['Speed & Velocity', 'Projectile Motion', 'Relative Velocity'],
            difficulty: 'Medium',
            content: `
# Kinematics

Kinematics is the branch of mechanics that describes the motion of points, bodies (objects), and systems of bodies (groups of objects) without considering the forces that cause them to move.

## Key Concepts

1. **Displacement**: Change in position. Vector quantity.
2. **Velocity**: Rate of change of displacement. $ v = dx/dt $
3. **Acceleration**: Rate of change of velocity. $ a = dv/dt $

### Equations of Motion (Constant Acceleration)

* $ v = u + at $
* $ s = ut + 1/2 at^2 $
* $ v^2 = u^2 + 2as $

## Exam Tips
* Always check units (convert km/h to m/s).
* Resolve vectors into components for 2D motion.
            `
          },
          {
            id: 'phy_2',
            name: 'Thermodynamics',
            description: 'Heat, work, and internal energy.',
            subtopics: ['Laws of Thermodynamics', 'Heat Engines', 'Entropy'],
            difficulty: 'Hard',
            content: '# Thermodynamics\n\nStudy of energy relations...'
          }
        ]
      },
      {
        id: 'math',
        name: 'Mathematics',
        icon: 'Sigma',
        topics: [
          {
            id: 'math_1',
            name: 'Calculus',
            description: 'Limits, derivatives, and integrals.',
            subtopics: ['Limits', 'Continuity', 'Differentiation'],
            difficulty: 'Hard',
            content: '# Calculus\n\nThe mathematical study of continuous change...'
          }
        ]
      }
    ]
  },
  {
    id: 'ssc',
    name: 'SSC CGL',
    description: 'Staff Selection Commission - Combined Graduate Level',
    subjects: [
      {
        id: 'reasoning',
        name: 'General Intelligence',
        icon: 'Brain',
        topics: [
          {
             id: 'reas_1',
             name: 'Analogies',
             description: 'Finding relationships between words.',
             subtopics: [],
             difficulty: 'Easy',
             content: '# Analogies\n\nIdentify the pair that expresses a relationship similar to the given pair.'
          }
        ]
      }
    ]
  }
];

export const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    topicId: 'phy_1',
    text: 'A car travels with a speed of 20 m/s for 10 seconds. What is the distance covered?',
    options: ['100m', '200m', '300m', '50m'],
    correctIndex: 1,
    explanation: 'Distance = Speed × Time = 20 × 10 = 200m.'
  },
  {
    id: 'q2',
    topicId: 'phy_1',
    text: 'Which of the following is a vector quantity?',
    options: ['Speed', 'Distance', 'Displacement', 'Mass'],
    correctIndex: 2,
    explanation: 'Displacement has both magnitude and direction.'
  },
  {
    id: 'q3',
    topicId: 'phy_1',
    text: 'If acceleration is zero, velocity is?',
    options: ['Zero', 'Constant', 'Increasing', 'Decreasing'],
    correctIndex: 1,
    explanation: 'Zero acceleration implies no change in velocity.'
  }
];
