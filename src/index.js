import dotenv from "dotenv";
import { app } from "./app.js"; // Import express
import logger from "./logger.js"; // Assuming you have a logger.js file set up for custom logging;
import morgan from "morgan";
import connectDB from "./db/index.js";

// Morgan format for logging requests
const morganFormat = ":method :url :status :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

// start

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 8001;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      // logger.info(`Server is running on port : ${PORT}`);
      console.log(`Server is running on port : ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDb connection error", err);
  });
