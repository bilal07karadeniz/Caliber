import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.$transaction([
    prisma.notification.deleteMany(),
    prisma.aiRecommendation.deleteMany(),
    prisma.application.deleteMany(),
    prisma.jobSkill.deleteMany(),
    prisma.userSkill.deleteMany(),
    prisma.resume.deleteMany(),
    prisma.job.deleteMany(),
    prisma.companyProfile.deleteMany(),
    prisma.skill.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const hashedPassword = await bcrypt.hash('Test1234', 12);
  const adminPassword = await bcrypt.hash('Admin123!', 12);

  // Create admins
  const admins = await Promise.all([
    prisma.user.create({ data: { name: 'Admin User', email: 'admin@aimatch.com', password: adminPassword, role: 'ADMIN' } }),
    prisma.user.create({ data: { name: 'System Admin', email: 'sysadmin@aimatch.com', password: adminPassword, role: 'ADMIN' } }),
    prisma.user.create({ data: { name: 'Super Admin', email: 'superadmin@aimatch.com', password: adminPassword, role: 'ADMIN' } }),
  ]);

  // Create employers with company profiles
  const employerData = [
    { name: 'John Tech', email: 'john@techcorp.com', company: 'TechCorp', industry: 'Technology', size: '201-500' },
    { name: 'Sarah Data', email: 'sarah@dataflow.com', company: 'DataFlow Inc', industry: 'Data Analytics', size: '51-200' },
    { name: 'Mike Innovation', email: 'mike@innovatelabs.com', company: 'InnovateLabs', industry: 'AI/ML', size: '11-50' },
    { name: 'Emma Cloud', email: 'emma@cloudsoft.com', company: 'CloudSoft', industry: 'Cloud Computing', size: '201-500' },
    { name: 'Alex Digital', email: 'alex@digitalwave.com', company: 'DigitalWave', industry: 'Digital Marketing', size: '51-200' },
    { name: 'Lisa Finance', email: 'lisa@fintechpro.com', company: 'FinTechPro', industry: 'Finance', size: '500+' },
    { name: 'David Health', email: 'david@healthai.com', company: 'HealthAI', industry: 'Healthcare', size: '11-50' },
    { name: 'Amy Retail', email: 'amy@smartretail.com', company: 'SmartRetail', industry: 'E-commerce', size: '51-200' },
    { name: 'Chris Game', email: 'chris@gamestudio.com', company: 'GameStudio', industry: 'Gaming', size: '11-50' },
    { name: 'Olivia Green', email: 'olivia@greentech.com', company: 'GreenTech', industry: 'Sustainability', size: '11-50' },
  ];

  const employers = [];
  for (const e of employerData) {
    const user = await prisma.user.create({
      data: { name: e.name, email: e.email, password: hashedPassword, role: 'EMPLOYER' },
    });
    await prisma.companyProfile.create({
      data: { userId: user.id, companyName: e.company, industry: e.industry, size: e.size, description: `${e.company} is a leading company in ${e.industry}.` },
    });
    employers.push(user);
  }

  // Create job seekers
  const seekerNames = ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Ross', 'Edward Lee', 'Fatima Khan', 'George Wang', 'Hannah Miller', 'Ibrahim Ahmed', 'Julia Chen', 'Kevin Park', 'Laura Martin', 'Mohammed Ali', 'Nora Wilson', 'Oscar Garcia'];
  const seekers = [];
  for (let i = 0; i < seekerNames.length; i++) {
    const user = await prisma.user.create({
      data: {
        name: seekerNames[i],
        email: `seeker${i + 1}@test.com`,
        password: hashedPassword,
        role: 'JOB_SEEKER',
        location: ['Istanbul', 'Ankara', 'London', 'Berlin', 'Remote'][i % 5],
        bio: `Experienced professional looking for new opportunities.`,
      },
    });
    seekers.push(user);
  }

  // Create skills
  const skillsData: { name: string; category: string }[] = [
    // Programming
    { name: 'JavaScript', category: 'Programming' }, { name: 'TypeScript', category: 'Programming' },
    { name: 'Python', category: 'Programming' }, { name: 'Java', category: 'Programming' },
    { name: 'C++', category: 'Programming' }, { name: 'Go', category: 'Programming' },
    { name: 'Rust', category: 'Programming' }, { name: 'C#', category: 'Programming' },
    { name: 'Ruby', category: 'Programming' }, { name: 'PHP', category: 'Programming' },
    { name: 'Swift', category: 'Programming' }, { name: 'Kotlin', category: 'Programming' },
    // Frontend
    { name: 'React', category: 'Frontend' }, { name: 'Angular', category: 'Frontend' },
    { name: 'Vue', category: 'Frontend' }, { name: 'Next.js', category: 'Frontend' },
    { name: 'HTML', category: 'Frontend' }, { name: 'CSS', category: 'Frontend' },
    { name: 'Tailwind', category: 'Frontend' }, { name: 'Bootstrap', category: 'Frontend' },
    { name: 'SASS', category: 'Frontend' },
    // Backend
    { name: 'Node.js', category: 'Backend' }, { name: 'Express', category: 'Backend' },
    { name: 'Django', category: 'Backend' }, { name: 'FastAPI', category: 'Backend' },
    { name: 'Spring', category: 'Backend' }, { name: 'Flask', category: 'Backend' },
    { name: 'GraphQL', category: 'Backend' }, { name: 'REST API', category: 'Backend' },
    // Database
    { name: 'PostgreSQL', category: 'Database' }, { name: 'MongoDB', category: 'Database' },
    { name: 'MySQL', category: 'Database' }, { name: 'Redis', category: 'Database' },
    { name: 'SQLite', category: 'Database' }, { name: 'Prisma', category: 'Database' },
    // DevOps
    { name: 'Docker', category: 'DevOps' }, { name: 'Kubernetes', category: 'DevOps' },
    { name: 'AWS', category: 'DevOps' }, { name: 'Azure', category: 'DevOps' },
    { name: 'GCP', category: 'DevOps' }, { name: 'CI/CD', category: 'DevOps' },
    { name: 'Jenkins', category: 'DevOps' }, { name: 'GitHub Actions', category: 'DevOps' },
    { name: 'Terraform', category: 'DevOps' }, { name: 'Linux', category: 'DevOps' },
    // Soft Skills
    { name: 'Communication', category: 'Soft Skills' }, { name: 'Leadership', category: 'Soft Skills' },
    { name: 'Teamwork', category: 'Soft Skills' }, { name: 'Problem Solving', category: 'Soft Skills' },
    { name: 'Project Management', category: 'Soft Skills' }, { name: 'Agile', category: 'Soft Skills' },
    // Data Science
    { name: 'Machine Learning', category: 'Data Science' }, { name: 'Deep Learning', category: 'Data Science' },
    { name: 'NLP', category: 'Data Science' }, { name: 'TensorFlow', category: 'Data Science' },
    { name: 'PyTorch', category: 'Data Science' }, { name: 'Pandas', category: 'Data Science' },
    { name: 'NumPy', category: 'Data Science' }, { name: 'Scikit-learn', category: 'Data Science' },
    { name: 'Data Visualization', category: 'Data Science' },
  ];

  const skills = [];
  for (const s of skillsData) {
    const skill = await prisma.skill.create({ data: s });
    skills.push(skill);
  }

  // Create jobs
  const jobsData = [
    { title: 'Senior React Developer', desc: 'Build modern web applications using React and TypeScript. Lead frontend architecture decisions.', reqs: '5+ years React experience, TypeScript, state management, testing.', loc: 'Istanbul', type: 'FULL_TIME' as const, minSal: 80000, maxSal: 120000, skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Node.js'] },
    { title: 'Python Backend Engineer', desc: 'Design and build scalable APIs and microservices.', reqs: '3+ years Python, REST API design, database optimization.', loc: 'Remote', type: 'REMOTE' as const, minSal: 70000, maxSal: 110000, skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'REST API'] },
    { title: 'Full Stack Developer', desc: 'Work across the entire stack building features end-to-end.', reqs: 'React + Node.js experience, database design.', loc: 'Berlin', type: 'FULL_TIME' as const, minSal: 65000, maxSal: 95000, skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'TypeScript'] },
    { title: 'Machine Learning Engineer', desc: 'Develop ML models for production systems.', reqs: 'MS in CS or related, PyTorch/TensorFlow, MLOps experience.', loc: 'London', type: 'FULL_TIME' as const, minSal: 90000, maxSal: 140000, skills: ['Python', 'Machine Learning', 'PyTorch', 'TensorFlow', 'Docker'] },
    { title: 'DevOps Engineer', desc: 'Manage cloud infrastructure and CI/CD pipelines.', reqs: 'AWS/GCP, Kubernetes, Terraform, monitoring.', loc: 'Remote', type: 'REMOTE' as const, minSal: 85000, maxSal: 130000, skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Terraform'] },
    { title: 'Junior Frontend Developer', desc: 'Join our team building beautiful UIs.', reqs: 'Basic React/HTML/CSS. Eager to learn.', loc: 'Istanbul', type: 'FULL_TIME' as const, minSal: 35000, maxSal: 50000, skills: ['HTML', 'CSS', 'JavaScript', 'React'] },
    { title: 'Data Scientist', desc: 'Analyze data and build predictive models.', reqs: 'Python, statistics, ML algorithms.', loc: 'Ankara', type: 'FULL_TIME' as const, minSal: 70000, maxSal: 100000, skills: ['Python', 'Pandas', 'Scikit-learn', 'Machine Learning', 'Data Visualization'] },
    { title: 'Mobile Developer (React Native)', desc: 'Build cross-platform mobile applications.', reqs: 'React Native, TypeScript, mobile best practices.', loc: 'Remote', type: 'CONTRACT' as const, minSal: 60000, maxSal: 90000, skills: ['React', 'TypeScript', 'JavaScript'] },
    { title: 'Backend Developer (Node.js)', desc: 'Build robust APIs with Node.js and Express.', reqs: 'Node.js, Express, MongoDB/PostgreSQL.', loc: 'Istanbul', type: 'FULL_TIME' as const, minSal: 55000, maxSal: 85000, skills: ['Node.js', 'Express', 'TypeScript', 'PostgreSQL', 'REST API'] },
    { title: 'Cloud Architect', desc: 'Design cloud-native solutions on AWS.', reqs: 'AWS certification, 5+ years cloud experience.', loc: 'London', type: 'FULL_TIME' as const, minSal: 100000, maxSal: 160000, skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Linux'] },
    { title: 'NLP Engineer', desc: 'Build natural language processing systems.', reqs: 'NLP experience, Python, deep learning frameworks.', loc: 'Remote', type: 'REMOTE' as const, minSal: 85000, maxSal: 130000, skills: ['Python', 'NLP', 'Deep Learning', 'TensorFlow', 'PyTorch'] },
    { title: 'QA Engineer', desc: 'Ensure software quality through testing.', reqs: 'Testing frameworks, automation, CI/CD.', loc: 'Ankara', type: 'FULL_TIME' as const, minSal: 45000, maxSal: 70000, skills: ['JavaScript', 'CI/CD', 'Python'] },
    { title: 'Product Manager', desc: 'Lead product strategy and roadmap.', reqs: 'Product management experience, agile methodologies.', loc: 'Istanbul', type: 'FULL_TIME' as const, minSal: 70000, maxSal: 110000, skills: ['Project Management', 'Agile', 'Communication', 'Leadership'] },
    { title: 'Angular Developer', desc: 'Build enterprise applications with Angular.', reqs: '3+ years Angular, TypeScript, RxJS.', loc: 'Berlin', type: 'FULL_TIME' as const, minSal: 60000, maxSal: 95000, skills: ['Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS'] },
    { title: 'Django Developer', desc: 'Build web applications with Django.', reqs: 'Python, Django, PostgreSQL.', loc: 'Remote', type: 'REMOTE' as const, minSal: 55000, maxSal: 85000, skills: ['Python', 'Django', 'PostgreSQL', 'REST API'] },
    { title: 'Blockchain Developer', desc: 'Smart contracts and DeFi development.', reqs: 'Solidity, Web3, DeFi protocols.', loc: 'Remote', type: 'CONTRACT' as const, minSal: 90000, maxSal: 150000, skills: ['JavaScript', 'TypeScript', 'Node.js'] },
    { title: 'Site Reliability Engineer', desc: 'Keep production systems running reliably.', reqs: 'Linux, monitoring, incident response.', loc: 'London', type: 'FULL_TIME' as const, minSal: 80000, maxSal: 125000, skills: ['Linux', 'Docker', 'Kubernetes', 'AWS', 'CI/CD'] },
    { title: 'UI/UX Designer Developer', desc: 'Design and implement user interfaces.', reqs: 'Design skills, CSS mastery, React.', loc: 'Istanbul', type: 'FULL_TIME' as const, minSal: 50000, maxSal: 80000, skills: ['HTML', 'CSS', 'React', 'Tailwind'] },
    { title: 'Java Backend Engineer', desc: 'Build enterprise Java applications with Spring.', reqs: 'Java, Spring Boot, microservices.', loc: 'Berlin', type: 'FULL_TIME' as const, minSal: 65000, maxSal: 100000, skills: ['Java', 'Spring', 'PostgreSQL', 'Docker', 'REST API'] },
    { title: 'Data Engineer', desc: 'Build and maintain data pipelines.', reqs: 'Python, SQL, ETL, cloud platforms.', loc: 'Remote', type: 'REMOTE' as const, minSal: 75000, maxSal: 115000, skills: ['Python', 'PostgreSQL', 'AWS', 'Docker'] },
    { title: 'Go Developer', desc: 'Build high-performance services in Go.', reqs: 'Go experience, systems programming.', loc: 'London', type: 'FULL_TIME' as const, minSal: 80000, maxSal: 120000, skills: ['Go', 'Docker', 'Linux', 'REST API', 'PostgreSQL'] },
    { title: 'Frontend Intern', desc: 'Learn frontend development on real projects.', reqs: 'Basic HTML/CSS/JS knowledge.', loc: 'Istanbul', type: 'INTERNSHIP' as const, minSal: 15000, maxSal: 25000, skills: ['HTML', 'CSS', 'JavaScript'] },
    { title: 'AI Research Scientist', desc: 'Conduct cutting-edge AI research.', reqs: 'PhD preferred, deep learning, publications.', loc: 'Remote', type: 'FULL_TIME' as const, minSal: 110000, maxSal: 170000, skills: ['Python', 'Deep Learning', 'Machine Learning', 'PyTorch', 'NLP'] },
    { title: 'Technical Lead', desc: 'Lead a team of developers on complex projects.', reqs: '8+ years experience, team leadership.', loc: 'Istanbul', type: 'FULL_TIME' as const, minSal: 95000, maxSal: 140000, skills: ['JavaScript', 'React', 'Node.js', 'Leadership', 'Agile'] },
    { title: 'Security Engineer', desc: 'Implement security best practices.', reqs: 'Security certifications, penetration testing.', loc: 'Ankara', type: 'FULL_TIME' as const, minSal: 75000, maxSal: 115000, skills: ['Linux', 'Python', 'Docker', 'AWS'] },
    { title: 'Vue.js Developer', desc: 'Build applications with Vue.js ecosystem.', reqs: 'Vue.js, Vuex, TypeScript.', loc: 'Remote', type: 'PART_TIME' as const, minSal: 40000, maxSal: 65000, skills: ['Vue', 'JavaScript', 'TypeScript', 'HTML', 'CSS'] },
    { title: 'Database Administrator', desc: 'Manage and optimize database systems.', reqs: 'PostgreSQL, performance tuning, backup.', loc: 'Berlin', type: 'FULL_TIME' as const, minSal: 60000, maxSal: 90000, skills: ['PostgreSQL', 'MySQL', 'Linux', 'Docker'] },
    { title: 'Flutter Mobile Developer', desc: 'Build mobile apps with Flutter.', reqs: 'Flutter, Dart, mobile development.', loc: 'Istanbul', type: 'FULL_TIME' as const, minSal: 50000, maxSal: 80000, skills: ['JavaScript', 'HTML', 'CSS'] },
    { title: 'GraphQL API Developer', desc: 'Design and implement GraphQL APIs.', reqs: 'GraphQL, Node.js, database design.', loc: 'Remote', type: 'CONTRACT' as const, minSal: 70000, maxSal: 100000, skills: ['GraphQL', 'Node.js', 'TypeScript', 'PostgreSQL'] },
    { title: 'Embedded Systems Developer', desc: 'C/C++ programming for embedded systems.', reqs: 'C/C++, RTOS, hardware interfaces.', loc: 'Ankara', type: 'FULL_TIME' as const, minSal: 55000, maxSal: 85000, skills: ['C++', 'Linux'] },
  ];

  const createdJobs = [];
  for (let i = 0; i < jobsData.length; i++) {
    const jd = jobsData[i];
    const employer = employers[i % employers.length];
    const job = await prisma.job.create({
      data: {
        employerId: employer.id,
        title: jd.title,
        description: jd.desc,
        requirements: jd.reqs,
        location: jd.loc,
        employmentType: jd.type,
        salaryMin: jd.minSal,
        salaryMax: jd.maxSal,
      },
    });
    createdJobs.push(job);

    // Link skills to job
    for (const sName of jd.skills) {
      const skill = skills.find((s) => s.name === sName);
      if (skill) {
        await prisma.jobSkill.create({
          data: { jobId: job.id, skillId: skill.id, requiredLevel: Math.floor(Math.random() * 3) + 2 },
        });
      }
    }
  }

  // Assign skills to seekers
  for (const seeker of seekers) {
    const numSkills = Math.floor(Math.random() * 8) + 3;
    const shuffled = [...skills].sort(() => Math.random() - 0.5);
    for (let i = 0; i < numSkills; i++) {
      await prisma.userSkill.create({
        data: { userId: seeker.id, skillId: shuffled[i].id, proficiencyLevel: Math.floor(Math.random() * 4) + 1 },
      });
    }
  }

  // Create applications
  for (let i = 0; i < 20; i++) {
    const seeker = seekers[i % seekers.length];
    const job = createdJobs[i % createdJobs.length];
    try {
      await prisma.application.create({
        data: {
          userId: seeker.id,
          jobId: job.id,
          status: (['PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'ACCEPTED'] as const)[Math.floor(Math.random() * 5)],
          coverLetter: 'I am very interested in this position and believe my skills make me a great fit.',
        },
      });
    } catch {} // Skip duplicates
  }

  // Create AI recommendations
  for (let i = 0; i < 10; i++) {
    const seeker = seekers[i % seekers.length];
    const job = createdJobs[(i * 3) % createdJobs.length];
    await prisma.aiRecommendation.create({
      data: {
        userId: seeker.id,
        jobId: job.id,
        matchScore: Math.floor(Math.random() * 40) + 60,
        explanation: `Good match based on skill alignment and experience relevance.`,
        skillGap: [{ skill_name: 'Docker', required_level: 3, user_level: 1, gap: 2 }],
      },
    });
  }

  console.log('Seed completed!');
  console.log(`Created: ${admins.length} admins, ${employers.length} employers, ${seekers.length} seekers, ${skills.length} skills, ${createdJobs.length} jobs`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
