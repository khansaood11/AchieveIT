# How to Find Your Firebase Configuration Keys & Enable Authentication

To connect this application to your Firebase project, you need to provide your project's specific API keys and enable the authentication methods. For security reasons, you must do this from your own Firebase account.

Here is the step-by-step process:

## Part 1: Get Your API Keys

1.  **Go to the Firebase Console**: 
    Open your web browser and navigate to [https://console.firebase.google.com](https://console.firebase.google.com).

2.  **Select Your Project**: 
    - You should see your project named **"AchieveIT"** (with Project ID `achieveit-118wd`). Click on it to open its dashboard.
    - If you do not see it, you may need to add Firebase to your existing Google Cloud project.

3.  **Navigate to Project Settings**:
    - In your project's dashboard, find the gear icon (⚙️) next to "Project Overview" in the top-left navigation menu.
    - Click the gear icon and select **Project settings**.

4.  **Find Your Web App's Configuration**:
    - Make sure you are in the **"General"** tab within Project Settings.
    - If you haven't already, click on the Web icon (`</>`) to register a new web app. Give it a nickname (e.g., "AchieveIT Web") and click "Register app".
    - In the "Your apps" card, you will find your registered web app. Look for the **"Firebase SDK snippet"** section and select the **"Config"** radio button.

5.  **Copy Your Credentials**:
    - You will see a block of code that looks like this:
      ```javascript
      const firebaseConfig = {
        apiKey: "AIzaSy...",
        authDomain: "achieveit-118wd.firebaseapp.com",
        projectId: "achieveit-118wd",
        storageBucket: "achieveit-118wd.appspot.com",
        messagingSenderId: "...",
        appId: "..."
      };
      ```
    - These are the new keys you need.

6.  **Update Keys in Your Project and on Netlify**:
    - In this project, open or create a `.env.local` file and replace any old values with these new ones.
    - In your Netlify site settings, go to **Environment variables** and update the values for `NEXT_PUBLIC_FIREBASE_*` with these new keys.

---

## Part 2: Enable Sign-In Methods

After adding your keys, you must enable the sign-in providers for your project. This is a required step.

1.  **Go to the Authentication Section**:
    - In the left-hand navigation menu of your Firebase Console, click on **Build > Authentication**.

2.  **Go to the Sign-in method Tab**:
    - Inside the Authentication section, click on the **"Sign-in method"** tab.

3.  **Enable Email/Password & Google**:
    - Click **"Add new provider"**.
    - Select **"Email/Password"** and enable it.
    - Click **"Add new provider"** again.
    - Select **"Google"**, enable it, and select a project support email when prompted.

---

## Part 3: Authorize Your Domains

For security, Firebase needs to know which domains are allowed to make authentication requests.

1.  **Go to Authentication Settings**:
    - In the Firebase Console, go to the **Authentication** section.
    - Click on the **"Settings"** tab.

2.  **Add Your Domains**:
    - Under the **"Authorized domains"** section, click the **"Add domain"** button.
    - Add `localhost` for local testing.
    - Add your Netlify URL (e.g., `de-project-1.netlify.app`) for the live site.

---

## Part 4: Configure the OAuth Consent Screen

This is the final step to allow Google Fit to work.

1.  **Go to the OAuth Consent Screen page** in Google Cloud: [**https://console.cloud.google.com/apis/credentials/consent**](https://console.cloud.google.com/apis/credentials/consent).
2.  Choose **"External"** for the User Type and click **"CREATE"**.
3.  On the **"Branding"** page, fill in:
    - App Name (e.g., AchieveIT)
    - User Support Email
    - **Authorized domains**: Add `de-project-1.netlify.app`
    - Developer Contact Email
    - Click **"SAVE AND CONTINUE"**.
4.  On the **"Scopes"** page, you don't need to change anything. Click **"SAVE AND CONTINUE"**.
5.  On the **"Test users"** page:
    - Click **"+ ADD USERS"**.
    - Add the email address you use to log in to the app.
    - Click **"ADD"**.
    - Click **"SAVE AND CONTINUE"**.
6.  You will see a summary. Click **"BACK TO DASHBOARD"**.

After completing all four parts, your application will be configured. You will also need to re-enable the **Fitness API** for this new project.
