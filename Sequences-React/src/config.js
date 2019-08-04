export default {
  MAX_ATTACHMENT_SIZE: 5000000,
  s3: {
    REGION: "ap-southeast-2",
    BUCKET: "utell-app-uploads"
  },
  apiGateway: {
    REGION: "us-east-2",
    URL: "https://bbxj5j91l7.execute-api.us-east-2.amazonaws.com/prod"
  },
  cognito: {
    REGION: "us-east-2",
    USER_POOL_ID: "us-east-2_fFv75x0Y7",
    APP_CLIENT_ID: "447bmoc6lhcvlqq18dctnbmgfq",
    IDENTITY_POOL_ID: "us-east-2:908db61f-89ad-4816-8078-a129ad45157b"
  }
};
