# Frontend UI Not Showing - Debug Checklist

## Code Verification ✅
All code changes are correctly merged:
- ✅ `main.tsx` - Has tracking initialization, GuestPopup, and EditModeToggle
- ✅ `App.tsx` - Routes updated (Activity replaces About)
- ✅ `Home/index.tsx` - Has statistics cards and guest sign-up invitation
- ✅ `Activity/index.tsx` - New page exists
- ✅ `Account/index.tsx` - Has mystery code input
- ✅ `navbar.tsx` - Activity link instead of About

## What You Should See on the Frontend

### 1. Home Page (/)
**At the top, you should see TWO cards:**
- **Left Card**: "Community Impact" - Shows total hours (🌍 icon)
- **Right Card**: 
  - If logged in: "Your Journey" - Shows your hours (⏱️ icon)
  - If guest: "Start Tracking" - Sign up invitation (🚀 icon)

**Before "Recent posts" section:**
- If guest: Purple gradient card "Unlock Your Full Potential!" with sign-up button

### 2. Navigation Bar
- Should show "Activity" link instead of "About"

### 3. Activity Page (/activity)
- Statistics cards showing community and user hours
- Session history table (if logged in)
- Info section about tracking

### 4. Account Page (/account)
- Mystery code input section (if not admin)
- Admin badge (if admin)

### 5. Admin Features (if admin)
- Floating "Edit Mode" toggle button in bottom-right corner

### 6. Guest Popup
- Should appear 2 seconds after page load (for guests only)
- Beautiful gradient popup with benefits

## Troubleshooting Steps

### Step 1: Rebuild Frontend
```bash
cd static/anoweb-front
pnpm install
pnpm build
```

### Step 2: Restart Backend
The backend needs to load new routes and models:
```bash
# Stop current backend
# Rebuild and restart
cd src
go build -o ../bin/anoweb
cd ..
./bin/anoweb
```

### Step 3: Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or open DevTools (F12) → Network tab → Check "Disable cache"
- Or clear all browser cache

### Step 4: Check Browser Console
Open DevTools (F12) → Console tab
Look for errors like:
- API call failures (404, 500 errors)
- JavaScript errors
- CORS errors

### Step 5: Check Network Tab
Open DevTools (F12) → Network tab
Verify these API calls are working:
- `/api/tracking/total-hours` - Should return `{"total_hours": 0.0}`
- `/api/tracking/start` - Should return 200 OK
- `/api/guest-popup/active` - Might return 404 if no config (that's OK)

### Step 6: Verify Backend Routes
Check if backend has new routes loaded:
```bash
curl http://localhost:PORT/api/tracking/total-hours
# Should return: {"total_hours":0}
```

## Common Issues

### Issue 1: "Cannot GET /activity"
**Cause**: Frontend not rebuilt or old bundle cached
**Fix**: Rebuild frontend + hard refresh browser

### Issue 2: API calls return 404
**Cause**: Backend not restarted with new routes
**Fix**: Rebuild and restart Go backend

### Issue 3: Statistics show "..."
**Cause**: API calls failing
**Fix**: Check browser console for errors, verify backend is running

### Issue 4: No popup appears
**Cause**: Either you're logged in, or no popup config in database
**Fix**: 
- Logout to see popup (it only shows for guests)
- Add popup config to database (see below)

### Issue 5: Nothing changed at all
**Cause**: Serving old built files
**Fix**: 
1. Check if you're serving from correct directory
2. Verify `dist/` folder has new build (check timestamps)
3. Clear browser cache completely

## Initial Database Setup

The new features require database tables. They should auto-migrate, but if not:

```sql
-- Run these if tables don't exist
CREATE TABLE IF NOT EXISTS user_trackings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  session_id VARCHAR(255) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NULL,
  duration BIGINT DEFAULT 0,
  created_at DATETIME,
  updated_at DATETIME,
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id)
);

CREATE TABLE IF NOT EXISTS mystery_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(255) UNIQUE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  used_by INT NULL,
  used_at DATETIME NULL,
  created_at DATETIME,
  updated_at DATETIME,
  INDEX idx_code (code),
  INDEX idx_used_by (used_by)
);

CREATE TABLE IF NOT EXISTS guest_popup_configs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  benefits TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME,
  updated_at DATETIME
);
```

## Add Test Data

### Add a guest popup config:
```sql
INSERT INTO guest_popup_configs (title, benefits, is_active, created_at, updated_at)
VALUES (
  'Join Our Amazing Community!',
  '["Track your time on site", "Unlock exclusive features", "Join a vibrant community", "Get personalized insights"]',
  TRUE,
  NOW(),
  NOW()
);
```

### Add a mystery code:
```sql
INSERT INTO mystery_codes (code, is_used, created_at, updated_at)
VALUES ('ADMIN2024', FALSE, NOW(), NOW());
```

## Expected Behavior

1. **On first visit (guest)**:
   - See statistics cards on home page
   - See guest sign-up invitation card
   - Popup appears after 2 seconds
   - Tracking starts automatically
   - "Activity" in navbar

2. **After login**:
   - See personal hours card
   - No guest invitation card
   - Can enter mystery code in Account page
   - Tracking continues with user ID

3. **As admin**:
   - See edit mode toggle button
   - Can view all tracking records
   - All admin features visible

## Still Not Working?

If you've tried everything above and still don't see changes:

1. **Check file timestamps**: Verify files were actually updated
   ```bash
   ls -la static/anoweb-front/src/Pages/Activity/
   ls -la static/anoweb-front/dist/
   ```

2. **Check what's being served**: 
   - View page source in browser
   - Look for the JavaScript bundle filename
   - Check if it's recent

3. **Try incognito/private window**: This ensures no cache at all

4. **Check if you're on the right branch**: 
   ```bash
   git branch
   # Should show * master
   ```

5. **Verify the merge actually happened**:
   ```bash
   git log --oneline | head -5
   # Should show the merge commit
   ```
