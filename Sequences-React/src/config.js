export default {
  MAX_ATTACHMENT_SIZE: 5000000,
  s3: {
    REGION: "ap-southeast-2",
    BUCKET: "utell-app-uploads"
  },
  apiGateway: {
    REGION: "us-east-2",
    URL: "URL"
  },
  cognito: {
    REGION: "us-east-2",
    USER_POOL_ID: "Your Pool ID",
    APP_CLIENT_ID: "Your Client ID",
    IDENTITY_POOL_ID: "Your Identiry Pool ID"
  }
};
