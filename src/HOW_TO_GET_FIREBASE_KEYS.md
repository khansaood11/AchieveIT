# How to Find Your Firebase Configuration Keys & Enable Authentication

To connect this application to your Firebase project, you need to provide your project's specific API keys and enable the authentication methods. For security reasons, you must do this from your own Firebase account.

Here is the step-by-step process:

## Part 1: Get Your API Keys

1.  **Go to the Firebase Console**: 
    Open your web browser and navigate to [https://console.firebase.google.com](https://console.firebase.google.com).

2.  **Select Your Project**: 
    - If you have an existing project for this app, click on it to open its dashboard.
    - If you do not have a project, click **"Add project"** and follow the on-screen instructions to create a new one.

3.  **Navigate to Project Settings**:
    - In your project's dashboard, find the gear icon (⚙️) next to "Project Overview" in the top-left navigation menu.
    - Click the gear icon and select **Project settings**.

4.  **Find Your Web App's Configuration**:
    - Make sure you are in the **"General"** tab within Project Settings.
    - Scroll down until you see the **"Your apps"** section.
    - If you have not created a web app for this project yet, click on the Web icon (`</>`) to register a new one. Give it a nickname (e.g., "AchieveIT Web App") and click "Register app".
    - In the "Your apps" card, you will find your registered web app. Look for the **"Firebase SDK snippet"** section and select the **"Config"** radio button.

5.  **Copy Your Credentials**:
    - You will see a block of code that looks like this:
      ```javascript
      const firebaseConfig = {
        apiKey: "AIzaSy...",
        authDomain: "your-project-id.firebaseapp.com",
        projectId: "your-project-id",
        storageBucket: "your-project-id.appspot.com",
        messagingSenderId: "123456789012",
        appId: "1:123456789012:web:a1b2c3d4e5f6g7h8"
      };
      ```
    - These are the keys you need.

6.  **Add Keys to Your Project**:
    - In this project, open the `.env.local` file.
    - Copy each value from the `firebaseConfig` object in the Firebase console and paste it as the corresponding value in your `.env.local` file.

    **Example:**
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
    NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:a1b2c3d4e5f6g7h8
    ```

---

## Part 2: Enable Sign-In Methods

After adding your keys, you must enable the specific sign-in providers you want to use.

1.  **Go to the Authentication Section**:
    - In the left-hand navigation menu of your Firebase Console, click on **Authentication**.

2.  **Go to the Sign-in method Tab**:
    - Inside the Authentication section, click on the **"Sign-in method"** tab.

3.  **Enable Email/Password**:
    - Find **"Email/Password"** in the list of providers and click on it.
    - Toggle the switch to **Enable** it.
    - Click **Save**.

4.  **Enable Google Sign-In**:
    - Find **"Google"** in the list of providers and click on it.
    - Toggle the switch to **Enable** it.
    - You may be asked to provide a **Project support email**. Select your email from the dropdown.
    - Click **Save**.

---

## Part 3: Authorize Your Domain for Google Sign-In

For security, Firebase needs to know which domains are allowed to make authentication requests. When developing locally, you must add `localhost` to this list.

1.  **Go to Authentication Settings**:
    - In the Firebase Console, go to the **Authentication** section.
    - Click on the **"Settings"** tab (next to "Users", "Sign-in method", etc.).

2.  **Add Your Domain**:
    - Under the **"Authorized domains"** section, click the **"Add domain"** button.
    - A dialog box will appear. Type `localhost` into the box.
    - Click **"Add"**.

After completing all three parts, your application will be fully configured for authentication and connected to your Firebase backend.
