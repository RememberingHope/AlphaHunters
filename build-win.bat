@echo off
echo Building AlphaHunters installer...
set CSC_IDENTITY_AUTO_DISCOVERY=false
set WIN_CSC_LINK=
set WIN_CSC_KEY_PASSWORD=
npm run build-win
echo Build complete! Check the dist folder for the installer.