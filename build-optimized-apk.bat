@echo off
setlocal enabledelayedexpansion

echo ====================================================================
echo            Building optimized APK for Quizzoo App
echo ====================================================================
echo.

REM Set working directory
cd /d "%~dp0"

REM Clean unnecessary assets to reduce APK size
echo [1/7] Cleaning assets to reduce APK size...
node scripts/clean-assets.js
if %ERRORLEVEL% NEQ 0 (
    echo Failed to clean assets. Continuing anyway...
)
echo.

REM Clean up build files from previous builds
echo [2/7] Cleaning up previous build files...
rd /s /q android\app\build 2>nul
rd /s /q android\.gradle 2>nul
echo Done.
echo.

REM Run Expo prebuild to generate native code
echo [3/7] Generating native Android project...
call npx expo prebuild --platform android --clean
if %ERRORLEVEL% NEQ 0 (
    echo Failed to prebuild the project.
    goto ERROR
)
echo.

REM Skip keystore creation as it's not critical for development APK
echo [4/7] Skipping keystore creation for development build...
echo Using debug signing configuration.
echo.

REM Generate production bundle
echo [5/7] Generating production JavaScript bundle...
mkdir android\app\src\main\assets 2>nul
call npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res
if %ERRORLEVEL% NEQ 0 (
    echo Failed to generate JavaScript bundle.
    goto ERROR
)
echo.

REM Build the APK
echo [6/7] Building release APK with optimizations...
cd android
call gradlew.bat assembleRelease
if %ERRORLEVEL% NEQ 0 (
    echo Failed to build APK.
    cd ..
    goto ERROR
)
cd ..
echo.

REM Copy the APK to an easy-to-find location
echo [7/7] Finalizing APK...
if not exist build mkdir build
copy android\app\build\outputs\apk\release\app-release.apk build\quizzoo-app.apk
if %ERRORLEVEL% NEQ 0 (
    echo Failed to copy APK to build directory.
    goto ERROR
)

echo ====================================================================
echo                        BUILD SUCCESSFUL!
echo ====================================================================
echo.
echo Your optimized APK is available at:
echo %CD%\build\quizzoo-app.apk
echo.
echo APK Size: 
for %%I in (build\quizzoo-app.apk) do echo %%~zI bytes
echo.
echo You can install this APK on an Android device.
goto END

:ERROR
echo ====================================================================
echo                        BUILD FAILED!
echo ====================================================================
echo.
echo Please check the errors above and try again.
exit /b 1

:END
echo.
echo Thank you for using Quizzoo App Builder!
exit /b 0 