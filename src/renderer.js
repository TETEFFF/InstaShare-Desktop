function generateRandomId(length) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate a random id
const id = generateRandomId(16);
const peer = new Peer(id);
peerID.sendID(id);

let remoteIds = [];
peerID.onReception((id) => {
  console.log(id);
  console.log(remoteIds);
  if (!remoteIds.includes(id)) {
    // Intiate connextion with remote peer
    const connection = peer.connect(id);

    // Handle error
    connection.on("error", (error) => console.error(error));
    // Add id to remote ids list
    remoteIds.push(id);
  }
});

peer.on("connection", (connection) => {
  connection.on("open", () => {
    console.log("connection is ready");
    // Recieve data
    connection.on("data", (data) => {
      console.log("Recieved: something :ooooo");
    });
    //Send data
    connection.send(["wanker"]);
  });

  connection.on("close", () => {
    console.log("connection closed");
  });
});

peer.on("disconnected", () => {
  console.log("Discontinuuuuuuuue");
});
