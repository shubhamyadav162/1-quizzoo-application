@echo off
echo ====================================================================
echo        Building minimal APK with EAS (Expo Application Services)
echo ====================================================================
echo.

REM Install EAS CLI if not already installed
echo Installing or updating EAS CLI...
call npm install -g eas-cli
if %ERRORLEVEL% NEQ 0 (
    echo Warning: Failed to install EAS CLI globally, trying local installation...
    call npm install eas-cli --save-dev
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to install EAS CLI.
        exit /b 1
    )
)
echo.

REM Clean unnecessary assets to reduce APK size
echo Cleaning assets to reduce APK size...
node scripts/clean-assets.js
if %ERRORLEVEL% NEQ 0 (
    echo Failed to clean assets. Continuing anyway...
)
echo.

REM Build the APK using EAS
echo Building minimal APK using EAS...
call npx eas build --platform android --profile minimal-apk --local
if %ERRORLEVEL% NEQ 0 (
    echo Failed to build APK with EAS.
    exit /b 1
)
echo.

echo ====================================================================
echo                        BUILD COMPLETED!
echo ====================================================================
echo.
echo Your APK should be available in the build/ directory.
echo. 