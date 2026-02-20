import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { profiles } from "../shared/schema";

async function seed() {
    console.log("🌱 Seeding database...");

    // Hash passwords
    const facultyHash = await bcrypt.hash("faculty@789", 10);
    const hodHash = await bcrypt.hash("murali@123", 10);
    const deanHash = await bcrypt.hash("dean@123", 10);
    const adminHash = await bcrypt.hash("admin@123", 10);

    // ==================== ADMIN ====================
    const admins = [
        { fullName: "Dr. Rajesh Kumar (Admin)", email: "admin@srmap.edu.in", passwordHash: adminHash, role: "superadmin" as const, points: 0 },
        { fullName: "Prof. Anita Sharma (Admin)", email: "admin2@srmap.edu.in", passwordHash: adminHash, role: "superadmin" as const, points: 0 },
    ];

    // ==================== DEANS ====================
    const deans = [
        { fullName: "Dr. Venkatesh Prasad", email: "dean.engineering@srmap.edu.in", passwordHash: deanHash, role: "dean" as const, points: 45 },
        { fullName: "Dr. Lakshmi Narayanan", email: "dean.science@srmap.edu.in", passwordHash: deanHash, role: "dean" as const, points: 38 },
        { fullName: "Dr. Padma Reddy", email: "dean.arts@srmap.edu.in", passwordHash: deanHash, role: "dean" as const, points: 30 },
    ];

    // ==================== HODs ====================
    const hods = [
        { fullName: "Dr. Murali Krishna", email: "hod.cse@srmap.edu.in", passwordHash: hodHash, role: "hod" as const, points: 52 },
        { fullName: "Dr. Suresh Babu", email: "hod.ece@srmap.edu.in", passwordHash: hodHash, role: "hod" as const, points: 41 },
        { fullName: "Dr. Priya Mehta", email: "hod.mech@srmap.edu.in", passwordHash: hodHash, role: "hod" as const, points: 35 },
        { fullName: "Dr. Ramesh Gupta", email: "hod.civil@srmap.edu.in", passwordHash: hodHash, role: "hod" as const, points: 28 },
        { fullName: "Dr. Kavitha Rao", email: "hod.eee@srmap.edu.in", passwordHash: hodHash, role: "hod" as const, points: 33 },
        { fullName: "Dr. Srinivas Iyengar", email: "hod.it@srmap.edu.in", passwordHash: hodHash, role: "hod" as const, points: 47 },
        { fullName: "Dr. Deepa Nair", email: "hod.physics@srmap.edu.in", passwordHash: hodHash, role: "hod" as const, points: 25 },
        { fullName: "Dr. Arun Joshi", email: "hod.chemistry@srmap.edu.in", passwordHash: hodHash, role: "hod" as const, points: 22 },
        { fullName: "Dr. Meena Sundaram", email: "hod.maths@srmap.edu.in", passwordHash: hodHash, role: "hod" as const, points: 30 },
        { fullName: "Dr. Vijay Shankar", email: "hod.biotech@srmap.edu.in", passwordHash: hodHash, role: "hod" as const, points: 19 },
    ];

    // ==================== FACULTY (100 professors) ====================
    const departments = ["CSE", "ECE", "MECH", "CIVIL", "EEE", "IT", "Physics", "Chemistry", "Maths", "Biotech"];
    const firstNames = [
        "Aditya", "Bharath", "Chandra", "Divya", "Esha", "Farhan", "Ganesh", "Harini", "Ishaan", "Jaya",
        "Karthik", "Lavanya", "Manoj", "Nandini", "Om", "Pallavi", "Qadir", "Rohit", "Sanjana", "Tarun",
        "Uma", "Varun", "Waqar", "Yamini", "Zara", "Akhil", "Bhavani", "Chirag", "Devi", "Eshwar",
        "Fathima", "Girish", "Hema", "Indira", "Jagdish", "Kamala", "Laxman", "Mala", "Naresh", "Omkar",
        "Pavan", "Radhika", "Sachin", "Tanvi", "Uday", "Vidya", "Wasim", "Yash", "Aarav", "Bhanu",
        "Charu", "Daksh", "Ekta", "Feroz", "Gauri", "Hari", "Ira", "Jayant", "Keerthi", "Lokesh",
        "Madhavi", "Naveen", "Oviya", "Pranav", "Rekha", "Sagar", "Tulasi", "Ujjwal", "Vani", "Yuvraj",
        "Abhinav", "Bindu", "Chandrashekhar", "Devika", "Elango", "Fatima", "Gopal", "Hemant", "Indrajit", "Janaki",
        "Kiran", "Leena", "Mohan", "Nalini", "Ojas", "Pooja", "Rajan", "Sneha", "Trilok", "Urmila",
        "Venkat", "Waheed", "Yashoda", "Zubin", "Arvind", "Brinda", "Chetan", "Durga", "Eswar", "Faisal",
    ];
    const lastNames = [
        "Sharma", "Patel", "Reddy", "Kumar", "Nair", "Rao", "Gupta", "Iyer", "Singh", "Joshi",
        "Pillai", "Menon", "Das", "Bhatt", "Mishra", "Verma", "Saxena", "Kapoor", "Mukherjee", "Chatterjee",
        "Bose", "Sen", "Ghosh", "Banerjee", "Dutta", "Roy", "Pandey", "Tiwari", "Agarwal", "Srinivasan",
        "Subramanian", "Raman", "Krishnamurthy", "Natarajan", "Venkatesan", "Balakrishnan", "Raghavan", "Sundaram", "Narayan", "Prasad",
        "Chakraborty", "Khanna", "Malhotra", "Sethi", "Bhatia", "Tandon", "Mehra", "Kulkarni", "Deshmukh", "Patil",
    ];

    const faculty = [];
    for (let i = 0; i < 100; i++) {
        const first = firstNames[i];
        const last = lastNames[i % lastNames.length];
        const dept = departments[i % departments.length];
        const points = Math.floor(Math.random() * 80) + 1; // 1-80 points

        faculty.push({
            fullName: `Prof. ${first} ${last}`,
            email: `${first.toLowerCase()}.${last.toLowerCase()}@srmap.edu.in`,
            passwordHash: facultyHash,
            role: "faculty" as const,
            points,
        });
    }

    // Insert all profiles
    const allProfiles = [...admins, ...deans, ...hods, ...faculty];

    console.log(`📝 Inserting ${allProfiles.length} profiles...`);
    console.log(`   - ${admins.length} Admins (superadmin)`);
    console.log(`   - ${deans.length} Deans`);
    console.log(`   - ${hods.length} HODs`);
    console.log(`   - ${faculty.length} Faculty`);

    // Insert in batches of 20
    for (let i = 0; i < allProfiles.length; i += 20) {
        const batch = allProfiles.slice(i, i + 20);
        await db.insert(profiles).values(batch);
        console.log(`   ✓ Inserted batch ${Math.floor(i / 20) + 1}/${Math.ceil(allProfiles.length / 20)}`);
    }

    console.log("\n✅ Seeding complete!");
    console.log("\n📋 Login Credentials:");
    console.log("   Admin:   admin@srmap.edu.in / admin@123");
    console.log("   Dean:    dean.engineering@srmap.edu.in / dean@123");
    console.log("   HOD:     hod.cse@srmap.edu.in / murali@123");
    console.log("   Faculty: aditya.sharma@acadly.edu / faculty@789");

    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
