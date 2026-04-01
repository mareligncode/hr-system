import { generateJitsiLink } from './services/jitsiService.js';

console.log('--- Phase 9 Backend Verification ---');

// Test Jitsi Link Generation
const testJob = 'Software Engineer';
const testApplicant = 'John Doe';
const testRound = 2;

const link = generateJitsiLink(testJob, testApplicant, testRound);
console.log('Generated Jitsi Link:', link);

if (link.startsWith('https://meet.jit.si/HotelHR-SoftwareEngineer-JohnDoe-R2-')) {
    console.log('✅ Jitsi link generation test passed');
} else {
    console.log('❌ Jitsi link generation test failed');
}

console.log('-----------------------------------');
console.log('Manual Verification Steps:');
console.log('1. Start the server and verify all models are synchronized with DB.');
console.log('2. Test POST /api/interviews with type "online" to verify Jitsi link storage.');
console.log('3. Test GET /api/job-applications/analytics/pipeline to verify counts.');
console.log('4. Test POST /api/offers to verify offer creation and application status update.');
