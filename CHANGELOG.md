## November 2020

### v1.0.25

### Bug Fixes

+ Fixed setting custom registry path

### v1.0.24

### Bug Fixes

+ Fixed issue with changing RHP3 ports in settings

### Changes

+ All data will now be shown in Siacoin and the selected display currency
+ Added Skynet registry config to configuration page
+ Reordered configuration page
+ Use currency input on configuration page
+ Show skynet registry data on dashboard

## September 2020

### v1.0.23

### Bug Fixes

+ Fixed memory leak in contracts page

### Changes

+ Added collateral totals to dashboard
+ Added donation modal
+ Move "Receive Siacoin" modal to primary navigation

## August 2020

### v1.0.22

### Bug Fixes

+ Fixed earned revenue and lost revenue calculations
+ Fix display issue for negative values

### v1.0.21

### Changes

+ Update Sia to v1.5.0
+ Update Dashboard

### Bug Fixes

+ Fix memory leak on large hosts

## July 2020

### v1.0.20

### Bug Fixes

+ Fixed issues from Electron 9 upgrade
+ Fixed contract export button

## June 2020

### v1.0.19

### Changes

+ Added "Buy Siacoin" button to Receive Siacoin modal powered by Transak
+ Updated Electron dependency to v9.0.5
+ Updated Sia to v1.4.11-crashfix to fix hosts affected by https://gitlab.com/NebulousLabs/Sia/-/issues/4215

### Bug Fixes

+ Fixed issue with connecting to the Sia Central API with certain Linux distributions

### v1.0.18

### Changes

+ Updated Sia to v1.4.11

### v1.0.17

### Changes

+ Updated Sia to v1.4.10

## May 2020

### v1.0.16

### Changes

+ Added SiaMux port config option

### v1.0.15

### Bug Fixes

+ Fix issues with contract filtering

### v1.0.14

### Changes

+ Updated siad binaries to v1.4.8

### Bug Fixes

+ Fixed issue with unit conversion when using binary units
+ Fixed issue with close icon on filter panel being covered on windows

## April 2020

### v1.0.13

### Changes

+ Added 24 hour delay between pinned price updates due to a bug in Sia causing renters to not renew contracts when the host's pricing has changed. https://gitlab.com/NebulousLabs/Sia/-/merge_requests/4326

### v1.0.12

### Bug Fixes

+ Fixed issue with contract fees for failed contracts causing negative values

### Changes

+ Removed "unused" label from contracts
+ Update bundled Sia Daemon to v1.4.7

## March 2020

### v1.0.11

### Changes

+ Update bundled Sia Daemon to v1.4.6

### v1.0.10

### Bug Fixes

+ Fixed issue with currency parsing in some locales

### Changes

+ Update bundled Sia Daemon to v1.4.5

### v1.0.9

### Changes

+ Update bundled Sia Daemon to v1.4.4
+ Allow changing Sia API password from within Host Manager when incorrect

## February 2020

### v1.0.8

### Changes

+ Update bundled Sia Daemon to v1.4.3

## January 2020

### v1.0.7

### Changes

+ Updated bundled Sia Daemon to v1.4.2.1

### Bug Fixes

+ Fixed issue with automatic bootstrap during setup

## December 2019

### v1.0.6

#### Features

+ Brand new contracts page. Dynamic filtering and column display for host contracts

#### Changes

+ Switched all endpoints to Sia Central's new v2 API
+ Updated bundled Sia Daemon to v1.4.2.0
+ Switched from AWS S3 distribution to generic distribution

#### Bug Fixes

+ Fixed memory issues with contract parsing. Older and larger hosts should be quicker and more stable.
+ Fixed memory leaks when communicating with the main js process

## October 2019

### v1.0.5

Some features, bug fixes and more fine tuning!

#### Features

+ Automatic updates - Host Manager will now check for updates every 4 hours. An icon will appear in the lower left when an update is ready to install
+ Added a new setting for data units - storage sizes and prices can now be shown in TiB or TB. Defaults to TiB (1024 GiB = 1 TiB)
+ Added a new screen called "Host Analytics" shows detailed breakdowns of contracts and revenue.
+ Added a new button to About dialog "Application Log" which opens the application log when clicked.

#### Changes

+ Connectivity icon in navigation bar will no longer show an error for issues not related to connectability (wrong version, not accepting contracts, etc).
+ Currency values above 10000 will now be shown with a "KSC" suffix to prevent overflow with extremely large values.
+ Host Manager will no longer generate a new address at startup. It will reuse the last generated address unless none exists.
+ Restart Daemon will only show in the tray if Sia is being managed by Host Manager.

#### Bug Fixes

