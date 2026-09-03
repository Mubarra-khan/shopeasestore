const mongoose = require("mongoose");

let connectionPromise = null;

const connectDB = async () => {
  const beforeReadyState = mongoose.connection.readyState;
  const hasDb = !!mongoose.connection.db;
  const connectionHost = mongoose.connection.host;
  const connectionPort = mongoose.connection.port;
  const connectionName = mongoose.connection.name;

  console.log(`[db] connectDB called | readyState=${beforeReadyState} | hasDb=${hasDb} | connectionPromiseExists=${connectionPromise !== null}`);

  if (connectionPromise && beforeReadyState === 1 && hasDb) {
    console.log(`[db] Reusing existing connection | host=${connectionHost} | port=${connectionPort} | db=${connectionName}`);
    return connectionPromise;
  }

  if (connectionPromise) {
    console.log(`[db] Existing connectionPromise exists but readyState=${beforeReadyState} hasDb=${hasDb} - creating new connection`);
  } else {
    console.log(`[db] No connectionPromise exists - creating new connection`);
  }

  connectionPromise = mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  }).then(() => {
    const afterReadyState = mongoose.connection.readyState;
    const afterDb = !!mongoose.connection.db;
    const afterHost = mongoose.connection.host;
    const afterPort = mongoose.connection.port;
    const afterName = mongoose.connection.name;
    console.log(`✅ MongoDB Connected | readyState=${afterReadyState} | hasDb=${afterDb} | host=${afterHost} | port=${afterPort} | db=${afterName}`);
  }).catch((error) => {
    console.log(`❌ Database Connection Error: ${error.message}`);
    connectionPromise = null;
    throw error;
  });

  return connectionPromise;
};

mongoose.connection.on("connected", () => {
  console.log(`[db] mongoose event connected | readyState=${mongoose.connection.readyState} | host=${mongoose.connection.host} | db=${mongoose.connection.name}`);
});
mongoose.connection.on("disconnected", () => {
  console.log(`[db] mongoose event disconnected | readyState=${mongoose.connection.readyState}`);
});
mongoose.connection.on("error", (error) => {
  console.log(`[db] mongoose event error | message=${error.message}`);
});

module.exports = connectDB;
