module.exports = {
  // mongoURI: 'mongodb+srv://dialcrowd:password@cluster0.xxx.mongodb.net/dialcrowd?retryWrites=true'
  mongoURI:
    "mongodb://" +
    process.env.mongoUserName +
    ":" +
    process.env.mongoPWD +
    "@" +
    process.env.mongoURI +
    "/test?retryWrites=true",
};
