# Demo Lambda Destinations

Loosely based on https://aws.amazon.com/blogs/compute/introducing-aws-lambda-destinations/. Will create the following:

* MyFunction lambda function that occasionally fails for strange reasons
* ErrorHandler function invoked on failures, does nothing but log events
* SNS topic receiving notifications for successful Lambda invocations

## Usage

Apply the stack. To receive SNS notifications, subscribe to the topic by email.

## Examples

Get the function name from the stack output:

```
export FUNCTION_NAME=...
```

Subscribe to the SNS topic to receive emails. Send success event:

```bash
aws lambda invoke --function-name $FUNCTION_NAME --invocation-type Event --payload '{ "Success": true }' response.json
```

Payload received via email:

```json
{
  "version": "1.0",
  "timestamp": "2020-09-05T04:47:03.138Z",
  "requestContext": {
    "requestId": "b5b66801-6506-4349-be7c-50660348a104",
    "functionArn": "arn:aws:lambda:ap-southeast-1:468871832330:function:LambdaDestinationsStack-MyFunction3BAA72D1-1Q255I46LUXZO:$LATEST",
    "condition": "Success",
    "approximateInvokeCount": 1
  },
  "requestPayload": { "Success": true },
  "responseContext": { "statusCode": 200, "executedVersion": "$LATEST" },
  "responsePayload": null
}
```

Error event:

```bash
aws lambda invoke --function-name $FUNCTION_NAME --invocation-type Event --payload '{ "Success": false }' response.json
```

Event will be delivered to error handler Lambda, check cloudwatch logs for that function:

```json
{
    "version": "1.0",
    "timestamp": "2020-09-05T04:51:00.376Z",
    "requestContext": {
        "requestId": "aa762245-6635-4a00-bd73-33cd28bb5ee5",
        "functionArn": "arn:aws:lambda:ap-southeast-1:468871832330:function:LambdaDestinationsStack-MyFunction3BAA72D1-1Q255I46LUXZO:$LATEST",
        "condition": "RetriesExhausted",
        "approximateInvokeCount": 1
    },
    "requestPayload": {
        "Success": false
    },
    "responseContext": {
        "statusCode": 200,
        "executedVersion": "$LATEST",
        "functionError": "Unhandled"
    },
    "responsePayload": {
        "errorType": "Error",
        "errorMessage": "Failure from event, Success = false, I am failing!",
        "trace": [
            "Error: Failure from event, Success = false, I am failing!",
            "    at Runtime.exports.handler (/var/task/index.js:13:11)",
            "    at Runtime.handleOnce (/var/runtime/Runtime.js:66:25)"
        ]
    }
}
```
