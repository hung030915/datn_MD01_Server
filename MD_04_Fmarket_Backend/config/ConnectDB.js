const mongoose = require("mongoose");

mongoose
  .connect(process.env.URL_MONGODB)
  .then(() => console.log("connect successfully ✅ !!!"))
  .catch((err) => console.log("connect failed ❌: ", err));

module.exports = {
  mongoose,
};
