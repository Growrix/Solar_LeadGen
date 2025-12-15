# Guest Instant Quote Testing Instructions

## CRITICAL: Correct URL
**Your development server is running on PORT 3001, NOT 3000!**

- ✅ Correct URL: `http://localhost:3001`
- ❌ Wrong URL: `http://localhost:3000`

This is because port 3000 is already in use by another application.

---

## Testing Steps

### Step 1: Access the Application
1. Open your browser to: **`http://localhost:3001`**
2. Navigate to the homepage with the instant quote calculator

### Step 2: Fill Out the Quote Form
Fill in all required fields:

**Step 1 - Location:**
- Quote Type: Residential or Commercial
- Postcode: e.g., `2000`
- Location: Will auto-populate based on postcode
- Roof Type: Select any option
- Budget Range: Select any option

**Step 2 - Energy Usage:**
- Electricity Usage: Enter a value (e.g., `400`)
- Select Monthly or Quarterly
- Click "Calculate Quote"

### Step 3: Verify Quote Submission
After clicking "Calculate Quote", you should see:

1. **In the browser console** (Press F12 > Console tab):
   ```
   Attempting to save quote to database...
   ✅ Quote saved successfully: {id: "...", ...}
   ```

2. **In the terminal** where `npm run dev` is running:
   ```
   📥 Received quote submission: { quoteType: '...', location: '...', sessionId: '...' }
   POST /api/instant-quote 201 in XXXms
   ✅ Quote saved successfully: { id: '...', quoteType: '...', location: '...', ... }
   ```

### Step 4: View in Admin Dashboard
1. Navigate to: **`http://localhost:3001/admin/instant-quotes`**
2. You should now see:
   - Updated metrics (Total Quotes count increased)
   - Your new quote in the data table
   - Timestamp showing when it was created

### Step 5: View in Database (Optional)
1. Prisma Studio is running at: **`http://localhost:5555`**
2. Open that URL in your browser
3. Click on "GuestInstantQuote" model
4. You should see all submitted quotes with full details

---

## Troubleshooting

### If You Don't See Logs in Browser Console:
1. Make sure you're on `http://localhost:3001` (not 3000)
2. Clear your browser cache and hard reload (Ctrl+Shift+R)
3. Check if the form actually submitted (look for the results screen)

### If You Don't See Logs in Terminal:
1. Make sure the dev server is running (`npm run dev`)
2. Check that you're looking at the correct terminal window
3. Try submitting another quote

### If API Returns an Error:
The terminal will show:
```
❌ Missing required fields: [field1, field2, ...]
```
This means the form didn't send all required data.

### If Database Connection Fails:
1. Check that Docker container is running:
   ```powershell
   docker ps
   ```
2. Should see `solarmatch-postgres` in the list
3. If not, start it:
   ```powershell
   docker start solarmatch-postgres
   ```

---

## What Was Fixed

### 1. Added Comprehensive Logging
- **Frontend** (`InstantQuoteForm.tsx`): Now logs when save starts and completes
- **Backend** (`/api/instant-quote/route.ts`): Logs when request received and saved

### 2. Better Error Messages
- Missing fields now logged with details
- Success messages include quote ID and timestamp

### 3. Port Detection
- Server automatically uses port 3001 if 3000 is occupied
- You MUST use the correct port shown in terminal

---

## Expected Behavior

### On Form Submit:
1. Form calculates quote results
2. Displays results to user
3. **Simultaneously** (non-blocking) saves to database via API
4. If save fails, user still sees results (no interruption)

### On Admin Page:
1. Fetches all quotes from database
2. Calculates metrics (total quotes, averages, etc.)
3. Displays in dashboard with real-time timestamps
4. Supports filtering by state, quote type, date range

---

## Key Files Modified

1. **`src/components/InstantQuoteForm.tsx`**
   - Added console.log before and after save
   - Better error handling with detailed logs

2. **`src/app/api/instant-quote/route.ts`**
   - Logs received requests
   - Logs missing fields errors
   - Logs successful saves with quote details

---

## Next Steps After Successful Test

Once you confirm quotes are saving:
1. ✅ Submit multiple test quotes with different:
   - Quote types (residential vs commercial)
   - States (NSW, VIC, QLD, etc.)
   - System sizes (different electricity usage)

2. ✅ Test admin dashboard features:
   - Filter by state
   - Filter by quote type
   - Search by location
   - Date range filtering
   - Export to CSV

3. ✅ Verify metrics update correctly:
   - Total quotes count
   - Average system size
   - Average final price
   - Conversion rate (when marking quotes as converted)

---

## Important Notes

- Server must be running on **port 3001**
- Browser console will show client-side logs
- Terminal will show server-side logs
- Both should show successful save messages
- If either is missing, there's an issue

---

## Contact Points

If you still don't see quotes after following these steps:
1. Share the **browser console output** (F12 > Console)
2. Share the **terminal output** from npm run dev
3. Share a **screenshot** of what you see on the admin page
4. Confirm which URL you're using (3000 vs 3001)
