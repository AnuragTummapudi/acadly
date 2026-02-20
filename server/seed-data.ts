import "dotenv/config";
import { db } from "./db";
import {
    profiles,
    recommendations,
    recommendationComments,
    recommendationUpvotes,
    queries,
    facultyEvents,
    academicEvents,
    notifications,
} from "../shared/schema";
import { eq, sql } from "drizzle-orm";

async function seedData() {
    console.log("🌱 Seeding showcase data...\n");

    // Fetch some user IDs by role
    const allFaculty = await db.select({ id: profiles.id, fullName: profiles.fullName }).from(profiles).where(eq(profiles.role, "faculty")).limit(30);
    const allHods = await db.select({ id: profiles.id, fullName: profiles.fullName }).from(profiles).where(eq(profiles.role, "hod"));
    const allDeans = await db.select({ id: profiles.id, fullName: profiles.fullName }).from(profiles).where(eq(profiles.role, "dean"));
    const allAdmins = await db.select({ id: profiles.id, fullName: profiles.fullName }).from(profiles).where(eq(profiles.role, "superadmin"));

    const f = allFaculty.map(u => u.id);
    const hodIds = allHods.map(u => u.id);
    const deanIds = allDeans.map(u => u.id);
    const adminIds = allAdmins.map(u => u.id);

    // ==================== RECOMMENDATIONS (25) ====================
    console.log("📝 Creating recommendations...");
    const recData = [
        { title: "Coursera Machine Learning Specialization", category: "Course", rating: 5, location: "", description: "Andrew Ng's ML specialization is excellent for faculty wanting to integrate ML concepts into their curriculum. Covers supervised/unsupervised learning, neural networks, and practical applications.", authorId: f[0] },
        { title: "IEEE Conference on AI in Education", category: "Conference", rating: 5, location: "Hyderabad International Convention Centre", description: "Upcoming IEEE conference focusing on AI applications in higher education. Great opportunity for paper presentations and networking with international researchers.", authorId: f[1] },
        { title: "Research Methodology Workshop", category: "Workshop", rating: 4, location: "Seminar Hall B, Block 3", description: "A comprehensive 3-day workshop on advanced research methodology, covering qualitative and quantitative methods, literature review techniques, and publication strategies.", authorId: f[2] },
        { title: "Python for Data Science - Textbook", category: "Book", rating: 5, location: "Central Library, Section D", description: "Wes McKinney's 'Python for Data Analysis' is a must-read. Covers pandas, NumPy, and data visualization. Perfect for faculty teaching data science courses.", authorId: f[3] },
        { title: "MATLAB Online License", category: "Tool", rating: 4, location: "", description: "The university's MATLAB online license now supports Simulink and Signal Processing toolbox. Faculty can request access through the IT portal for research and teaching.", authorId: f[4] },
        { title: "Effective Teaching with Active Learning", category: "Teaching", rating: 5, location: "Online - Zoom", description: "Highly recommend the 'Active Learning in STEM' MOOC by MIT. It transformed my lecture delivery. Students are 40% more engaged since I adopted these methods.", authorId: f[5] },
        { title: "National Science Foundation Grant Writing", category: "Research", rating: 4, location: "Admin Block, Room 201", description: "The research office is offering grant writing workshops every Friday. They cover proposal structure, budget planning, and compliance requirements for NSF and DST grants.", authorId: f[6] },
        { title: "Flutter Development for Mobile Apps", category: "Workshop", rating: 5, location: "Computer Lab 4, CSE Block", description: "An intensive workshop on building cross-platform mobile applications with Flutter and Dart. Covers state management, API integration, and deployment strategies.", authorId: f[7] },
        { title: "Cloud Computing with AWS Academy", category: "Course", rating: 4, location: "", description: "AWS Academy offers free cloud computing curriculum for educators. Includes hands-on labs, solution architect certification prep, and classroom-ready materials.", authorId: f[8] },
        { title: "Digital Signal Processing Textbook", category: "Book", rating: 5, location: "Central Library", description: "Oppenheim & Willsky's 'Signals and Systems' remains the gold standard. The 2nd edition has excellent problem sets and MATLAB exercises for lab sessions.", authorId: f[9] },
        { title: "Overleaf for Collaborative Research Papers", category: "Tool", rating: 5, location: "", description: "Overleaf Pro is now available through our institutional license. Enables real-time collaboration on LaTeX documents. Perfect for multi-author research publications.", authorId: f[10] },
        { title: "Blockchain Technology Seminar", category: "Conference", rating: 4, location: "IT Block Auditorium", description: "Industry experts from TCS and Infosys presenting on blockchain applications in supply chain and healthcare. Certificate of participation provided.", authorId: f[11] },
        { title: "Peer Assessment Strategies", category: "Teaching", rating: 4, location: "", description: "Implementing peer assessment in large classrooms has reduced my grading workload by 60% while improving student critical thinking. Sharing my rubric templates.", authorId: f[12] },
        { title: "IoT Lab Equipment Upgrade", category: "Resource", rating: 5, location: "ECE Department, IoT Lab", description: "The new Raspberry Pi 5 kits and Arduino Nano boards are available in the IoT lab. Each kit includes sensors, actuators, and wireless modules for project work.", authorId: f[13] },
        { title: "Springer Nature Database Access", category: "Resource", rating: 5, location: "Digital Library Portal", description: "Our Springer Nature subscription now includes 3,000+ journals and 300,000+ books. Access through the library portal using your SRMAP credentials.", authorId: f[14] },
        { title: "Cybersecurity Awareness Training", category: "Workshop", rating: 4, location: "Online - Microsoft Teams", description: "Mandatory cybersecurity training is now available online. Covers phishing, secure password practices, data protection policy, and incident reporting procedures.", authorId: f[15] },
        { title: "Quantum Computing Fundamentals", category: "Course", rating: 5, location: "", description: "IBM Qiskit course on quantum computing is freely available. Includes hands-on exercises with real quantum hardware. Great for faculty exploring emerging technologies.", authorId: f[16] },
        { title: "3D Printing Lab Access", category: "Resource", rating: 4, location: "Mechanical Workshop, Building 5", description: "The new Prusa MK4 3D printers are operational. Faculty can book slots for prototyping research projects. Supports PLA, PETG, and flexible filaments.", authorId: f[17] },
        { title: "Research Ethics Workshop", category: "Workshop", rating: 5, location: "Conference Room A, Admin Block", description: "Essential workshop on research ethics, data integrity, plagiarism prevention, and responsible conduct of research. Required for all PhD supervisors.", authorId: f[18] },
        { title: "GitHub Classroom for Teaching", category: "Tool", rating: 5, location: "", description: "GitHub Classroom automates assignment distribution, submission, and grading for programming courses. Free for educational institutions. Saves hours per week.", authorId: f[19] },
        { title: "National Education Policy 2020 Discussion", category: "Conference", rating: 4, location: "University Auditorium", description: "Panel discussion on implementing NEP 2020 in engineering education. Topics include multidisciplinary curriculum, research focus, and flexible degree programs.", authorId: f[20] },
        { title: "Mendeley Reference Manager", category: "Tool", rating: 4, location: "", description: "Mendeley is excellent for organizing research papers and generating citations. The desktop app syncs with the web platform. Institutional license available.", authorId: f[21] },
        { title: "Advanced PCB Design Workshop", category: "Workshop", rating: 4, location: "ECE Lab 3", description: "Hands-on workshop on multi-layer PCB design using Altium Designer. Covers schematic capture, component footprints, routing, and manufacturing considerations.", authorId: f[22] },
        { title: "Student Mentoring Best Practices", category: "Teaching", rating: 5, location: "", description: "Sharing a framework for effective student mentoring based on 15 years of experience. Includes meeting templates, progress tracking sheets, and intervention strategies.", authorId: f[23] },
        { title: "NPTEL Course Development Program", category: "Course", rating: 5, location: "NPTEL Studio, CSE Block", description: "Faculty can now create NPTEL courses using our in-house recording studio. IIT Madras provides content review support. Great for national-level teaching recognition.", authorId: f[24] },
    ];

    const insertedRecs = [];
    for (const rec of recData) {
        const [inserted] = await db.insert(recommendations).values(rec).returning();
        insertedRecs.push(inserted);
        // Award 5 points
        await db.update(profiles).set({ points: sql`${profiles.points} + 5` }).where(eq(profiles.id, rec.authorId));
    }
    console.log(`   ✓ Created ${insertedRecs.length} recommendations`);

    // ==================== COMMENTS (40+) ====================
    console.log("💬 Creating comments...");
    const commentTexts = [
        "This is incredibly useful, thank you for sharing!",
        "I've been looking for something like this. Will definitely try it out.",
        "Great recommendation! I attended this last semester and it was worth every minute.",
        "Can you share more details about the registration process?",
        "Excellent resource. I'm incorporating this into my curriculum next semester.",
        "The hands-on component really made a difference in my understanding.",
        "I second this recommendation. Our department has benefited greatly from it.",
        "Would love to collaborate on this. Let's connect!",
        "This aligns perfectly with our department's research focus areas.",
        "Thank you for the detailed description. Very helpful for new faculty.",
        "I've been using this for 2 years now and it's transformative.",
        "Any prerequisites needed before starting this course?",
        "This saved me so much time in my research work.",
        "Brilliant suggestion! Forwarding this to my research group.",
        "How does this compare to the previous version?",
    ];

    let commentCount = 0;
    for (let i = 0; i < insertedRecs.length; i++) {
        const numComments = Math.floor(Math.random() * 4) + 1; // 1-4 comments each
        for (let j = 0; j < numComments; j++) {
            const commenterId = f[(i + j + 3) % f.length];
            const text = commentTexts[(i * 3 + j) % commentTexts.length];
            await db.insert(recommendationComments).values({
                content: text,
                authorId: commenterId,
                recommendationId: insertedRecs[i].id,
            });
            // Award 3 points
            await db.update(profiles).set({ points: sql`${profiles.points} + 3` }).where(eq(profiles.id, commenterId));
            commentCount++;
        }
    }
    console.log(`   ✓ Created ${commentCount} comments`);

    // ==================== UPVOTES (60+) ====================
    console.log("👍 Creating upvotes...");
    let upvoteCount = 0;
    for (let i = 0; i < insertedRecs.length; i++) {
        const numUpvotes = Math.floor(Math.random() * 6) + 2; // 2-7 upvotes each
        const usedVoters = new Set<string>();
        for (let j = 0; j < numUpvotes; j++) {
            const voterId = f[(i + j + 5) % f.length];
            if (usedVoters.has(voterId) || voterId === insertedRecs[i].authorId) continue;
            usedVoters.add(voterId);
            try {
                await db.insert(recommendationUpvotes).values({
                    userId: voterId,
                    recommendationId: insertedRecs[i].id,
                });
                // Award 1 point to author
                await db.update(profiles).set({ points: sql`${profiles.points} + 1` }).where(eq(profiles.id, insertedRecs[i].authorId));
                upvoteCount++;
            } catch { /* skip duplicates */ }
        }
    }
    console.log(`   ✓ Created ${upvoteCount} upvotes`);

    // ==================== QUERIES (20) ====================
    console.log("❓ Creating queries...");
    const queryData = [
        { title: "Wi-Fi connectivity issues in CSE Block", description: "The Wi-Fi in CSE Block, floors 2-4, has been intermittent for the past week. Students and faculty are unable to access online resources during lectures. Need urgent resolution.", type: "IT Support", status: "resolved" as const, response: "The network team has replaced the faulty access points on floors 2-4. Please restart your devices to connect to the updated network. Contact IT helpdesk if issues persist.", authorId: f[0], responderId: hodIds[0] },
        { title: "Request for additional lab hours", description: "The current lab schedule only allows 2 hours per week for Advanced Database Systems. Students need more hands-on practice. Requesting extension to 4 hours.", type: "Academic", status: "in_progress" as const, response: "We are reviewing the lab schedule. Tentatively, Saturday morning slots can be allocated. Will confirm by next week.", authorId: f[1], responderId: hodIds[0] },
        { title: "Projector malfunction in Room 401", description: "The projector in Room 401 is displaying distorted colors and overheating after 30 minutes. This is affecting lecture delivery for 3 courses scheduled in this room.", type: "Infrastructure", status: "resolved" as const, response: "The projector has been replaced with a new Epson EB-X51 unit. Tested and working correctly. Thank you for reporting.", authorId: f[2], responderId: hodIds[1] },
        { title: "Research travel grant application process", description: "I've been accepted to present a paper at IEEE ICSE 2026 in Toronto. What is the process for applying for the university research travel grant? Deadline is approaching.", type: "Administrative", status: "in_progress" as const, response: "Please submit Form RT-2024 along with your acceptance letter to the Research Office. Budget limit is ₹2,00,000 for international conferences.", authorId: f[3], responderId: deanIds[0] },
        { title: "Updated leave policy clarification", description: "The new leave policy circular mentions 'academic duty leave' but doesn't specify if conference attendance counts. Can we get clarification on this category?", type: "Policy", status: "resolved" as const, response: "Conference attendance for paper presentation counts as Academic Duty Leave. You need prior approval from HOD and Dean. Circular addendum has been issued.", authorId: f[4], responderId: deanIds[0] },
        { title: "Request for NVIDIA GPU server access", description: "Our research group is working on deep learning models for medical image analysis. We need access to the NVIDIA A100 GPU server for training. Currently waitlisted.", type: "IT Support", status: "open" as const, response: null, authorId: f[5], responderId: null },
        { title: "Laboratory safety equipment renewal", description: "Fire extinguishers in Chemistry Lab 2 and 3 are past their expiry date. Also, the fume hood ventilation system needs maintenance. Safety audit is due next month.", type: "Infrastructure", status: "in_progress" as const, response: "Maintenance team has been notified. Fire extinguishers will be replaced by Friday. Fume hood servicing scheduled for next week.", authorId: f[6], responderId: hodIds[7] },
        { title: "Curriculum revision for Data Structures", description: "The current Data Structures syllabus hasn't been updated in 5 years. Proposing inclusion of advanced topics: skip lists, B+ trees, persistent data structures, and competitive programming techniques.", type: "Academic", status: "open" as const, response: null, authorId: f[7], responderId: null },
        { title: "Student feedback mechanism improvement", description: "The current paper-based feedback system is inefficient and has low response rates. Proposing migration to an online platform with anonymous responses and real-time analytics.", type: "Administrative", status: "resolved" as const, response: "Approved. We will pilot an online feedback system using Google Forms this semester. IT team will set up institutional accounts. Results dashboard will be shared with HODs.", authorId: f[8], responderId: deanIds[1] },
        { title: "Air conditioning repair in Faculty Room B", description: "The AC unit in Faculty Room B (ECE Block) has been non-functional for 2 weeks. Temperatures are reaching 38°C making it difficult to work during afternoon hours.", type: "Infrastructure", status: "resolved" as const, response: "The compressor has been replaced and the AC is now functional. Please report any further issues to the maintenance helpline at ext. 2234.", authorId: f[9], responderId: hodIds[1] },
        { title: "PhD comprehensive exam scheduling", description: "Three of my PhD scholars are due for comprehensive exams this semester. The examination committee hasn't been constituted yet. Request early formation to avoid delays.", type: "Academic", status: "in_progress" as const, response: "Committee formation is in progress. External examiners from IIT Hyderabad and IIIT have been contacted. Tentative dates: March 15-20.", authorId: f[10], responderId: hodIds[0] },
        { title: "Parking congestion near Engineering Block", description: "The parking area near Engineering Block is severely congested during peak hours (9-10 AM). Faculty are unable to find spots and are late for morning lectures.", type: "Infrastructure", status: "open" as const, response: null, authorId: f[11], responderId: null },
        { title: "Inter-departmental research collaboration", description: "Proposing a formal framework for inter-departmental research projects. Currently, there's no standardized process for shared funding, co-supervision, or resource allocation.", type: "Research", status: "in_progress" as const, response: "This is an excellent initiative. We're drafting a collaborative research MoU template. A committee meeting is scheduled for next Thursday to finalize guidelines.", authorId: f[12], responderId: deanIds[0] },
        { title: "Library operating hours extension", description: "Students and faculty need extended library hours during exam season. Current closing time of 8 PM is too early. Request extension to 11 PM during November-December.", type: "Administrative", status: "resolved" as const, response: "Approved. Library hours will be extended to 11 PM from November 1 to December 15. Additional security staff has been arranged. Digital library remains 24/7.", authorId: f[13], responderId: deanIds[1] },
        { title: "Guest lecture series approval", description: "Planning a guest lecture series on 'Industry 4.0' with speakers from Bosch, TCS, and Siemens. Need approval for budget (₹50,000) and auditorium booking for 5 sessions.", type: "Academic", status: "resolved" as const, response: "Budget approved from the department's guest lecture fund. Auditorium booked for every Wednesday, 3-5 PM, for 5 weeks starting February. Please coordinate with the admin office.", authorId: f[14], responderId: hodIds[0] },
        { title: "Slow internet in research labs", description: "Internet speeds in the research wing have dropped significantly. Download speeds are below 5 Mbps, making it impossible to download datasets or access cloud services.", type: "IT Support", status: "in_progress" as const, response: "Network team is upgrading the fiber connection to the research wing. Expected completion: end of this week. Temporary 4G hotspots have been provided.", authorId: f[15], responderId: hodIds[5] },
        { title: "Exam invigilation duty redistribution", description: "The current invigilation schedule is uneven. Some faculty have 8 slots while others have only 2. Request fair redistribution based on teaching load and other duties.", type: "Administrative", status: "open" as const, response: null, authorId: f[16], responderId: null },
        { title: "Software license for ANSYS", description: "Our Mechanical department needs 10 additional ANSYS simulation licenses for the new CAE lab. Current 5 licenses create bottlenecks during lab sessions with 30+ students.", type: "IT Support", status: "in_progress" as const, response: "Procurement process initiated. Academic pricing quote received from ANSYS. Expected delivery in 3 weeks. Meanwhile, staggered lab sessions are recommended.", authorId: f[17], responderId: hodIds[2] },
        { title: "Faculty development program suggestion", description: "Suggesting a monthly 'Teaching Innovation' FDP where faculty share successful pedagogical experiments. This creates a culture of continuous improvement and peer learning.", type: "Academic", status: "resolved" as const, response: "Wonderful idea! Approved. First session scheduled for February 28. Each month, 2 faculty will present 20-minute sessions. Certificates will be provided. Please volunteer for the first session.", authorId: f[18], responderId: deanIds[0] },
        { title: "Broken chairs in Lecture Hall 5", description: "Approximately 15 chairs in Lecture Hall 5 are broken or wobbly. Students have reported minor injuries. This is a safety concern that needs immediate attention.", type: "Infrastructure", status: "resolved" as const, response: "All 15 broken chairs have been replaced with new ones. A monthly furniture inspection schedule has been created. Please report any issues immediately via the maintenance portal.", authorId: f[19], responderId: hodIds[3] },
    ];

    for (const q of queryData) {
        await db.insert(queries).values(q);
        await db.update(profiles).set({ points: sql`${profiles.points} + 3` }).where(eq(profiles.id, q.authorId));
    }
    console.log(`   ✓ Created ${queryData.length} queries`);

    // ==================== FACULTY EVENTS (30) ====================
    console.log("📅 Creating faculty events...");
    const eventData = [
        { facultyId: f[0], title: "ML Research Paper Submission Deadline", description: "Submit final draft to IEEE Transactions on Neural Networks", eventDate: "2026-03-15", reminderDate: "2026-03-10" },
        { facultyId: f[0], title: "PhD Scholar Review Meeting", description: "Quarterly progress review with Ravi and Meera", eventDate: "2026-03-05", reminderDate: "2026-03-03" },
        { facultyId: f[1], title: "Conference Presentation Prep", description: "Rehearsal for IEEE ICSE presentation", eventDate: "2026-03-20", reminderDate: "2026-03-18" },
        { facultyId: f[1], title: "Department Meeting", description: "Monthly department faculty meeting", eventDate: "2026-02-28", reminderDate: "2026-02-27" },
        { facultyId: f[2], title: "Guest Lecture - Dr. Smith", description: "Arrange AV setup and refreshments", eventDate: "2026-03-10", reminderDate: "2026-03-08" },
        { facultyId: f[3], title: "Mid-Semester Exam Paper Setting", description: "Prepare question paper for Data Science course", eventDate: "2026-03-01", reminderDate: "2026-02-25" },
        { facultyId: f[4], title: "Lab Equipment Procurement Review", description: "Review quotes for new oscilloscopes", eventDate: "2026-03-12", reminderDate: "2026-03-10" },
        { facultyId: f[5], title: "NAAC Documentation Review", description: "Complete criteria 3 documentation", eventDate: "2026-03-25", reminderDate: "2026-03-20" },
        { facultyId: f[6], title: "Student Project Reviews", description: "Final year project mid-review presentations", eventDate: "2026-03-08", reminderDate: "2026-03-06" },
        { facultyId: f[7], title: "Flutter Workshop Prep", description: "Prepare materials and VM images for workshop", eventDate: "2026-02-25", reminderDate: "2026-02-23" },
        { facultyId: f[8], title: "AWS Academy Module Update", description: "Update lab exercises for new AWS console UI", eventDate: "2026-03-18", reminderDate: "2026-03-15" },
        { facultyId: f[9], title: "Research Grant Proposal Deadline", description: "DST SERB proposal submission", eventDate: "2026-04-01", reminderDate: "2026-03-25" },
        { facultyId: f[10], title: "PhD Comprehensive Exam", description: "External examiner arriving from IIT Hyderabad", eventDate: "2026-03-15", reminderDate: "2026-03-12" },
        { facultyId: f[11], title: "Blockchain Seminar Coordination", description: "Confirm speakers and logistics", eventDate: "2026-03-05", reminderDate: "2026-03-01" },
        { facultyId: f[12], title: "Peer Assessment Rubric Review", description: "Update rubrics for Communication Skills course", eventDate: "2026-02-28", reminderDate: "2026-02-26" },
        { facultyId: f[0], title: "Faculty Development Program Talk", description: "Present on 'AI in Classroom Assessment'", eventDate: "2026-02-28", reminderDate: "2026-02-26" },
        { facultyId: f[3], title: "Textbook Review Committee", description: "Review proposed textbooks for next semester", eventDate: "2026-03-22", reminderDate: "2026-03-20" },
        { facultyId: f[5], title: "Summer Internship Mentor Assignment", description: "Assign faculty mentors for 50 student interns", eventDate: "2026-04-10", reminderDate: "2026-04-05" },
        { facultyId: f[8], title: "Cloud Lab Infrastructure Setup", description: "Configure AWS Academy lab environment", eventDate: "2026-03-02", reminderDate: "2026-02-28" },
        { facultyId: f[14], title: "Guest Lecture - Bosch Speaker", description: "Industry 4.0 lecture series Session 1", eventDate: "2026-03-05", reminderDate: "2026-03-03" },
    ];

    for (const ev of eventData) {
        await db.insert(facultyEvents).values(ev);
    }
    console.log(`   ✓ Created ${eventData.length} faculty events`);

    // ==================== ACADEMIC EVENTS (15) ====================
    console.log("🏫 Creating academic events...");
    const adminId = adminIds[0];
    const acaEvents = [
        { title: "Mid-Semester Examinations", description: "Mid-semester exams for all departments. Invigilation duties assigned.", startDate: "2026-03-10", endDate: "2026-03-20", category: "Exam", createdBy: adminId },
        { title: "Holi Festival Holiday", description: "University closed for Holi celebrations.", startDate: "2026-03-14", endDate: "2026-03-14", category: "Holiday", createdBy: adminId },
        { title: "Annual Tech Fest - EPOCH 2026", description: "Three-day national level technical festival with coding competitions, hackathons, robotics, and guest lectures.", startDate: "2026-03-25", endDate: "2026-03-27", category: "Cultural", createdBy: adminId },
        { title: "NAAC Review Visit", description: "NAAC peer team visit for institutional accreditation. All departments must prepare documentation.", startDate: "2026-04-05", endDate: "2026-04-07", category: "Meeting", createdBy: adminId },
        { title: "End-Semester Examinations", description: "Final examinations for Even Semester 2025-26.", startDate: "2026-05-01", endDate: "2026-05-15", category: "Exam", createdBy: adminId },
        { title: "Faculty Development Program", description: "One-week FDP on 'Outcome Based Education and NBA Accreditation'.", startDate: "2026-04-14", endDate: "2026-04-18", category: "Workshop", createdBy: adminId },
        { title: "University Foundation Day", description: "Annual celebration of university founding. Chief guest: Dr. APJ Abdul Kalam Memorial Lecture.", startDate: "2026-04-22", endDate: "2026-04-22", category: "Cultural", createdBy: adminId },
        { title: "Research Scholars Symposium", description: "Annual symposium for PhD scholars to present their research progress. External evaluators invited.", startDate: "2026-04-10", endDate: "2026-04-11", category: "Conference", createdBy: adminId },
        { title: "Ugadi Holiday", description: "University closed for Ugadi / Telugu New Year.", startDate: "2026-03-29", endDate: "2026-03-29", category: "Holiday", createdBy: adminId },
        { title: "Summer Semester Registration", description: "Registration deadline for summer semester courses. Late fee applicable after this date.", startDate: "2026-05-20", endDate: "2026-05-22", category: "Deadline", createdBy: adminId },
        { title: "Inter-University Sports Meet", description: "SRMAP hosting the South Zone inter-university athletics and cricket tournament.", startDate: "2026-04-01", endDate: "2026-04-03", category: "Sports", createdBy: adminId },
        { title: "Board of Studies Meeting", description: "Annual BoS meeting for curriculum review across all departments.", startDate: "2026-03-28", endDate: "2026-03-28", category: "Meeting", createdBy: adminId },
        { title: "International Conference on Sustainable Engineering", description: "Two-day international conference on green technology and sustainable engineering practices.", startDate: "2026-04-25", endDate: "2026-04-26", category: "Conference", createdBy: adminId },
        { title: "Placement Drive - TCS & Infosys", description: "Campus recruitment drive. Pre-placement talks on April 14, interviews on April 15-16.", startDate: "2026-04-14", endDate: "2026-04-16", category: "Meeting", createdBy: adminId },
        { title: "Good Friday Holiday", description: "University closed for Good Friday.", startDate: "2026-04-03", endDate: "2026-04-03", category: "Holiday", createdBy: adminId },
    ];

    for (const ev of acaEvents) {
        await db.insert(academicEvents).values(ev);
    }
    console.log(`   ✓ Created ${acaEvents.length} academic events`);

    // ==================== NOTIFICATIONS (sample) ====================
    console.log("🔔 Creating notifications...");
    const notifData = [
        { userId: f[0], title: "New Comment", message: "Prof. Chandra Reddy commented on your recommendation 'Coursera ML Specialization'", isRead: false },
        { userId: f[0], title: "Upvote Received", message: "Prof. Divya Patel upvoted your recommendation 'Coursera ML Specialization'", isRead: false },
        { userId: f[1], title: "Query Updated", message: "Your query 'Request for additional lab hours' status changed to In Progress", isRead: true },
        { userId: f[2], title: "Query Resolved", message: "Your query about projector malfunction has been resolved", isRead: true },
        { userId: f[3], title: "New Academic Event", message: "A new academic event 'Mid-Semester Examinations' has been added.", isRead: false },
        { userId: f[5], title: "New Comment", message: "Prof. Ganesh Gupta commented on your recommendation 'Effective Teaching with Active Learning'", isRead: false },
        { userId: f[7], title: "Upvote Received", message: "3 people upvoted your recommendation 'Flutter Development for Mobile Apps'", isRead: true },
        { userId: f[8], title: "Query Updated", message: "Your query about student feedback mechanism has been resolved by the Dean", isRead: false },
        { userId: f[10], title: "New Academic Event", message: "PhD Comprehensive Exam scheduled for March 15-20", isRead: false },
        { userId: f[12], title: "Upvote Received", message: "Prof. Nandini Iyer upvoted your recommendation 'Peer Assessment Strategies'", isRead: false },
        ...f.slice(0, 15).map((uid, i) => ({
            userId: uid,
            title: "New Academic Event",
            message: "A new academic event 'Annual Tech Fest - EPOCH 2026' has been added.",
            isRead: i % 3 === 0,
        })),
    ];

    for (const n of notifData) {
        await db.insert(notifications).values(n);
    }
    console.log(`   ✓ Created ${notifData.length} notifications`);

    console.log("\n✅ All showcase data seeded successfully!");
    console.log("🎉 Your ACADLY platform is ready for demo!\n");
    process.exit(0);
}

seedData().catch((err) => {
    console.error("❌ Seed data failed:", err);
    process.exit(1);
});
