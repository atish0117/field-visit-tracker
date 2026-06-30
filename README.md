# FieldTrack - Field Visit & Location Tracking Dashboard

FieldTrack is a premium, high-performance web dashboard for coordinating, scheduling, and tracking field visits across multiple physical locations. It is built using **React**, **Vite**, **Vanilla CSS**, and integrates seamlessly with **Appwrite** for database and storage management.

---

## Features

- **Visits Dashboard**: Log and track team visits (Visit 1 & Visit 2) with status badges (Pending, Partial, Completed).
- **Location Manager**: Add or edit physical locations with details like Name, ID, Address, and RBO (Reason Code).
- **Coordinates Base Mapping**: Enter Latitude & Longitude to auto-generate Google Maps URLs, or paste Google Maps URLs to auto-parse coordinates.
- **Monthly Analytics**: Real-time charts of visits per month and most-visited locations.
- **Calendar View**: Interactive calendar indicating visit activities on specific days.
- **Profile Manager**: Edit profile details (Name, Employee ID) and upload avatar photos directly to the Appwrite Storage bucket.
- **Rich Filters & Search**: Search by ID, address, name, RBO, or status instantly.

---

## Getting Started

### 1. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 2. Configuration (`.env`)
Create a `.env` file in the root directory and add your Appwrite configurations:
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_LOC_COLL_ID=your_locations_collection_id
VITE_APPWRITE_VIS_COLL_ID=your_visits_collection_id
VITE_APPWRITE_USR_COLL_ID=your_users_collection_id
VITE_APPWRITE_BUCKET_ID=your_avatar_bucket_id
```

### 3. Local Development
Run the local dev server:
```bash
npm run dev
```

---

## Deployment to GitHub Pages

This project is optimized with relative asset paths (`base: "./"`) and includes a GitHub Actions workflow to automate deployment.

### Option A: Automatic Deployment (Recommended)
1. Initialize git and commit your files:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. Create a repository on GitHub.
3. Link your local project to GitHub and push it:
   ```bash
   git remote add origin https://github.com/your-username/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```
4. **GitHub Settings**:
   - Go to your repository on GitHub.
   - Navigate to **Settings** → **Pages**.
   - Under **Build and deployment** → **Source**, select **GitHub Actions**.
5. The included GitHub Actions workflow (`.github/workflows/deploy.yml`) will run automatically on push, building the app and deploying it to GitHub Pages.

### Option B: Manual Command-Line Deployment
1. Install `gh-pages` as a development dependency:
   ```bash
   npm install gh-pages --save-dev
   ```
2. Add scripts to your `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. Deploy the application:
   ```bash
   npm run deploy
   ```
