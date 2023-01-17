const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
  } catch(err) {
    console.log(`Error: ${err.message}`);
  }
};

module.exports = connectDB;
