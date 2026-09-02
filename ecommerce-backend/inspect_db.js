require("dotenv").config();
const mongoose = require("mongoose");

async function inspect() {
  const uri = process.env.MONGO_URI;
  console.log("Connecting to:", uri.replace(/\/\/.*@/, "//***@"));

  await mongoose.connect(uri);

  const dbName = mongoose.connection.name;
  console.log("\nDatabase connected:", dbName);
  console.log("Databases available:");
  const admin = mongoose.connection.db;
  const dbs = await admin.admin().listDatabases();
  for (const d of dbs.databases) {
    console.log(" -", d.name);
  }

  const db = mongoose.connection.db;
  const users = await db.collection("users").find({}).toArray();
  console.log("\nUsers found:", users.length);
  for (const u of users) {
    console.log(" - name:", u.name);
    console.log("   email:", u.email);
    console.log("   role:", u.role);
    console.log("   password length:", u.password ? u.password.length : 0);
    console.log("   password prefix:", u.password ? u.password.substring(0, 30) : "MISSING");
  }

  await mongoose.disconnect();
  console.log("\nDisconnected.");
}

inspect().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
