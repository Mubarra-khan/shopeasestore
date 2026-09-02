#!/usr/bin/env node

require("dotenv").config();
const connectDB = require("../src/config/db");
const User = require("../src/models/user.model");
const bcrypt = require("bcrypt");

async function main() {
  if (process.env.NODE_ENV !== "development") {
    console.error(
      'Refusing to run: NODE_ENV is not "development". Set NODE_ENV=development to run this script.'
    );
    process.exit(1);
  }

  const argName = process.argv[2];
  const argEmail = process.argv[3];
  const argPassword = process.argv[4];

  const name = process.env.ADMIN_NAME || argName;
  const email = process.env.ADMIN_EMAIL || argEmail;
  const password = process.env.ADMIN_PASSWORD || argPassword;

  if (!name || !email || !password) {
    console.error(
      "Missing admin details. Provide ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD env vars or pass them as args:"
    );
    console.error(
      '  node scripts/create_admin.js "Admin Name" "admin@example.com" "password"'
    );
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    console.error("User with that email already exists. Aborting.");
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashed,
    role: "admin",
  });

  console.log("Admin test user created successfully.");
  console.log("ID:", user._id.toString());
  console.log("Email:", user.email);
  console.log("Use the existing POST /api/users/login endpoint to receive an admin JWT.");

  process.exit(0);
}

main().catch((error) => {
  console.error("Error creating admin:", error.message || error);
  process.exit(1);
});
