# Communication Scheduler API

This is a simple Node.js application that simulates a communication scheduler between PCs. The application handles message transmissions, checks for collisions, and schedules retries using a random backoff strategy. 

## Features
- Schedules communications between PCs with dynamic message duration.
- Detects and resolves communication collisions using backoff.
- Provides real-time status of active communications.
- Automatically cleans up expired communications.

## Prerequisites
1. Node.js (version 12 or later)
2. npm (Node Package Manager)

## Installation
1. Clone or download the repository.
2. Navigate to the project folder in your terminal.
3. Run the following command to install dependencies:

## Running the Application
1. Start the server using the command:
- npm i
- npm start
2. The server will start on `http://localhost:5000`.

## API Endpoints

### 1. Schedule Communication
**URL:** `/api/communicate`  
**Method:** POST  
**Description:** Schedule a communication between two PCs.  

**Request Body:**  
```json
{
"start": 1,
"end": 2,
"msg": "Hello World"
}

{
  "message": "Communication between PC 1 and PC 2 started successfully.",
  "time": 2,
  "details": {
    "start": 1,
    "end": 2
  }
}

{
  "message": "Collision detected and two transmissions have stopped! Message from 1 to 3 will start after backoff of 5s. Message from 2 to 4 will start after backoff of 10s.",
  "backoffTimes": {
    "oldMessage": "Old message content",
    "newMessage": "New message content"
  }
}

{
  "activeCommunications": [
    {
      "start": 1,
      "end": 2,
      "remainingTime": 5
    }
  ]
}
