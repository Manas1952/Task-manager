const mongoose = require("mongoose")

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true
})

// C:/Users/Manas/mongodb/bin/mongod.exe --dbpath=C:/Users/Manas/mongodb-data