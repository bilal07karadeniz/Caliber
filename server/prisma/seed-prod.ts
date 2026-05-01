import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Production-safe seed script.
 * - Does NOT delete any existing data
 * - Upserts skills (no duplicates)
 * - Creates demo employer accounts only if they don't exist
 * - Adds non-tech sample jobs only if they don't exist
 * - Backfills category='Technology' on existing tech jobs that have no category
 *
 * Run with: DATABASE_URL=<railway-public-url> npx tsx prisma/seed-prod.ts
 */
async function main() {
  console.log('Running production seed...');

  // 1. Upsert non-tech skills
  const newSkills = [
    { name: 'Strategic Planning', category: 'Business' },
    { name: 'Business Analysis', category: 'Business' },
    { name: 'Risk Management', category: 'Business' },
    { name: 'Budgeting', category: 'Business' },
    { name: 'Operations Management', category: 'Business' },
    { name: 'Business Development', category: 'Business' },
    { name: 'Change Management', category: 'Business' },
    { name: 'KPI Tracking', category: 'Business' },
    { name: 'SEO', category: 'Marketing' },
    { name: 'SEM', category: 'Marketing' },
    { name: 'Content Marketing', category: 'Marketing' },
    { name: 'Social Media Marketing', category: 'Marketing' },
    { name: 'Email Marketing', category: 'Marketing' },
    { name: 'Google Analytics', category: 'Marketing' },
    { name: 'Brand Management', category: 'Marketing' },
    { name: 'Market Research', category: 'Marketing' },
    { name: 'Copywriting', category: 'Marketing' },
    { name: 'Patient Care', category: 'Healthcare' },
    { name: 'Medical Records (EMR/EHR)', category: 'Healthcare' },
    { name: 'Clinical Research', category: 'Healthcare' },
    { name: 'HIPAA Compliance', category: 'Healthcare' },
    { name: 'Medical Terminology', category: 'Healthcare' },
    { name: 'Pharmacology', category: 'Healthcare' },
    { name: 'Telemedicine', category: 'Healthcare' },
    { name: 'Financial Analysis', category: 'Finance' },
    { name: 'Bookkeeping', category: 'Finance' },
    { name: 'Tax Preparation', category: 'Finance' },
    { name: 'Auditing', category: 'Finance' },
    { name: 'Financial Modeling', category: 'Finance' },
    { name: 'SAP', category: 'Finance' },
    { name: 'Regulatory Compliance', category: 'Finance' },
    { name: 'Curriculum Development', category: 'Education' },
    { name: 'Classroom Management', category: 'Education' },
    { name: 'E-Learning Design', category: 'Education' },
    { name: 'Educational Assessment', category: 'Education' },
    { name: 'LMS Administration', category: 'Education' },
    { name: 'Contract Law', category: 'Legal' },
    { name: 'Legal Research', category: 'Legal' },
    { name: 'Compliance', category: 'Legal' },
    { name: 'Intellectual Property', category: 'Legal' },
    { name: 'Corporate Governance', category: 'Legal' },
    { name: 'Litigation', category: 'Legal' },
    { name: 'UI Design', category: 'Design' },
    { name: 'UX Design', category: 'Design' },
    { name: 'Graphic Design', category: 'Design' },
    { name: 'Adobe Photoshop', category: 'Design' },
    { name: 'Adobe Illustrator', category: 'Design' },
    { name: 'Figma', category: 'Design' },
    { name: 'Motion Graphics', category: 'Design' },
    { name: 'Typography', category: 'Design' },
    { name: 'CAD', category: 'Engineering' },
    { name: 'AutoCAD', category: 'Engineering' },
    { name: 'SolidWorks', category: 'Engineering' },
    { name: 'Mechanical Engineering', category: 'Engineering' },
    { name: 'Electrical Engineering', category: 'Engineering' },
    { name: 'Civil Engineering', category: 'Engineering' },
    { name: 'MATLAB', category: 'Engineering' },
    { name: 'CRM', category: 'Sales' },
    { name: 'Salesforce', category: 'Sales' },
    { name: 'Lead Generation', category: 'Sales' },
    { name: 'Negotiation', category: 'Sales' },
    { name: 'Account Management', category: 'Sales' },
    { name: 'Pipeline Management', category: 'Sales' },
    { name: 'B2B Sales', category: 'Sales' },
    { name: 'Recruitment', category: 'Human Resources' },
    { name: 'Onboarding', category: 'Human Resources' },
    { name: 'Performance Management', category: 'Human Resources' },
    { name: 'Compensation & Benefits', category: 'Human Resources' },
    { name: 'Employee Relations', category: 'Human Resources' },
    { name: 'Talent Acquisition', category: 'Human Resources' },
  ];

  for (const s of newSkills) {
    await prisma.skill.upsert({
      where: { name: s.name },
      update: { category: s.category },
      create: s,
    });
  }
  console.log(`Upserted ${newSkills.length} non-tech skills`);

  // 2. Backfill category='Technology' on jobs with null category
  const updated = await prisma.job.updateMany({
    where: { category: null },
    data: { category: 'Technology' },
  });
  console.log(`Backfilled category='Technology' on ${updated.count} existing jobs`);

  // 3. Create demo employer accounts (idempotent)
  const hashedPassword = await bcrypt.hash('Demo1234!', 12);
  const demoEmployers = [
    { name: 'Marketing Demo', email: 'marketing-demo@caliber.demo', company: 'BrandWave Agency', industry: 'Marketing', size: '51-200' },
    { name: 'Finance Demo', email: 'finance-demo@caliber.demo', company: 'CapitalEdge Partners', industry: 'Finance', size: '201-500' },
    { name: 'HR Demo', email: 'hr-demo@caliber.demo', company: 'PeopleFirst HR', industry: 'Human Resources', size: '51-200' },
    { name: 'Design Demo', email: 'design-demo@caliber.demo', company: 'PixelCraft Studio', industry: 'Design', size: '11-50' },
    { name: 'Sales Demo', email: 'sales-demo@caliber.demo', company: 'GrowthForce Sales', industry: 'Sales', size: '51-200' },
    { name: 'Healthcare Demo', email: 'healthcare-demo@caliber.demo', company: 'MedCare Solutions', industry: 'Healthcare', size: '201-500' },
    { name: 'Legal Demo', email: 'legal-demo@caliber.demo', company: 'Stratton Legal LLP', industry: 'Legal', size: '11-50' },
    { name: 'Education Demo', email: 'education-demo@caliber.demo', company: 'LearnHub Academy', industry: 'Education', size: '51-200' },
    { name: 'Engineering Demo', email: 'engineering-demo@caliber.demo', company: 'Helix Engineering', industry: 'Engineering', size: '201-500' },
    { name: 'Business Demo', email: 'business-demo@caliber.demo', company: 'Synergy Consulting', industry: 'Consulting', size: '51-200' },
  ];

  const employerMap: Record<string, string> = {};
  for (const e of demoEmployers) {
    let user = await prisma.user.findUnique({ where: { email: e.email } });
    if (!user) {
      user = await prisma.user.create({
        data: { name: e.name, email: e.email, password: hashedPassword, role: 'EMPLOYER', emailVerified: true },
      });
      await prisma.companyProfile.create({
        data: { userId: user.id, companyName: e.company, industry: e.industry, size: e.size, description: `${e.company} - a leading ${e.industry} company.` },
      });
      console.log(`Created employer: ${e.company}`);
    }
    employerMap[e.industry] = user.id;
  }

  // 4. Create non-tech jobs (idempotent based on title + employerId)
  const newJobs = [
    { employer: 'Marketing', title: 'Marketing Manager', desc: 'Lead digital marketing campaigns and brand strategy.', reqs: 'SEO/SEM experience, Google Analytics, content strategy.', loc: 'Istanbul', type: 'FULL_TIME' as const, minSal: 60000, maxSal: 90000, cat: 'Marketing', skills: ['SEO', 'SEM', 'Google Analytics', 'Content Marketing', 'Brand Management'] },
    { employer: 'Marketing', title: 'Social Media Specialist', desc: 'Manage social media presence across platforms.', reqs: 'Content creation, analytics, copywriting.', loc: 'Remote', type: 'REMOTE' as const, minSal: 35000, maxSal: 55000, cat: 'Marketing', skills: ['Social Media Marketing', 'Content Marketing', 'Copywriting'] },
    { employer: 'Finance', title: 'Financial Analyst', desc: 'Analyze financial data and create reports for decision making.', reqs: 'Finance degree, Excel, financial modeling.', loc: 'London', type: 'FULL_TIME' as const, minSal: 55000, maxSal: 85000, cat: 'Finance', skills: ['Financial Analysis', 'Financial Modeling', 'Budgeting', 'SAP'] },
    { employer: 'Finance', title: 'Senior Auditor', desc: 'Lead audit engagements for corporate clients.', reqs: 'CPA, 5+ years audit experience.', loc: 'Istanbul', type: 'FULL_TIME' as const, minSal: 70000, maxSal: 110000, cat: 'Finance', skills: ['Auditing', 'Regulatory Compliance', 'Financial Analysis'] },
    { employer: 'Human Resources', title: 'HR Specialist', desc: 'Manage recruitment, onboarding, and employee relations.', reqs: 'HR experience, knowledge of labor law, HRIS.', loc: 'Berlin', type: 'FULL_TIME' as const, minSal: 45000, maxSal: 70000, cat: 'Human Resources', skills: ['Recruitment', 'Onboarding', 'Employee Relations', 'Performance Management', 'Talent Acquisition'] },
    { employer: 'Design', title: 'Senior Graphic Designer', desc: 'Create visual content for marketing and product teams.', reqs: 'Adobe Creative Suite, Figma, typography.', loc: 'Remote', type: 'CONTRACT' as const, minSal: 40000, maxSal: 65000, cat: 'Design', skills: ['Graphic Design', 'Adobe Photoshop', 'Adobe Illustrator', 'Figma', 'Typography'] },
    { employer: 'Design', title: 'UX Designer', desc: 'Design user experiences for web and mobile products.', reqs: 'UX research, prototyping, Figma.', loc: 'Istanbul', type: 'FULL_TIME' as const, minSal: 55000, maxSal: 85000, cat: 'Design', skills: ['UX Design', 'UI Design', 'Figma'] },
    { employer: 'Sales', title: 'Sales Representative', desc: 'Drive B2B sales and manage client accounts.', reqs: 'CRM experience, negotiation skills, pipeline management.', loc: 'Istanbul', type: 'FULL_TIME' as const, minSal: 40000, maxSal: 70000, cat: 'Sales', skills: ['CRM', 'Salesforce', 'Lead Generation', 'Negotiation', 'B2B Sales'] },
    { employer: 'Healthcare', title: 'Clinical Research Coordinator', desc: 'Coordinate clinical trials and manage research data.', reqs: 'Clinical research experience, GCP certification, medical terminology.', loc: 'Ankara', type: 'FULL_TIME' as const, minSal: 50000, maxSal: 75000, cat: 'Healthcare', skills: ['Clinical Research', 'Medical Records (EMR/EHR)', 'HIPAA Compliance', 'Medical Terminology'] },
    { employer: 'Healthcare', title: 'Medical Records Specialist', desc: 'Manage patient records using EMR/EHR systems.', reqs: 'EMR systems, HIPAA, medical terminology.', loc: 'Remote', type: 'REMOTE' as const, minSal: 35000, maxSal: 55000, cat: 'Healthcare', skills: ['Medical Records (EMR/EHR)', 'HIPAA Compliance', 'Medical Terminology'] },
    { employer: 'Legal', title: 'Compliance Officer', desc: 'Ensure regulatory compliance across the organization.', reqs: 'Legal or compliance background, regulatory frameworks.', loc: 'London', type: 'FULL_TIME' as const, minSal: 65000, maxSal: 95000, cat: 'Legal', skills: ['Compliance', 'Regulatory Compliance', 'Corporate Governance', 'Risk Management'] },
    { employer: 'Education', title: 'E-Learning Developer', desc: 'Design and develop online learning materials and courses.', reqs: 'Instructional design, LMS experience, multimedia.', loc: 'Remote', type: 'REMOTE' as const, minSal: 45000, maxSal: 70000, cat: 'Education', skills: ['E-Learning Design', 'LMS Administration', 'Curriculum Development'] },
    { employer: 'Engineering', title: 'Mechanical Engineer', desc: 'Design and test mechanical systems and components.', reqs: 'CAD/SolidWorks, mechanical design, MATLAB.', loc: 'Berlin', type: 'FULL_TIME' as const, minSal: 55000, maxSal: 85000, cat: 'Engineering', skills: ['CAD', 'SolidWorks', 'Mechanical Engineering', 'MATLAB', 'AutoCAD'] },
    { employer: 'Engineering', title: 'Civil Engineer', desc: 'Plan and oversee construction projects.', reqs: 'PE license, AutoCAD, project management.', loc: 'Istanbul', type: 'FULL_TIME' as const, minSal: 60000, maxSal: 90000, cat: 'Engineering', skills: ['Civil Engineering', 'AutoCAD', 'CAD'] },
    { employer: 'Consulting', title: 'Business Development Manager', desc: 'Identify growth opportunities and build strategic partnerships.', reqs: 'Business development experience, strategic planning.', loc: 'Istanbul', type: 'FULL_TIME' as const, minSal: 70000, maxSal: 100000, cat: 'Business', skills: ['Business Development', 'Strategic Planning', 'Negotiation', 'Account Management'] },
  ];

  let createdJobsCount = 0;
  for (const j of newJobs) {
    const employerId = employerMap[j.employer];
    if (!employerId) continue;

    const exists = await prisma.job.findFirst({ where: { title: j.title, employerId } });
    if (exists) continue;

    const job = await prisma.job.create({
      data: {
        employerId,
        title: j.title,
        description: j.desc,
        requirements: j.reqs,
        location: j.loc,
        employmentType: j.type,
        category: j.cat,
        salaryMin: j.minSal,
        salaryMax: j.maxSal,
      },
    });

    for (const sName of j.skills) {
      const skill = await prisma.skill.upsert({
        where: { name: sName },
        update: {},
        create: { name: sName },
      });
      await prisma.jobSkill.create({
        data: { jobId: job.id, skillId: skill.id, requiredLevel: 3 },
      });
    }
    createdJobsCount++;
  }

  console.log(`Created ${createdJobsCount} new non-tech jobs`);
  console.log('Production seed completed successfully!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
