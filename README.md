<table width="100%" style="border: none;">
  <tr style="border: none;">
    <td align="left" width="50%" style="border: none;">
      <img src="public/apexhorizon.png" alt="ApexHorizon Logo" width="180" />
    </td>
    <td align="right" width="50%" valign="middle" style="border: none;">
      <img src="public/apexlink.png" alt="ApexLink Logo" width="60" align="top" />
      <span style="font-size: 32px; font-weight: 800; font-family: sans-serif;">Apex <span style="color: #007bff;">Link</span></span>
    </td>
  </tr>
</table>

# ApexLink Backend API

The Node.js backend infrastructure for **ApexLink**, a real-time, multilingual SaaS communication platform.

## Features

*   **Real-time Multilingual Chat**: Built with `Socket.IO`, automatically translates and broadcasts messages into all active languages present in a workspace using the Google Gemini AI.
*   **Translation Resiliency**: Includes an automatic fallback to the Google Translate API if the Gemini engine fails or hits quotas, ensuring guaranteed message delivery.
*   **Authentication & JWT**: Secure user registration and login workflows using `bcryptjs` and JSON Web Tokens.
*   **Persistent Storage**: Connects to MongoDB via Mongoose, storing structured data across `Users`, `Chats`, `Messages`, `Subscriptions`, and `Transactions` collections.
*   **Automated Paywall Enforcement**: A trial engine that grants 7 days of unrestricted access natively baked into the user models. Automatically flags expired trials on authentication requests.
*   **UPI Intent & QR Payments**: Integrates a robust manual payment gateway using generated UPI links and verified manual screenshot uploads via `multer` and Cloudinary.
*   **Robust Architecture**: Utilizes custom asynchronous error handlers, global API rate-limiting, and standard Express security middlewares like `helmet` and `cors`.

## Environment Variables

Create a `.env` file in the root of the `Backend/` directory with the following variables:

```env
# Server Configuration
PORT=5000

# Database Configuration
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/apexlink

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key
REFRESH_TOKEN_EXPIRES_IN=7d

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary Integration (For Payment Screenshots)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Setup & Installation

1.  **Install Dependencies:**
    Note: Due to potential peer-dependency conflicts with ESLint configurations, use the `--legacy-peer-deps` flag.
    ```bash
    npm install --legacy-peer-deps
    npm install -D @types/multer --legacy-peer-deps
    ```

2.  **Create Temporary Directory (for Multer uploads):**
    ```bash
    mkdir -p public/temp
    ```

3.  **Start the Development Server:**
    ```bash
    npm run dev
    ```

## API Routes

### Authentication (`/api/auth`)
*   `POST /signup` - Register a new user (with preferred language).
*   `POST /login` - Authenticate and receive Access/Refresh tokens.
*   `POST /refresh` - Exchange a refresh token for a new access token.
*   `GET /whoami` - Retrieve the current authenticated user details and trial status.

### Chat & Workspaces (`/api/chat`)
*   `GET /my-chats` - Fetch all active workspace IDs where the authenticated user is a participant.
*   `GET /my-chats/:chatId` - Retrieve all historical translated messages for a specific workspace.

### Payments & Premium (`/api/payment`)
*   `POST /create` - Generate a unique Transaction ID and UPI Intent URL.
*   `POST /verify` - Upload a payment screenshot (`multipart/form-data`) and Transaction ID to activate a premium subscription.

## WebSocket Events

The application connects to `PORT` (default 5000) for real-time synchronization.

*   **`join_room`**: Triggered when a user enters a workspace. Tracks the user's `preferredLang` in the room memory state.
*   **`set_language`**: Invoked by Guest users to change their desired translation output language dynamically.
*   **`msg_transmit`**: Sent by a user typing a message. The server translates this payload into all active languages and broadcasts it. If the sender is authenticated, it permanently saves the multi-language dictionary to MongoDB.
*   **`new_message`**: The broadcasted payload emitted by the server to all users in the workspace containing the translated dictionary.
