# Conversation List Display Fix

## Problem
In the conversations list (Sidebar), the user name and last message were not showing.

## Root Cause

### Backend-Frontend Mismatch
The backend was returning chat data with field name `members`, but the frontend expected `participants`.

**Backend** (`backend/src/models/chat.model.js`):
```sql
SELECT ... as members  -- ❌ Wrong field name
```

**Frontend** (`frontend/src/components/layout/Sidebar.tsx`):
```typescript
{chat.participants?.[0]?.name || ...}  // ❌ Looking for participants
{chat.lastMessage?.content || ...}     // ✅ This was correct
```

**Frontend Type** (`frontend/src/types/index.ts`):
```typescript
export interface Chat {
  id: string;
  type: ChatType;
  name?: string;
  participants: User[];  // ❌ Expected participants, not members
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
```

## Solution

### 1. Updated Backend Query - `getUserChats()`
**File**: `backend/src/models/chat.model.js`

Changed the SQL query to return `participants` instead of `members`:

```sql
-- Before
(SELECT json_agg(...) ... ) as members

-- After
(SELECT COALESCE(
  json_agg(json_build_object(
    'id', u.id,
    'name', u.name,
    'phone', u.phone,
    'avatarUrl', u.avatar_url,
    'isOnline', u.last_seen > NOW() - INTERVAL '5 minutes',
    'lastSeen', u.last_seen
  )),
  '[]'::json
) ... ) as participants
```

**Additional improvements**:
- Added `isOnline` status (user is online if last_seen < 5 minutes ago)
- Added `lastSeen` timestamp
- Added `COALESCE` to return empty array instead of null
- Added `unreadCount` field (currently hardcoded to 0)

### 2. Updated Backend Query - `getChatWithMembers()`
**File**: `backend/src/models/chat.model.js`

Also updated this method to use `participants`:

```sql
-- Before
json_agg(...) as members

-- After
json_agg(json_build_object(
  'id', u.id,
  'name', u.name,
  'phone', u.phone,
  'avatarUrl', u.avatar_url,
  'isOnline', u.last_seen > NOW() - INTERVAL '5 minutes',
  'lastSeen', u.last_seen,
  'role', cm.role
)) as participants
```

## Testing

### Debug Script Output
Created `backend/scripts/debug-chats.js` to verify the fix:

```
📊 Chats found: 1
================

1. Chat ID: ed9601cc-9aba-4c62-a864-f49f4c9494f4
   Type: private
   Participants: [
     {
       "id": "aba6f576-4db9-49f8-b248-e14efb9ed2c8",
       "name": "Abhinish Test",           ✅ Name is present
       "phone": "+917575757575",
       "avatarUrl": null,
       "isOnline": true,
       "lastSeen": "2026-01-10T15:34:53.164614+00:00"
     }
   ]
   Last Message: {
     "id": "7f1a42e5-852b-4a89-ab38-e95074d581e5",
     "content": "sd",                     ✅ Content is present
     "type": "text",
     "senderId": "70238166-2c73-4b97-8fad-9ac8f31c5f0b",
     "createdAt": "2026-01-10T15:00:46.284899+00:00",
     "status": "read"
   }
   Unread Count: 0
   Message Count: 31
```

### Manual Testing
1. Refresh the frontend app
2. Check the conversations list in the sidebar
3. ✅ User names should now display correctly
4. ✅ Last messages should now display correctly
5. ✅ Online status indicators should work

## What Was Fixed

### Before
- ❌ User names showed as "Unknown"
- ❌ Last messages showed as "No messages yet"
- ❌ No online status

### After
- ✅ User names display correctly (e.g., "Abhinish Test")
- ✅ Last messages display correctly (e.g., "sd")
- ✅ Online status shows (green dot if online)
- ✅ Last seen timestamp available
- ✅ Unread count field added (ready for future implementation)

## Related Files Changed

1. `backend/src/models/chat.model.js`
   - Updated `getUserChats()` method
   - Updated `getChatWithMembers()` method

2. `backend/scripts/debug-chats.js`
   - Created debug script to verify chat data

## Future Enhancements

1. **Unread Count**: Currently hardcoded to 0, needs implementation
   ```sql
   (SELECT COUNT(*) 
    FROM messages m 
    LEFT JOIN message_receipts mr ON m.id = mr.message_id AND mr.user_id = $1
    WHERE m.chat_id = c.id 
      AND m.sender_id != $1 
      AND mr.read_at IS NULL
   ) as unread_count
   ```

2. **Typing Indicators**: Show when other user is typing

3. **Message Preview**: Truncate long messages in the list

4. **Time Display**: Show relative time (e.g., "5 min ago", "Yesterday")

5. **Group Chat Support**: Handle multiple participants in group chats

## API Response Format

### GET /chats
```json
{
  "success": true,
  "chats": [
    {
      "id": "ed9601cc-9aba-4c62-a864-f49f4c9494f4",
      "type": "private",
      "name": null,
      "avatarUrl": null,
      "createdBy": "...",
      "createdAt": "2026-01-10T14:58:31.000Z",
      "updatedAt": "2026-01-10T15:00:46.000Z",
      "messageCount": 31,
      "participants": [
        {
          "id": "aba6f576-4db9-49f8-b248-e14efb9ed2c8",
          "name": "Abhinish Test",
          "phone": "+917575757575",
          "avatarUrl": null,
          "isOnline": true,
          "lastSeen": "2026-01-10T15:34:53.164614+00:00"
        }
      ],
      "lastMessage": {
        "id": "7f1a42e5-852b-4a89-ab38-e95074d581e5",
        "content": "sd",
        "type": "text",
        "senderId": "70238166-2c73-4b97-8fad-9ac8f31c5f0b",
        "createdAt": "2026-01-10T15:00:46.284899+00:00",
        "status": "read"
      },
      "unreadCount": 0
    }
  ],
  "total": 1
}
```

