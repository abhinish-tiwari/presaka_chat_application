# User Name Display Fix

## Problem
User name was not showing in the ProfileModal because:
1. When a new user is created via OTP login, only `phone` and `is_verified` fields are set
2. The `name` field in the database is nullable and defaults to `NULL`
3. The ProfileModal displays "Not set" when `user?.name` is null/undefined

## Root Cause

### Backend Issue
**File**: `backend/src/models/user.model.js`

The `create()` method was only inserting `phone` and `is_verified`:
```javascript
async create(phone) {
  const result = await query(
    'INSERT INTO users (phone, is_verified) VALUES ($1, $2) RETURNING *',
    [phone, true]
  );
  return keysToCamel(result.rows[0]);
}
```

This resulted in users having:
- ✅ `phone`: "+919876543210"
- ✅ `isVerified`: true
- ❌ `name`: null
- ❌ `bio`: null

## Solutions Implemented

### 1. Backend Fix - Set Default Name
**File**: `backend/src/models/user.model.js`

Updated the `create()` method to set a default name:
```javascript
async create(phone) {
  // Set default name as "User" + last 4 digits of phone
  const defaultName = `User ${phone.slice(-4)}`;
  
  const result = await query(
    'INSERT INTO users (phone, name, is_verified) VALUES ($1, $2, $3) RETURNING *',
    [phone, defaultName, true]
  );
  return keysToCamel(result.rows[0]);
}
```

**Result**: New users will have a default name like "User 3210"

### 2. Frontend Enhancement - Fetch User Data on Load
**File**: `frontend/src/App.tsx`

Added a `useEffect` to fetch the latest user data when the app loads:
```typescript
useEffect(() => {
  const fetchUserData = async () => {
    if (isAuthenticated) {
      try {
        const response = await userService.getMe();
        updateUser(response.user);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    }
  };

  fetchUserData();
}, [isAuthenticated, updateUser]);
```

**Benefits**:
- Syncs user data from server on app load
- Updates local store with latest user information
- Handles cases where user was created before the backend fix

## Testing

### For New Users
1. Logout from the app
2. Login with a new phone number
3. Open Profile Modal
4. ✅ Should see default name "User XXXX" (last 4 digits of phone)

### For Existing Users (with null name)
1. Refresh the app
2. App will fetch latest user data from `/users/me`
3. Open Profile Modal
4. If name is still null, click "Edit Profile"
5. Enter your name and save
6. ✅ Name should now display correctly

### For Existing Users (with name set)
1. Refresh the app
2. Open Profile Modal
3. ✅ Name should display correctly

## Database Schema

The `users` table schema allows nullable names:
```sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100),  -- Nullable
    avatar_url TEXT,
    bio TEXT,
    is_verified BOOLEAN DEFAULT false,
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Alternative Solutions Considered

### Option 1: Make name required in database
```sql
ALTER TABLE users ALTER COLUMN name SET NOT NULL;
ALTER TABLE users ALTER COLUMN name SET DEFAULT 'User';
```
**Rejected**: Would require migration for existing users with null names

### Option 2: Set name during OTP verification
Update `auth.service.js` to prompt for name during signup
**Rejected**: Adds friction to the signup flow

### Option 3: Use phone number as fallback in UI
Display phone number when name is null
**Rejected**: Less user-friendly, phone numbers are not good display names

## Migration for Existing Users

If you have existing users with null names, run this SQL:
```sql
UPDATE users 
SET name = CONCAT('User ', RIGHT(phone, 4))
WHERE name IS NULL;
```

Or use this Node.js script:
```javascript
import { query } from './config/database.js';

async function migrateUserNames() {
  const result = await query(`
    UPDATE users 
    SET name = CONCAT('User ', RIGHT(phone, 4))
    WHERE name IS NULL
    RETURNING id, phone, name
  `);
  
  console.log(`Updated ${result.rowCount} users`);
  console.log(result.rows);
}

migrateUserNames();
```

## Future Enhancements

1. **Onboarding Flow**: Add a welcome screen after first login to set name and bio
2. **Name Validation**: Add validation to ensure names are not empty or too long
3. **Profile Completion**: Show profile completion percentage
4. **Avatar Upload**: Allow users to upload profile pictures
5. **Username System**: Add unique usernames in addition to display names

## Related Files

- `backend/src/models/user.model.js` - User creation logic
- `frontend/src/App.tsx` - User data fetching on load
- `frontend/src/components/profile/ProfileModal.tsx` - Profile display
- `frontend/src/store/authStore.ts` - User state management
- `backend/src/database/schema.sql` - Database schema

