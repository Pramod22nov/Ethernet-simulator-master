const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Queue to track ongoing communications
let communicationQueue = [];

const scheduleCommunication = (start, end, msg, res = null) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const time = msg.split(" ").length;
  const endTime = currentTime + time;
  let mini = Math.min(start, end), maxi = Math.max(start, end);
  let overlappingComm = false;

  // Clean up expired communications
  communicationQueue = communicationQueue.filter(comm => comm.endTime > currentTime);

  // Check for collision
  for (let i = 0; i < communicationQueue.length; i++) {
    let { start: startOld, end: endOld } = communicationQueue[i];
    let miniOld = Math.min(startOld, endOld), maxiOld = Math.max(startOld, endOld);

    if ((miniOld <= mini && mini <= maxiOld) || (miniOld <= maxi && maxi <= maxiOld) || 
        (mini <= miniOld && maxiOld <= maxi) || (miniOld <= mini && maxi <= maxiOld)) {
      overlappingComm = true;
      break;
    }
  }

  if (overlappingComm) {
    // Handle collision

    const backoffTime1 = Math.floor(Math.random() * 20) + 1;

    setTimeout(() => scheduleCommunication(start, end, msg), backoffTime1 * 1000);
    
    console.log(`Collision detected and transmissions have stopped! \nMessage from ${start} to ${end} will start after backoff of ${backoffTime1}s.`)
    if (res) {
      return res.status(409).json({
        message: `Collision detected and transmissions have stopped! \nMessage from ${start} to ${end} will start after backoff of ${backoffTime1}s.`, 
        backoffTimes: { backoffTime: backoffTime1, Message: msg },
      });
    }
    return;
  }

  // Add new communication
  communicationQueue.push({ start, end, endTime, msg });

  if (res) {
    return res.status(200).json({
      message: `Communication between PC ${start} and PC ${end} started successfully.`,
      time,
      details: { start, end },
    });
  }
};

// Function to periodically clean up expired transmissions
const cleanUpTransmissions = () => {
  const currentTime = Math.floor(Date.now() / 1000);
  const expiredTransmissions = communicationQueue.filter(comm => comm.endTime <= currentTime);

  // Remove expired transmissions from the queue
  communicationQueue = communicationQueue.filter(comm => comm.endTime > currentTime);

  // Log information about expired transmissions
  expiredTransmissions.forEach(({ start, end }) => {
    console.log(`Communication between PC ${start} and PC ${end} completed.`);
  });
};

// Start the periodic cleanup with setInterval
setInterval(cleanUpTransmissions, 1000);


// API endpoint
app.post("/api/communicate", (req, res) => {
  const { start, end, msg } = req.body;

  if (!start || !end || !msg) {
    return res.status(400).json({ message: "Please provide start, end, and msg parameters." });
  }

  scheduleCommunication(start, end, msg, res);
});


app.get("/api/status", (req, res) => {
  const currentTime = Math.floor(Date.now() / 1000); // Get the current time in seconds
  const activeCommunications = communicationQueue.map((comm) => ({
    start: comm.start,
    end: comm.end,
    remainingTime: Math.max(0, comm.endTime - currentTime), // Remaining time in seconds
  }));
  res.status(200).json({ activeCommunications });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
