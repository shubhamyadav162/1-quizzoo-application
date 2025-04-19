@echo off
echo ===============================
echo Quizzoo App Profile Fix Script
echo ===============================
echo.
echo This script will help fix the "infinite recursion" error in profiles table.
echo Please follow the instructions below:
echo.
echo 1. Go to your Supabase dashboard at https://app.supabase.io
echo 2. Open the SQL Editor
echo 3. Copy the SQL from the database/profiles-fix.sql file
echo 4. Run the SQL query in the Supabase SQL Editor
echo 5. After running the fix, press any key to start the app
echo.
echo The SQL fix can be found in:
echo %~dp0database\profiles-fix.sql
echo.
pause
start "" notepad %~dp0database\profiles-fix.sql
echo.
echo After applying the fix in Supabase, let's start the app...
echo.
pause
npx expo start --clear 