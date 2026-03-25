# BGT Secure Exam Management System - Startup Guide

Follow these steps to set up and run the full ecosystem.

## 1. Prerequisites
- **MySQL Server** (XAMPP or standalone) running on port 3306.
- **.NET 8 SDK** installed.
- **Node.js** (v18+) installed.
- **Visual Studio 2022** (for building the Desktop App comfortably, or use CLI).

## 2. Database Setup
1. Open **MySQL Workbench** or **phpMyAdmin**.
2. Create a new database named `bgt_secure_exam`.
3. Import the schema file located at: `database/schema.sql`.
   - *Alternative*: Copy/Paste the SQL content into a query window and execute it.
4. **Creating an Admin**:
   - Register a new user via the Web Portal.
   - Go to your Database Manager (`users` table).
   - Find your user and set:
     - `role` = `'ADMIN'`
     - `is_approved` = `1`
   - Save changes.

## 3. Backend (ASP.NET Core API)
1. Navigate to the `backend` folder.
2. Open `appsettings.json` and ensure the **Connection String** matches your MySQL user/password.
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "server=localhost;user=root;password=;database=bgt_secure_exam"
   }
   ```
3. Run the backend:
   ```powershell
   cd backend
   dotnet run
   ```
   - It will listen on `http://localhost:5000`.

## 4. Frontend (React Web Portal)
1. Open a new terminal.
2. Navigate to the `frontend` folder.
3. Install dependencies and start:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
   - It will listen on `http://localhost:3000` (or similar).

## 5. Lockdown Engine (Desktop App)
**Step A: Build the App**
1. Open `lockdown-client/LockdownBrowser.csproj` in Visual Studio.
2. Build the Solution (Ctrl+Shift+B) or run in terminal:
   ```powershell
   cd lockdown-client
   dotnet build
   ```

**Step B: Register the Protocol**
*This step is required only ONCE on a new computer.*
1. Go to the root folder `secure exam`.
2. Right-click `register_protocol.ps1` -> **Run with PowerShell**.
   - *Or run via terminal:* `powershell -ExecutionPolicy Bypass -File register_protocol.ps1`
3. If successful, you will see a success message.

## 6. How to Test
1. Log in to the Frontend as **Professor** (or Admin).
2. Create an Exam (provide a Title, Subject, Duration, and the URL of the Google Form/Moodle test).
3. Copy the **Exam Code** (e.g., `X7Y2Z9`).
4. Log in as a **Student** (in a different browser or incognito).
5. Enter the Code in the Dashboard.
6. Click **Launch Secure Browser**.
7. Confirm the browser prompt. The Desktop App should launch in Kiosk Mode.

>**Emergency Exit**: Press `Ctrl + Shift + F12` (Password: `BGT2026`) if you get stuck.