+ Fixed lock up when Sia crashes while loading due to configuration issue
+ When setting up the Import step would not allow you to select "No" to use custom settings.
+ Fixed an issue with bootstrapping a fresh install of Host Manager throwing an error that the directory doesn't exist.
+ Fixed an error with a notification showing that the wrong chain is synced even when synced from scratch.
+ Fixed issue with setup not accepting a blank data path for default location
+ User Agent and API Password settings will now actually work and override the defaults when starting the daemon or accessing the API

## September 2019

### v1.0.4

Quick bug fix release from issues discovered with v1.0.3

#### Bug Fixes

+ Reduce memory usage
+ Host port and RPC port placeholders on settings modal where switched
+ Changing host port or RPC port from the settings modal didn't work
+ Saving settings could trigger Host Manager to start in light mode instead of dark mode which is not complete.

### v1.0.3

Updates Sia to the latest hotfix v1.4.1.2 along with bug fixes, minor improvements, and consensus bootstraping

#### Features

+ Make all numbers and dates adhere to locale specific formatting.
+ Add bootstrapping to setup
+ Add restart daemon menu item to tray
+ Add validation to host Announce modal to help prevent bad announces
+ Add validation to settings modal
+ Add rpc port and host port to settings modal

#### Bug Fixes

+ Added a loading message when pulling data from the Sia API
+ Fix issue with Sia-UI import skipping advanced setup
+ Fix sia loading message only picking up odd numbered modules.
+ Fix siad not being shutdown on exit on Mac OS
+ Fix issue with "Contract Cost" being `NaN` when revenue is split
+ Fix about modal not scrolling when at smallest screen size

## August 2019

### v1.0.2

Release to update Sia to latest hotfix

#### Features

+ Update siad binary to latest version v1.4.1.1
+ Change market price API to use Sia Central market data which uses CoinGecko under the hood instead of CoinGecko directly

#### Bug Fixes

+ Fix an issue where exiting Sia-UI would cause Host Manager to lose connection to Sia

### v1.0.1

Small bug fix release with a few additional features. 

#### Features

+ Add receive Siacoin button to get an address to top up wallet.
+ Add address QR code to Receive Siacoin modal
+ Add loading message when pulling data from the Sia API

#### Bug Fixes

+ Fix display issue with alert panel on Windows
+ Fix issue with blank screen after setup completion. Should now display the loading screen
+ Fix issue with windows binary not being packaged properly when using fresh source
+ Replace all branding titles with "Sia Host Manager" instead of "Sia Central"
+ siad will now properly be included on all platforms

### v1.0.0 Initial Release of Sia Central

#### Bug Fixes

+ Add timeout to all API requests to prevent the app from permanently locking up
+ Change the pinned pricing to update when the coin price is refreshed instead of with the config refresh
+ Fixed the siad launch flags for `host-addr` and `rpc-addr`
+ Changed the default data path to the Sia Central data path instead of the Sia-UI data path unless changed
+ Fixed the display issues on Linux
+ Fixed issue with clicking Accept Contract not enabling the Update button on the config page

### v0.1.3

Fourth alpha release of Sia Central.

#### Features

+ When setting host configuration you can now pin currency to Fiat or Crypto exchange rates.
+ When adding storage locations you can now split folders over 4TB into smaller folders automatically for easier management.

#### Bug Fixes

+ Change default font to be system font on all platforms
+ Fixed an issue with scrollbar not appearing on storage page
+ Fixed sorting of the storage page to be alphabetical and numerical instead of just alphabetical
+ Changed dashboard contract graph to only include used contracts
+ Fixed an issue with the configuration page update button being enabled before any values had changed

## July 2019

### v0.1.2

Third alpha release of Sia Central Desktop. All functionality implemented

+ Fix look of scrollbars on windows
+ Pull in additional host data from Sia Central explorer
+ Add wallet creation and recovery
+ Add wallet unlock
+ Add automatic wallet unlock
+ Add friendly status `Rejected` for contract status of `obligationRejected`

### v0.1.1

Second alpha release of Sia Central Desktop.

+ Added total row to contract grid
+ Change currency display to only show a maximum of 2 significant decimals when using Fiat
+ Add host health alerts
+ Fix issue with donut allowing over 100% groups
+ Remove extra padding near title bar on windows
+ Added About modal for basic information
+ Automatically starts Sia Daemon if it's not already running
+ Add additional host information from Sia Central explorer

### v0.1.0

Initial alpha release of Sia Central Desktop. Most of the main features have been completed and tested.

+ Connect to existing or start new daemon
+ Check host connectability
+ Automatically unlock host wallet
+ Add, remove, resize storage folders
+ Announce host
+ Update host configuration
+ View host contracts
+ View financials in different fiat and crypto currencies