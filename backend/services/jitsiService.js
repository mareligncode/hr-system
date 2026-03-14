/**
 * Jitsi Service for generating meeting rooms
 */

export const generateJitsiLink = (jobTitle, applicantName, interviewRound) => {
    // Generate a unique room name
    const timestamp = Date.now();
    const cleanJobTitle = jobTitle.replace(/[^a-zA-Z0-9]/g, '');
    const cleanApplicantName = applicantName.replace(/[^a-zA-Z0-9]/g, '');

    const roomName = `HotelHR-${cleanJobTitle}-${cleanApplicantName}-R${interviewRound}-${timestamp}`;

    // Using meet.jit.si public server
    const baseUrl = 'https://meet.jit.si';

    return `${baseUrl}/${roomName}`;
};

export default {
    generateJitsiLink
};
