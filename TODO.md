### Sia Central Desktop To-Do

#### Package

+ Customize Auto Updater
+ Customize "About" menu item on Mac
+ Create Linux AppImage release

+ Code Sign on Windows
	+ Needs a special and expensive code signing certificate to fully get around defender.

#### Sync

+ Change all data syncing to background thread using `fork` or webworker whichever is easier to work with

#### Bugs

+ Fix issue when Sia is running but not fully loaded throwing exceptions

#### Clean up

+ Unit tests
+ Refactor data store