exports.handler = async (event, context) => {
  const event_received_at = new Date().toISOString();
  console.log("Event received at: " + event_received_at);
  console.log("Received event:", JSON.stringify(event, null, 2));

  if (event.Success) {
    console.log("Success");
    context.callbackWaitsForEmptyEventLoop = false;
    return null;
  } else {
    console.log("Failure");
    context.callbackWaitsForEmptyEventLoop = false;
    throw new Error("Failure from event, Success = false, I am failing!");
  }
};
