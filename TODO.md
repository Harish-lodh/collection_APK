# Fix Bottom Tab Icons (Missing Vector Icons Fonts)

Status: [In Progress]

## Steps:

### 1. Copy MaterialIcons fonts from node_modules
- Fonts needed: MaterialIcons-Regular.[ttf|otf]
- From: `node_modules/react-native-vector-icons/Fonts/`
- Create dirs: `mkdir -p assets/fonts`, `mkdir -p android/app/src/main/assets/fonts`

### 2. Update package.json postinstall script (auto-copy fonts)
### 3. Platform setup
- **Android**: Copy fonts to `android/app/src/main/assets/fonts/`
- **iOS**: Add fonts to Xcode project or Info.plist
### 4. Clean & Rebuild
- `npx react-native start --reset-cache`
- Android: `cd android && ./gradlew clean && cd .. && npx react-native run-android`
- iOS: `cd ios && pod install && cd .. && npx react-native run-ios`
### 5. Test CustomerTabNavigator icons

**Next step ready: Execute font copy commands**
