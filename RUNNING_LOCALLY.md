# How to Run This Project Locally

This guide provides step-by-step instructions to get the AchieveIT application running on your local computer for development and testing.

## Prerequisites

Before you begin, ensure you have [Node.js](https://nodejs.org/) installed on your machine. We recommend using the latest Long-Term Support (LTS) version. You can check if you have it installed by opening your terminal (like Command Prompt, PowerShell, or Terminal on Mac) and running:

```bash
node -v
```

If it returns a version number (e.g., `v18.18.0`), you're all set. If not, please download and install it from the official website.

---

## Step 1: Set Up Your Firebase Configuration

This is the most important step. The application cannot connect to its database or authentication services without your unique Firebase project keys.

1.  **Create a `.env.local` file**: In the root directory of the project (the same folder that contains `package.json`), create a new file and name it exactly **`.env.local`**.

2.  **Follow the Firebase Guide**: Open the `HOW_TO_GET_FIREBASE_KEYS.md` file in this project. Follow all three parts of that guide carefully to:
    *   Get your API keys from the Firebase Console.
    *   Enable the **Email/Password** and **Google** sign-in providers.
    *   Authorize the `localhost` domain for Google Sign-In.

3.  **Add Keys to `.env.local`**: Copy the keys from your Firebase project settings and paste them into the `.env.local` file you created. It should look like this:

    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
    NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:a1b2c3d4e5f6g7h8
    ```

**Note**: If you have already done this, double-check that all keys are present and that you've enabled the sign-in methods and authorized domain in the Firebase Console.

---

## Step 2: Install Project Dependencies

Once your configuration is ready, you need to install all the necessary software packages the project depends on (like React, Next.js, Firebase, etc.).

1.  **Open a Terminal**: Open your terminal and make sure you are in the project's root directory.

2.  **Run the Install Command**: Type the following command and press Enter:

    ```bash
    npm install
    ```

    This command reads the `package.json` file and downloads all the required packages into a `node_modules` folder. This might take a few minutes.

---

## Step 3: Run the Development Server

Now you're ready to start the application.

1.  **Run the "dev" command** in your terminal:

    ```bash
    npm run dev
    ```

2.  **View the App**: The terminal will show a message indicating that the server has started, usually on port 9002. It will look something like this:

    ```
    - ready started server on 0.0.0.0:9002, url: http://localhost:9002
    ```

3.  Open your web browser and navigate to **http://localhost:9002**. You should now see the AchieveIT landing page!

You can now interact with the application, sign up, log in, and any changes you make to the code will automatically update in the browser.

To stop the server, go back to your terminal and press `Ctrl + C`.
