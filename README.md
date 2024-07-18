# panicbutton - Gmail

This add-on implements a button that allows you to forward suspicious emails to a pre-defined address (usually your SOC). You can install it individually or for an organization using the [Google Admin Console](https://admin.google.com/).

## Getting started

### 1. Installing Clasp

Make sure you have [Node.js & npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed.

Install [Clasp](https://developers.google.com/apps-script/guides/clasp), the Google Apps Script CLI.

```bash
npm install -g @google/clasp
```
Login to Clasp
```bash
clasp login
```
This will open a window in your browser where you will be prompted to sign in with your Google account. 

### 2. Setting up the repo

Clone the repo (or fork it if you would like to have your own repo)
```bash
git clone https://github.com/carleid-dev/panicbutton-gmail.git
```

In your local repo's directory, create an Apps Script project using Clasp
```bash
clasp create --type standalone --title "Your addon's title"
```
You will notice a **.clasp.json** file has been created, which will contain your new Google Apps Script's `scriptId`. Make sure you this file is always included in your **.gitignore**.

Once the project is created, you can do steps **3-4** from the [Google Apps Script dashboard](https://script.google.com/home).
### 3. Updating the script

Make changes to the code if you would like, and once you're ready push the changes using Clasp.

```bash
clasp push
```

### 4. Deployment
Deploy the updated add-on using
```bash
clasp deploy --description "short description"
```
This will create a **deployment ID** that looks like this : 
`AKfycbyj8m0SzurXyqnL9tGbHItKg-Z5LUuRmsJTKWXsyKDmfSPWckpqrFZZnZN9CPdD9gshlQ @1.`

You can update an existing deployment with the following command:
```bash
clasp deploy --deploymentId <your-deployment-id> --description "description here"
```
## Admin installation

To install the add-on for all the users in your organization, copy the `deploymentId` from Clasp or from the [Apps Script dashboard](https://script.google.com/home).

Log in to the [Google Admin Console](https://admin.google.com/), navigate to **Apps > Google Workspace Marketplace apps**. Click on **Add app to Domain Install List > Add a custom app** and enter the `deploymentId` of your add-on.

## User installation (individual)

In your, [Apps Script dashboard](https://script.google.com/home), navigate to your add-on, click on **Deploy > Test Deployments > Install**.


## Contributing

For any questions please open an issue :)