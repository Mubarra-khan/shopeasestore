require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function inspect() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to:", mongoose.connection.name);

  const db = mongoose.connection.db;
  
  // Test 1: Check if we can find known users
  const testEmails = [
    "admin@example.com",
    "securitytest@example.com", 
    "seller@example.com",
    "seller2@example.com",
    "mubarrabashir5@gmail.com"
  ];
  
  console.log("\n=== User Lookup Tests ===");
  for (const email of testEmails) {
    const user = await db.collection("users").findOne({ email });
    if (user) {
      console.log(`✓ Found ${email} (role: ${user.role}, pass len: ${user.password.length})`);
      console.log(`  hash prefix: ${user.password.substring(0, 20)}...`);
      
      // Test bcrypt validity
      try {
        const isValid = await bcrypt.compare("password123", user.password);
        console.log(`  bcrypt.compare('password123'): ${isValid}`);
      } catch (e) {
        console.log(`  bcrypt.compare error: ${e.message}`);
      }
    } else {
      console.log(`✗ NOT found: ${email}`);
    }
  }

  // Test 2: Check the test user with plaintext password
  console.log("\n=== Plaintext Password Test ===");
  const plainUser = await db.collection("users").findOne({ email: "test@example.com" });
  if (plainUser) {
    console.log(`Found test@example.com with password: "${plainUser.password}"`);
    console.log(`Password length: ${plainUser.password.length}`);
  }

  // Test 3: Count by role
  console.log("\n=== Role Counts ===");
  const roles = await db.collection("users").aggregate([
    { $group: { _id: "$role", count: { $sum: 1 } } }
  ]).toArray();
  for (const r of roles) {
    console.log(`  ${r._id}: ${r.count}`);
  }

  // Test 4: Check if any user has non-bcrypt password (not starting with $2b$)
  console.log("\n=== Non-bcrypt Passwords ===");
  const nonBcrypt = await db.collection("users").find({
    $or: [
      { password: { $not: { $regex: /^\$2[aby]\$/ } } },
      { password: { $exists: false } },
      { password: null }
    ]
  }).toArray();
  console.log(`Users with non-standard password hashes: ${nonBcrypt.length}`);
  for (const u of nonBcrypt) {
    console.log(`  - ${u.email}: "${u.password}" (len: ${u.password ? u.password.length : 0})`);
  }

  // Test 5: Check for empty/missing passwords
  console.log("\n=== Missing/Empty Passwords ===");
  const missingPass = await db.collection("users").find({
    $or: [
      { password: "" },
      { password: { $exists: false } }
    ]
  }).toArray();
  console.log(`Users with missing/empty password: ${missingPass.length}`);

  await mongoose.disconnect();
}

inspect().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
