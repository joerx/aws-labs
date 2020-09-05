exports.handler = async (event, context) => {
  const event_received_at = new Date().toISOString();
  console.log("Event received at: " + event_received_at);
  console.log("Received event:", JSON.stringify(event, null, 2));
};
