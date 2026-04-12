import { JobPosting, Applicant, JobApplication, Position, User } from '../models/index.js';
import sequelize from '../config/database.js';

async function verifyRecruitment() {
    console.log('--- Starting Recruitment Verification ---');
    try {
        // 1. Check if tables exist by trying to count records
        const postingCount = await JobPosting.count();
        const applicantCount = await Applicant.count();
        const appCount = await JobApplication.count();

        console.log(`Current Counts - Postings: ${postingCount}, Applicants: ${applicantCount}, Applications: ${appCount}`);

        // 2. Test associations
        const testUser = await User.findOne();
        const testPosition = await Position.findOne();

        if (testUser && testPosition) {
            console.log('Creating test job posting...');
            const posting = await JobPosting.create({
                position_id: testPosition.id,
                title: 'Test Receptionist',
                reference_code: 'TEST-' + Date.now(),
                description: 'Test description',
                status: 'draft',
                created_by: testUser.id
            });
            console.log('Successfully created job posting:', posting.title);

            console.log('Creating test applicant...');
            const applicant = await Applicant.create({
                first_name: 'Test',
                last_name: 'Candidate',
                email: 'test' + Date.now() + '@example.com',
                phone: '1234567890'
            });
            console.log('Successfully created applicant:', applicant.first_name);

            console.log('Creating test application...');
            const application = await JobApplication.create({
                job_posting_id: posting.id,
                applicant_id: applicant.id,
                status: 'applied'
            });
            console.log('Successfully created application for ID:', application.id);

            // Cleanup test data
            console.log('Cleaning up test data...');
            await application.destroy();
            await applicant.destroy();
            await posting.destroy();
            console.log('Test data cleaned up successfully.');
        } else {
            console.warn('Skipping create tests: User or Position not found in DB.');
        }

        console.log('--- Verification Successful ---');
    } catch (error) {
        console.error('--- Verification Failed ---');
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

verifyRecruitment();
