@echo off
echo Building optimized APK for Android...
echo.

REM Run the optimized build script
node scripts/build-optimized-apk.js

IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo Build script failed, trying direct EAS build command...
    echo.
    npx eas build -p android --profile minimal --local
    
    IF %ERRORLEVEL% NEQ 0 (
        echo.
        echo EAS build failed, trying traditional Expo build...
        echo.
        npx expo prebuild --platform android --clean
        cd android
        gradlew.bat assembleRelease
        cd ..
        
        IF %ERRORLEVEL% NEQ 0 (
            echo.
            echo All build methods failed. Please check your environment setup and try again.
            exit /b 1
        ) ELSE (
            echo.
            echo APK built successfully!
            echo Your APK is available at: android\app\build\outputs\apk\release\app-release.apk
        )
    )
)

echo.
echo Build process completed. If successful, your APK will be available for download.
echo. 