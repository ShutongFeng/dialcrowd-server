module.exports = {
  // mongoURI: 'mongodb+srv://dialcrowd:password@cluster0.xxx.mongodb.net/dialcrowd?retryWrites=true'
  mongoURI: "mongodb://" + process.env.mongoURI + "/dialcrowd",
};
