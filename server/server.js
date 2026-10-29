import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import { millisecondsUntilNextIndiaMidnight, rotateBothGenders } from "./services/ootdRotationService.js";

const PORT = process.env.PORT || 5000;

function startLocalOOTDRotation() {
  const run = async () => {
    let retry = false;
    try {
      await rotateBothGenders();
    } catch (error) {
      retry = true;
      console.error("Local daily OOTD rotation failed:", error);
    }
    setTimeout(run, retry ? 30_000 : millisecondsUntilNextIndiaMidnight());
  };
  void run();
}

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    if (!process.env.VERCEL) startLocalOOTDRotation();
  })
  .catch(() => {
    process.exit(1);
  });
