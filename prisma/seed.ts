import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Password@123';

async function main() {
  console.log('Seeding ScholarSync data...');

  await prisma.badge.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.module.deleteMany();
  await prisma.user.deleteMany();

  await prisma.module.createMany({
    data: [
      { code: 'CS201', name: 'Data Structures' },
      { code: 'CS301', name: 'Database Systems' },
      { code: 'CS401', name: 'Software Engineering' },
      { code: 'CS501', name: 'Machine Learning' },
      { code: 'CS302', name: 'Computer Networks' },
      { code: 'CS202', name: 'Web Development' },
      { code: 'IT3040', name: 'IT Project Management' },
      { code: 'IT3010', name: 'Data Science & Analytics' },
    ],
    skipDuplicates: true,
  });

  const lecturer = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Miller',
      email: 'sarah.m@sliit.lk',
      password: DEMO_PASSWORD,
      role: 'LECTURER',
      reputationPoints: 3200,
    },
  });

  const lecturer2 = await prisma.user.create({
    data: {
      name: 'Prof. Mark Fernando',
      email: 'mark.f@sliit.lk',
      password: DEMO_PASSWORD,
      role: 'LECTURER',
      reputationPoints: 2850,
    },
  });

  const lecturer3 = await prisma.user.create({
    data: {
      name: 'Dr. Anika Silva',
      email: 'anika.s@sliit.lk',
      password: DEMO_PASSWORD,
      role: 'LECTURER',
      reputationPoints: 3010,
    },
  });

  const lecturer4 = await prisma.user.create({
    data: {
      name: 'Dr. Kevin Dias',
      email: 'kevin.d@sliit.lk',
      password: DEMO_PASSWORD,
      role: 'LECTURER',
      reputationPoints: 2675,
    },
  });

  const lecturer5 = await prisma.user.create({
    data: {
      name: 'Prof. Imani Clarke',
      email: 'imani.c@sliit.lk',
      password: DEMO_PASSWORD,
      role: 'LECTURER',
      reputationPoints: 3480,
    },
  });

  const alex = await prisma.user.create({
    data: {
      name: 'Alex Johnson',
      email: 'IT22345678@my.sliit.lk',
      password: DEMO_PASSWORD,
      role: 'STUDENT',
      reputationPoints: 1250,
    },
  });

  const maria = await prisma.user.create({
    data: {
      name: 'Maria Garcia',
      email: 'IT22345679@my.sliit.lk',
      password: DEMO_PASSWORD,
      role: 'STUDENT',
      reputationPoints: 980,
    },
  });

  const daniel = await prisma.user.create({
    data: {
      name: 'Daniel Lee',
      email: 'IT22345680@my.sliit.lk',
      password: DEMO_PASSWORD,
      role: 'STUDENT',
      reputationPoints: 860,
    },
  });

  const nisha = await prisma.user.create({
    data: {
      name: 'Nisha Perera',
      email: 'IT22345681@my.sliit.lk',
      password: DEMO_PASSWORD,
      role: 'STUDENT',
      reputationPoints: 1420,
    },
  });

  const ravi = await prisma.user.create({
    data: {
      name: 'Ravi Kumar',
      email: 'IT22345682@my.sliit.lk',
      password: DEMO_PASSWORD,
      role: 'STUDENT',
      reputationPoints: 740,
    },
  });

  const emma = await prisma.user.create({
    data: {
      name: 'Emma Brown',
      email: 'IT22345683@my.sliit.lk',
      password: DEMO_PASSWORD,
      role: 'STUDENT',
      reputationPoints: 1190,
    },
  });

  const liam = await prisma.user.create({
    data: {
      name: 'Liam Chen',
      email: 'IT22345684@my.sliit.lk',
      password: DEMO_PASSWORD,
      role: 'STUDENT',
      reputationPoints: 910,
    },
  });

  const fatima = await prisma.user.create({
    data: {
      name: 'Fatima Noor',
      email: 'IT22345685@my.sliit.lk',
      password: DEMO_PASSWORD,
      role: 'STUDENT',
      reputationPoints: 1335,
    },
  });

  const questions = await Promise.all([
    prisma.question.create({
      data: {
        title: 'Explain the SOLID principles with real-world examples',
        content: 'Need practical examples for each SOLID principle in software projects and team workflows.',
        authorId: alex.id,
        tags: ['module:CS401', 'SOLID', 'Design Patterns', 'Architecture'],
        upvotes: 31,
        isLecturerAnswered: true,
      },
    }),
    prisma.question.create({
      data: {
        title: 'What is the difference between INNER JOIN and LEFT JOIN?',
        content: 'Can someone explain with two tiny tables and expected query output differences?',
        authorId: maria.id,
        tags: ['module:CS301', 'SQL', 'Joins', 'Relational'],
        upvotes: 24,
        isLecturerAnswered: true,
      },
    }),
    prisma.question.create({
      data: {
        title: 'How to choose a hash function for hashmap collision handling?',
        content: 'I am comparing division and multiplicative methods and need practical guidance for implementation.',
        authorId: daniel.id,
        tags: ['module:CS201', 'Hashing', 'Data Structures'],
        upvotes: 19,
        isLecturerAnswered: true,
      },
    }),
    prisma.question.create({
      data: {
        title: 'Gradient Descent vs Stochastic Gradient Descent for medium datasets',
        content: 'When should we use batch gradient descent over SGD for around 50k records?',
        authorId: nisha.id,
        tags: ['module:CS501', 'Optimization', 'ML'],
        upvotes: 22,
        isLecturerAnswered: false,
      },
    }),
    prisma.question.create({
      data: {
        title: 'Subnetting shortcut method for exam questions',
        content: 'Looking for a fast approach to solve /26 and /27 subnetting questions under time pressure.',
        authorId: alex.id,
        tags: ['module:CS302', 'Networking', 'Subnetting'],
        upvotes: 17,
        isLecturerAnswered: false,
      },
    }),
    prisma.question.create({
      data: {
        title: 'REST API folder structure for Next.js backend routes',
        content: 'What is a clean folder structure for auth, modules, and questions endpoints in one project?',
        authorId: maria.id,
        tags: ['module:CS202', 'REST', 'Project Structure'],
        upvotes: 15,
        isLecturerAnswered: true,
      },
    }),
    prisma.question.create({
      data: {
        title: 'How to create a realistic project Gantt chart baseline?',
        content: 'Need help defining milestones, dependencies, and slack for a software project management assignment.',
        authorId: daniel.id,
        tags: ['module:IT3040', 'Project Planning', 'Gantt'],
        upvotes: 14,
        isLecturerAnswered: true,
      },
    }),
    prisma.question.create({
      data: {
        title: 'Difference between precision and recall with imbalanced classes',
        content: 'I understand formulas but need intuition on when to optimize recall over precision in fraud detection.',
        authorId: nisha.id,
        tags: ['module:IT3010', 'Classification', 'Metrics'],
        upvotes: 20,
        isLecturerAnswered: false,
      },
    }),
    prisma.question.create({
      data: {
        title: 'How to implement Dijkstra efficiently using priority queue?',
        content: 'I need an implementation strategy in TypeScript and tips to avoid revisiting stale nodes.',
        authorId: ravi.id,
        tags: ['module:CS201', 'Graphs', 'Algorithms', 'Dijkstra'],
        upvotes: 18,
        isLecturerAnswered: true,
      },
    }),
    prisma.question.create({
      data: {
        title: 'NoSQL vs PostgreSQL for high read traffic systems',
        content: 'Which data model works better for a forum-like app with heavy reads and moderate writes?',
        authorId: emma.id,
        tags: ['module:CS301', 'NoSQL', 'PostgreSQL', 'Scalability'],
        upvotes: 21,
        isLecturerAnswered: true,
      },
    }),
    prisma.question.create({
      data: {
        title: 'How to estimate sprint velocity for a new team?',
        content: 'Need a practical way to estimate first 3 sprints when we have no historical velocity data.',
        authorId: liam.id,
        tags: ['module:IT3040', 'Scrum', 'Sprint Planning'],
        upvotes: 13,
        isLecturerAnswered: false,
      },
    }),
    prisma.question.create({
      data: {
        title: 'Overfitting signs in random forest models',
        content: 'Training accuracy is very high but validation score is unstable. What should I tune first?',
        authorId: fatima.id,
        tags: ['module:IT3010', 'Random Forest', 'Model Tuning'],
        upvotes: 16,
        isLecturerAnswered: true,
      },
    }),
    prisma.question.create({
      data: {
        title: 'When should I use microservices instead of modular monolith?',
        content: 'Team size is 8 and product is still evolving. Need architectural guidance for long-term maintainability.',
        authorId: alex.id,
        tags: ['module:CS401', 'Architecture', 'Microservices'],
        upvotes: 27,
        isLecturerAnswered: true,
      },
    }),
    prisma.question.create({
      data: {
        title: 'VLAN segmentation strategy for campus lab network',
        content: 'Looking for a secure segmentation layout for student labs, admin offices, and IoT devices.',
        authorId: maria.id,
        tags: ['module:CS302', 'VLAN', 'Network Security'],
        upvotes: 12,
        isLecturerAnswered: false,
      },
    }),
    prisma.question.create({
      data: {
        title: 'How to secure JWT refresh token flow in Next.js?',
        content: 'Need best practices for rotating refresh tokens and handling revocation in a server action setup.',
        authorId: emma.id,
        tags: ['module:CS202', 'JWT', 'Authentication', 'Security'],
        upvotes: 23,
        isLecturerAnswered: true,
      },
    }),
    prisma.question.create({
      data: {
        title: 'How to select features for churn prediction model?',
        content: 'I need a workflow for feature selection before training a churn model with mixed categorical and numeric fields.',
        authorId: ravi.id,
        tags: ['module:CS501', 'Feature Engineering', 'Churn Prediction'],
        upvotes: 19,
        isLecturerAnswered: true,
      },
    }),
  ]);

  await prisma.answer.createMany({
    data: [
      {
        content: 'Start with Single Responsibility by splitting classes that change for different reasons.',
        questionId: questions[0].id,
        authorId: lecturer.id,
        isAccepted: true,
        upvotes: 14,
      },
      {
        content: 'INNER JOIN keeps only matches while LEFT JOIN keeps all left rows and nulls for missing right rows.',
        questionId: questions[1].id,
        authorId: lecturer.id,
        isAccepted: true,
        upvotes: 10,
      },
      {
        content: 'For hashmaps, combine good spread with resize thresholds around 0.75 load factor.',
        questionId: questions[2].id,
        authorId: lecturer2.id,
        isAccepted: true,
        upvotes: 9,
      },
      {
        content: 'Use feature scaling and monitor validation loss; SGD usually converges faster per epoch on bigger data.',
        questionId: questions[3].id,
        authorId: alex.id,
        isAccepted: false,
        upvotes: 4,
      },
      {
        content: 'Group by function first: api/auth, api/questions, api/modules, then split service and validation layers.',
        questionId: questions[5].id,
        authorId: lecturer2.id,
        isAccepted: true,
        upvotes: 7,
      },
      {
        content: 'Set baseline from historical sprints, then add dependency buffers to tasks with high uncertainty.',
        questionId: questions[6].id,
        authorId: lecturer.id,
        isAccepted: true,
        upvotes: 6,
      },
      {
        content: 'Use a min-heap and skip popped nodes whose distance no longer matches the best-known value.',
        questionId: questions[8].id,
        authorId: lecturer3.id,
        isAccepted: true,
        upvotes: 11,
      },
      {
        content: 'Start with PostgreSQL for consistency and indexing flexibility, then add read replicas before switching stacks.',
        questionId: questions[9].id,
        authorId: lecturer2.id,
        isAccepted: true,
        upvotes: 8,
      },
      {
        content: 'Check train/validation gap first, then tune max depth, min samples leaf, and feature subsampling.',
        questionId: questions[11].id,
        authorId: lecturer3.id,
        isAccepted: true,
        upvotes: 9,
      },
      {
        content: 'For your team size, a modular monolith with clear bounded contexts usually gives faster delivery initially.',
        questionId: questions[12].id,
        authorId: lecturer.id,
        isAccepted: true,
        upvotes: 10,
      },
      {
        content: 'You can estimate early velocity by planning conservative story points and recalibrating after each retrospective.',
        questionId: questions[10].id,
        authorId: emma.id,
        isAccepted: false,
        upvotes: 3,
      },
      {
        content: 'Store refresh tokens server-side with rotation and invalidate the previous token on every refresh request.',
        questionId: questions[14].id,
        authorId: lecturer4.id,
        isAccepted: true,
        upvotes: 12,
      },
      {
        content: 'Start with correlation analysis and model-based importance, then validate with SHAP values on holdout data.',
        questionId: questions[15].id,
        authorId: lecturer5.id,
        isAccepted: true,
        upvotes: 13,
      },
    ],
  });

  await prisma.badge.createMany({
    data: [
      {
        userId: alex.id,
        name: 'First Question',
        description: 'Asked your first question',
        iconName: 'CircleHelp',
        requiredPoints: 0,
      },
      {
        userId: alex.id,
        name: 'Top Contributor',
        description: 'Received 100 upvotes',
        iconName: 'Trophy',
        requiredPoints: 1000,
      },
      {
        userId: alex.id,
        name: 'Curious Mind',
        description: 'Asked 10 questions',
        iconName: 'Brain',
        requiredPoints: 150,
      },
      {
        userId: alex.id,
        name: 'Helpful Hand',
        description: 'Posted your first helpful answer',
        iconName: 'Handshake',
        requiredPoints: 100,
      },
      {
        userId: alex.id,
        name: 'Fast Learner',
        description: 'Earned 500 reputation points',
        iconName: 'Zap',
        requiredPoints: 500,
      },
      {
        userId: alex.id,
        name: 'Code Explorer',
        description: 'Asked 5 algorithm questions',
        iconName: 'Search',
        requiredPoints: 200,
      },
      {
        userId: alex.id,
        name: 'Database Detective',
        description: 'Solved 3 SQL-related threads',
        iconName: 'Database',
        requiredPoints: 260,
      },
      {
        userId: alex.id,
        name: 'Planner',
        description: 'Contributed to project management discussions',
        iconName: 'CalendarClock',
        requiredPoints: 180,
      },
      {
        userId: alex.id,
        name: 'ML Analyst',
        description: 'Reached 10 machine learning replies',
        iconName: 'LineChart',
        requiredPoints: 320,
      },
      {
        userId: maria.id,
        name: 'Curious Mind',
        description: 'Asked 10 questions',
        iconName: 'Brain',
        requiredPoints: 150,
      },
      {
        userId: daniel.id,
        name: 'Helpful Hand',
        description: 'Posted your first helpful answer',
        iconName: 'Handshake',
        requiredPoints: 100,
      },
      {
        userId: nisha.id,
        name: 'Fast Learner',
        description: 'Earned 500 reputation points',
        iconName: 'Zap',
        requiredPoints: 500,
      },
      {
        userId: ravi.id,
        name: 'Code Explorer',
        description: 'Asked 5 algorithm questions',
        iconName: 'Search',
        requiredPoints: 200,
      },
      {
        userId: emma.id,
        name: 'Database Detective',
        description: 'Solved 3 SQL-related threads',
        iconName: 'Database',
        requiredPoints: 260,
      },
      {
        userId: liam.id,
        name: 'Planner',
        description: 'Contributed to project management discussions',
        iconName: 'CalendarClock',
        requiredPoints: 180,
      },
      {
        userId: fatima.id,
        name: 'ML Analyst',
        description: 'Reached 10 machine learning replies',
        iconName: 'LineChart',
        requiredPoints: 320,
      },
    ],
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
