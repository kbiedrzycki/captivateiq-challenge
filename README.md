# captivateiq-challenge

The repository consist of two parts: frontend and backend.
Backend directory contains several lambda functions code wrapped with [serverless framework](https://www.serverless.com) accessible with AWS API Gateway.
Frontend directory holds simple web application in React, using TypeScript, communicating with backend lambda functions through that gateway.

## backend

### Description
Backend application uses AWS Lambda functions that connects to DynamoDB to persist user defined worksheets.
There are four methods exposed through API Gateway that allows to read and manipulate data:

endpoints:
- `GET` - /worksheets - get list of all worksheets
- `GET` - /worksheets/{id} - get single worksheet
- `POST` - /worksheets - create new, empty worksheet
- `PUT` - /worksheets/{id}/contents - update worksheet contents (single cell value) _I feel like `PATCH` could fit here better but there are some issues around CORS that needs to be tackled here and I didn't want to waste much time here_

### Deployment
Make sure `npm install` was run first in `backend` directory and that `serveless` command is available globally (for example run `npm install -g serverless`).

To perform a successful deployment we need to use an AWS user that have rights to manipulate multiple AWS resources, sample policy for that user (in real use case we should limit amount of resources and actions that user can perform to minimum required):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "iam:*",
                "s3:*",
                "apigateway:*",
                "logs:*",
                "lambda:*",
                "dynamodb:*",
                "cloudformation:*"
            ],
            "Resource": "*"
        }
    ]
}
```

Next, generate `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` for that user and use `aws configure` command to create new profile.
Once it's done, we should be able to run `sls deploy --aws-profile YOUR_DEFINED_PROFILE` which should create all required resources on our AWS account.

After successful deployment we should receive a message that contains information about deployed resources, for example:

```
Service Information
service: captivateiq
stage: dev
region: eu-west-1
stack: captivateiq-dev
resources: 32
api keys:
  None
endpoints:
  GET - https://cqb1m3npvc.execute-api.eu-west-1.amazonaws.com/dev/worksheets
  GET - https://cqb1m3npvc.execute-api.eu-west-1.amazonaws.com/dev/worksheets/{id}
  POST - https://cqb1m3npvc.execute-api.eu-west-1.amazonaws.com/dev/worksheets
  PUT - https://cqb1m3npvc.execute-api.eu-west-1.amazonaws.com/dev/worksheets/{id}/contents
functions:
  listWorksheets: captivateiq-dev-listWorksheets
  getWorksheet: captivateiq-dev-getWorksheet
  createWorksheet: captivateiq-dev-createWorksheet
  updateWorksheetContents: captivateiq-dev-updateWorksheetContents
```

Now, what's important is `https://cqb1m3npvc.execute-api.eu-west-1.amazonaws.com/dev` URL, as this is our URL that should be used by frontend app as our backend API URL setting.

Also - what's worth to mention - GitHub Actions mechanism was used to perform CD step, so each time backend files change serverless deployment happens automatically (`backend.yml` workflow file).

## frontend

### Description
Application was bootstrapped using `create-react-app` utility with `typescript` template, so actually nothing fancy.
To run application, you have to provide `REACT_APP_API_BASE` environment variable that should point to your API Gateway (backend) deployed to AWS.

#### Available commands
- `yarn install` - install application dependencies
- `yarn start` - start local development server
- `yarn test` - run jest tests
- `yarn build` - create dist bundle that can be used for production releases

### Why reducer?
At first, I wanted to use plain component state to track updates of worksheet contents and for our use case it might probably be enough (10x10 size worksheet), however, I felt that massive amount of updates coming with single change is not a way to go. That was the reason I've decided to introduce reducer that separated state from component and allowed to optimize general approach a little bit. Thanks to moving state outside it was possible to use `useCallback` and `memo` pair to avoid unnecessary re-renders of `Cell` components.

### Deployment
Web application is hosted on S3 using static website hosting feature. Also, S3 bucket should be available publicly.

Example bucket policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::BUCKET_NAME/*"
        }
    ]
}
```

Also, make sure bucket has versioning enabled (so it's pretty easy to revert frontend to previous versions if needed) and that `all public access` blocking is turned off.

Once it's ready, create production bundle using `yarn build` and use defined profile again (as in backend part) to sync S3 bucket contents with produced bundle using `aws s3 sync --profile YOUR_DEFINED_PROFILE ./dist/ s3://BUCKET_NAME`.

Deployment, similar to backend part, is handled with GitHub Actions too (frontend.yml workflow).

## Bonus - running app locally
As I felt it was pretty inconvenient that I couldn't see how my changes affected app without deploying it to AWS, I've decided to use [severless-offline](https://github.com/dherault/serverless-offline) to make it possible to run lambdas and gateway locally.
But that was not enough, cause I've also used DynamoDB and I wanted to use local instance of that database locally too. That pushed me to use [serveless-dynamodb-local](https://github.com/99xt/serverless-dynamodb-local) together with [serveless-dynamodb-client](https://github.com/99xt/serverless-dynamodb-client) thanks to which we don't have to detect to which DB instance should we connect.

To run everything locally, one have to (run in backend directory):
1. Install DynamoDB Local `sls dynamodb install`
2. Run `sls dynamodb start --migrate` to run migrations (create tables etc) and boot DynamoDB Local (make sure it runs in some separate tab, by default it is using port 8000)
3. Run `sls offline` to start local API Gateway that proxy requests to Lambda (by default using port 3000)
4. Set `REACT_APP_API_BASE` to proper value (by default it's `http://localhost:3000/dev`)
5. Run `yarn start` in `frontend` directory to bring frontend app to live
6. Play with app!
