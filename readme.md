# Noname
## Summary
IONIC2 boilerplate with karma jasmine unit tests

## Setup
- npm i
- ionic serve

## Android
- install android studio and install an android emulator
- cordova plugin add cordova-plugin-crosswalk-webview
- cordova platform add android --save
- ionic build android --release
- import platform directory in android studio
- cordova plugin add cordova-plugin-media
- ionic emulate android
- cordova run android --list
- cordova run android --device
You can add additional flags when using  ionic run.

-c will show console logs.
-s will show server logs.
-l will perform live reload of the application when code changes.
So you can use something like ionic run android -cls

Note that for livereload to work if the device is not connected directly make sure its in the same network as the serving device. Make sure to serve to a local IP address in this case (you can use ionic address to change that).


## Unit tests
- npm test
- http://lathonez.github.io/2016/ionic-2-unit-testing/

## Documentation
http://ionicframework.com/docs/v2/
https://developers.google.com/web/tools/chrome-devtools/remote-debugging/



