# OAuth Service
This is an end to end oauth server with an Express.js backend and a React.js front-end using node-oidc-provider to create a OpenId connect auth service. It uses DynamoDb for storage and apart from being just for OpenID connect it also has admin to manage different users and clients.

It houses itself on AWS EKS using Helm and kubernetes deployed using a combination of GitHub Actions, Terraform, Helm, Kubectl. Solidified by running unit tests during the build (CI) process and proof checked again during deploy (CD) by running Playwright e2e tests. As you might have noticed the process consists of two stages:

1. The build stage which is CI that builds the docker image artificate.
2. The deploy stage where the artefact in the previous stage is picked up and deployed in the CD. 

## Code structure
The code structure itself is divided as follows:
1. Frontend & Backend: Which is the heart of the application sits in the packages directory. Both packages can we run individually using the `npm run dev` command. Enviroment variable are to be set as per the template (.env.template) found in each individual packages. Backend requires local dynamo db docker instance to run, if you can have already you can use that otherwise you can do `docker compose up` in the backend package.
2. Helm: This is where all the k8 manifest files live along with the helm chart. It consist of service, deployment, config map, and secret.
3. Infra: This is terraform IaC consisting of two parts. First part which deal with provisioning the VPC & EKS Cluster and second which provisions dynamo db tables and service account for the pods to allow them access to dynamo db and SNS.
4. Tests: This is the Playwright E2E test suite covering the admin, user registration, and oidc flow testing.
5. Scripts: These are bash scripts that used by Github actions.
6. Github Actions: Consisting of the CI that runs unit tests against the frontend & backend and builds an artefact. Then there is CD that provisions the infrastructure, installs the helm charts, and then runs E2E tests against the deployed application and finally there is a destroy workflow to destroy the application and infrastructure with it.

## Features
From a feature stand point of view its an OIDC server providing auth code with PKCE, refresh token, client credential flows. Besides that it supports user management, client management features for administrators whilst standard features included session management, mulit-factor authenication support via sms, email, authenticator app, and also passkey. 
