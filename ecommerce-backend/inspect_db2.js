require("dotenv").config();
const mongoose = require("mongoose");

async function inspect() {
  const uri = process.env.MONGO_URI;
  await mongoose.connect(uri);

  const dbName = mongoose.connection.name;
  console.log("Connected database:", dbName);

  // Check both test and ecommerce databases
  for (const targetDbName of ["test", "ecommerce"]) {
    const db = mongoose.connection.client.db(targetDbName);
    try {
      const count = await db.collection("users").countDocuments({});
      console.log(`\nDatabase "${targetDbName}" users count:`, count);
      
      const admins = await db.collection("users").find({ role: "admin" }).toArray();
      console.log(`Admins in "${targetDbName}":`, admins.length);
      for (const a of admins) {
        console.log(`  - ${a.email} (pass len: ${a.password ? a.password.length : 0})`);
      }
      
      const sellers = await db.collection("users").find({ role: "seller" }).toArray();
      console.log(`Sellers in "${targetDbName}":`, sellers.length);
      for (const s of sellers) {
        console.log(`  - ${s.email} (pass len: ${s.password ? s.password.length : 0})`);
      }
    } catch (e) {
      console.log(`Error checking ${targetDbName}:`, e.message);
    }
  }

  await mongoose.disconnect();
}

inspect().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
