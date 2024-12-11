import React, { useState, useRef } from "react";
import axios from "axios";

import "./App.css";

const EthernetSimulator = () => {
  const [sender, setSender] = useState(null);
  const [message, setMessage] = useState("");
  const [log, setLog] = useState([]);
  const packetRef = useRef(null);
  
  const numComputers = 6;

  const updateLog = (msg) => {
    setLog((prevLog) => [...prevLog, msg]);
  };

  const handleComputerSelect = async (id) => {
    if (!sender) {
      setSender(id);
      updateLog(`PC ${id} selected as sender.`);
    } else if (sender === id) {
      updateLog(`PC ${id} is already the sender.`);
    } else {
      if (!message.trim()) {
        updateLog("Error: Message cannot be empty. Please enter a message.");
        return;
      }
      updateLog(`PC ${id} selected as receiver. Starting transmission...`);
      
      try {
        const response = await axios.post("http://localhost:3000/api/communicate", {
          start: sender,
          end: id,
          msg: message.trim(),
        });
        updateLog(response.data.message);
        handleTransmission(sender, id, message.trim(), response.data.backoffTimes);
        setSender(null);
      } catch (error) {
        updateLog("Error: " + (error.response?.data?.message || "Unknown error"));
      }
    }
  };
  

  const handleTransmission = (sender, receiver, message, backoffTimes) => {
    updateLog("Dividing message into packets...");

    animatePacketMovement(sender, receiver);

    setTimeout(() => {
      updateLog(Packet from PC ${sender} successfully received by PC ${receiver}.);
    }, 1000);

    if (backoffTimes) {
      updateLog("Collision detected. Waiting for backoff...");

      setTimeout(() => {
        updateLog(Retrying transmission from PC ${sender} to PC ${receiver} after ${backoffTimes.oldMessage}s delay.);
        animatePacketMovement(sender, receiver);
      }, backoffTimes.oldMessage * 1000);

      setTimeout(() => {
        updateLog(Retrying transmission from PC ${sender} to PC ${receiver} after ${backoffTimes.newMessage}s delay.);
        animatePacketMovement(sender, receiver);
      }, backoffTimes.newMessage * 1000);
    }
  };

  const animatePacketMovement = (sender, receiver) => {
    const computers = document.querySelectorAll(".computer");

    const startPos = computers[sender - 1].offsetLeft + computers[sender - 1].offsetWidth / 2;
    const endPos = computers[receiver - 1].offsetLeft + computers[receiver - 1].offsetWidth / 2;

    const packet = packetRef.current;
    let currentPos = startPos;

    packet.style.display = "block";
    packet.style.left = ${startPos}px;

    const movePacket = setInterval(() => {
      currentPos += 10 * (startPos < endPos ? 1 : -1); 
      packet.style.left = ${currentPos}px;

      if ((startPos < endPos && currentPos >= endPos) || (startPos > endPos && currentPos <= endPos)) {
        clearInterval(movePacket);
        packet.style.display = "none";
      }
    }, 50);
  };

  return (
    <div className="EthernetSimulator">
      <div className="controls">
        <h1 className="title">Ethernet Simulator</h1>
        <textarea
          placeholder="Enter your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="message-box"
        ></textarea>
        <button onClick={() => setLog([])} className="clear-log">
          Clear Log
        </button>
      </div>

      <div className="bus">
        <div id="packet" ref={packetRef} className="packet">
          Pkt
        </div>
      </div>

      <div className="computers">
  {Array.from({ length: numComputers }, (_, i) => (
    <div key={i + 1} className="computer-container">
      <img
        src="/assets/computer.png"
        alt={`Computer ${i + 1}`}  // Corrected this line
        className="computer"
        onClick={() => handleComputerSelect(i + 1)}
      />
      <p className="computer-label">PC{i + 1}</p>
    </div>
  ))}
</div>

      <div className="chatbox">
        {log.map((entry, index) => (
          <div key={index}>{entry}</div>
        ))}
      </div>
    </div>
  );
};

export default EthernetSimulator;