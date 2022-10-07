# 1.2.4 (2022-10-07)

## Changed 
+ Changed "Storage Usage" on the dashboard to "Physical Storage Usage"
+ Changed "Est. Data Size" on the contracts page to "Stored Data"
+ Remove use of electron remote, switch to custom IPC

## Fixed
+ Fixed overlapping error text in the add storage modal

# 1.2.3 (2022-07-21)

## Changed
+ Update to siad v1.5.9

## Fixed
+ Fixed a null value error when calculating contract values on startup

# 1.2.2 (2022-06-12)

## Changed
+ Lowered the recommended registry size

## Fixed
+ Fixed an issue with pending payout calculation

# 1.2.1 (2022-06-05)

## Fixed
+ Fixed an issue with changing the host's max duration

# 1.2.0 (2022-05-31)

## Changed
+ Update to siad v1.5.8
+ Use `yarn` instead of `npm`
+ Add/Remove/Resize folder modals are non-blocking again.

## Added
+ arm64 releases for all platforms
+ Payout date column to show payout availability
+ Renewed column to show if a contract has been renewed.
+ Show pending payouts with wallet balance
+ New alerts for all folder operations

# 1.1.1 (2021-11-15)

## Fixed
+ Fixed a bug in host announcement when using a non-standard API port.

## Added
+ Added Account Funding to the contracts page

# 1.1.0 (2021-10-06)

## Changed
+ Removed the exchange rate from all currency columns on the contract page.
+ Removed the fee manager integration and reoccuring donations.
+ Max collateral is no longer automatically calculated.

## Added
+ Added max collateral to the config page.
+ Added the ability to send Siacoins from the wallet page.
+ Added a base exchange rate column to the contracts page showing the exchange rate of the contract's payout
+ Added a gain/loss column to the contracts page showing the percent change in value over the initial payout's value

# 1.0.35 (2021-09-21)

## Fixed
+ Fix lockup when starting host manager
+ Fix sync status in setup showing NaN%

## Changed
+ Update to Sia v1.5.7
+ Add/remove/delete folder dialogs can no longer be closed when they're waiting to complete.

## Added
+ Added a "max" button to the add storage folder modal.
+ Added "Cost Basis" column to contract financials and contract export. "Cost Basis" is calculated using the exchange rate at the time the revenue was received.
+ Additional random known working peers from Sia Central's network scanner will be added for the initial sync.

# 1.0.34 (2021-04-17)

## Fixed
+ Fix description for upload price

## Changed
+ Update siad to v1.5.6
+ Remove contract status warnings

# 1.0.33 (2021-03-25)

## Fixed
+ Fixed icons on macOS

## Changed
+ Patches Sia v1.5.5 to fix gateway using excessive bandwidth. For more information see: [Sia MR#5144](https://gitlab.com/NebulousLabs/Sia/-/merge_requests/5144)

## Added
+ Window state will now be stored/loaded when opening Host Manager

# 1.0.32 (2021-02-28)

## Fixed
+ Fix max collateral calculation for unpinned settings

## Changed
+ Set default display currency to USD
+ Removed Transak integration

# 1.0.31 (2021-02-20)

## Fixed
+ Fixed issue with display currency being overridden to USD

## Changed
+ Update to Sia v1.5.5

# 1.0.30 (2021-01-13)

## Changed
+ Update to Sia v1.5.4

# 1.0.29 (2020-12-23)

## Fixed
+ Fixed issue where users were not being asked to import data path from Sia-UI
+ Fixed issue where users were not able to select a folder from the dialog
+ Fixed issues with setup when siad is inaccessible
+ Fixed issue where display currency was defaulting to sc

# 1.0.28 (2020-11-11)

## Changed
+ Update to Sia v1.5.3

# 1.0.27 (2020-11-10)

## Fixed
+ Fixed mislabeled Revise Batch Size field on host config page

## Changed
+ Update to Sia v1.5.2

# 1.0.26 (2020-11-04)

## Fixed
+ Fixed setting custom registry path
+ Fixed unpinned prices updating
+ Fix filter panel showing under table headers

# 1.0.25 (2020-11-04)

## Fixed
+ Fixed setting custom registry path

# 1.0.24 (2020-11-04)

## Fixed
+ Fixed issue with changing RHP3 ports in settings

## Changed
+ All data will now be shown in Siacoin and the selected display currency
+ Reordered configuration page
+ Use currency input on configuration page
+ Show skynet registry data on dashboard

## Added
+ Added Skynet registry config to configuration page

# 1.0.23 (2020-09-18)

## Fixed
+ Fixed memory leak in contracts page

## Changed
+ Move "Receive Siacoin" modal to primary navigation

## Added
+ Added collateral totals to dashboard
+ Added donation modal

# 1.0.22 (2020-08-07)

## Fixed
+ Fixed earned revenue and lost revenue calculations
+ Fix display issue for negative values

# 1.0.21 (2020-08-06)

## Changed
+ Update Sia to v1.5.0
+ Update Dashboard

## Fixed
+ Fix memory leak on large hosts

# 1.0.20 (2020-07-01)

## Fixed
+ Fixed issues from Electron 9 upgrade
+ Fixed contract export button

# 1.0.19 (2020-06-28)

## Fixed
+ Fixed issue with connecting to the Sia Central API with certain Linux distributions

## Changed
+ Updated Electron dependency to v9.0.5
+ Updated Sia to v1.4.11-crashfix to fix hosts affected by https://gitlab.com/NebulousLabs/Sia/-/issues/4215

## Added
+ Added "Buy Siacoin" button to Receive Siacoin modal powered by Transak

# 1.0.18 (2020-06-06)

## Changed
+ Updated Sia to v1.4.11

# 1.0.17 (2020-06-04)

## Changed
+ Updated Sia to v1.4.10

# 1.0.16 (2020-05-18)

## Added
+ Added SiaMux port config option

# 1.0.15 (2020-05-13)

## Fixed
+ Fix issues with contract filtering

# 1.0.14 (2020-05-12)

## Fixed
+ Fixed issue with unit conversion when using binary units
+ Fixed issue with close icon on filter panel being covered on windows

## Changed
+ Updated siad binaries to v1.4.8

# 1.0.13 (2020-04-08)

## Added
+ Added 24 hour delay between pinned price updates due to a bug in Sia causing renters to not renew contracts when the host's pricing has changed. https://gitlab.com/NebulousLabs/Sia/-/merge_requests/4326

# 1.0.12 (2020-04-06)

## Fixed
+ Fixed issue with contract fees for failed contracts causing negative values

## Changed
+ Removed "unused" label from contracts
+ Update bundled Sia Daemon to v1.4.7

# 1.0.11 (2020-05-26)

## Changed
+ Update bundled Sia Daemon to v1.4.6

# 1.0.10 (2020-05-25)

## Fixed
+ Fixed issue with currency parsing in some locales

## Changed
+ Update bundled Sia Daemon to v1.4.5

# 1.0.9 (2020-05-18)

## Changed
+ Update bundled Sia Daemon to v1.4.4
+ Allow changing Sia API password from within Host Manager when incorrect

# 1.0.8 (2020-02-19)

## Changed
+ Update bundled Sia Daemon to v1.4.3

# 1.0.7 (2020-01-29)

## Changed
+ Updated bundled Sia Daemon to v1.4.2.1

## Fixed
+ Fixed issue with automatic bootstrap during setup

# 1.0.6 (2019-12-24)

## Fixed
+ Fixed memory issues with contract parsing. Older and larger hosts should be quicker and more stable.
+ Fixed memory leaks when communicating with the main js process

## Changed
+ Switched all endpoints to Sia Central's new v2 API
+ Updated bundled Sia Daemon to v1.4.2.0
+ Switched from AWS S3 distribution to generic distribution

## Added
+ Brand new contracts page. Dynamic filtering and column display for host contracts

# 1.0.5 (2019-04-10)

## Fixed
+ Fixed lock up when Sia crashes while loading due to configuration issue
+ When setting up the Import step would not allow you to select "No" to use custom settings.
+ Fixed an issue with bootstrapping a fresh install of Host Manager throwing an error that the directory doesn't exist.
+ Fixed an error with a notification showing that the wrong chain is synced even when synced from scratch.
+ Fixed issue with setup not accepting a blank data path for default location
+ User Agent and API Password settings will now actually work and override the defaults when starting the daemon or accessing the API

## Changed
+ Connectivity icon in navigation bar will no longer show an error for issues not related to connectability (wrong version, not accepting contracts, etc).
+ Currency values above 10000 will now be shown with a "KSC" suffix to prevent overflow with extremely large values.
+ Host Manager will no longer generate a new address at startup. It will reuse the last generated address unless none exists.
+ Restart Daemon will only show in the tray if Sia is being managed by Host Manager.

## Added
+ Automatic updates - Host Manager will now check for updates every 4 hours. An icon will appear in the lower left when an update is ready to install
+ Added a new setting for data units - storage sizes and prices can now be shown in TiB or TB. Defaults to TiB (1024 GiB = 1 TiB)
+ Added a new screen called "Host Analytics" shows detailed breakdowns of contracts and revenue.
+ Added a new button to About dialog "Application Log" which opens the application log when clicked.

# 1.0.4 (2019-09-21)

## Fixed
+ Reduce memory usage
+ Host port and RPC port placeholders on settings modal where switched
+ Changing host port or RPC port from the settings modal didn't work
+ Saving settings could trigger Host Manager to start in light mode instead of dark mode which is not complete.

# 1.0.3 (2019-09-18)

## Fixed
+ Added a loading message when pulling data from the Sia API
+ Fix issue with Sia-UI import skipping advanced setup
+ Fix sia loading message only picking up odd numbered modules.
+ Fix siad not being shutdown on exit on Mac OS
+ Fix issue with "Contract Cost" being `NaN` when revenue is split
+ Fix about modal not scrolling when at smallest screen size

## Added
+ Make all numbers and dates adhere to locale specific formatting.
+ Add bootstrapping to setup
+ Add restart daemon menu item to tray
+ Add validation to host Announce modal to help prevent bad announces
+ Add validation to settings modal
+ Add rpc port and host port to settings modal

# 1.0.2 (2019-08-23)

## Fixed
+ Fix an issue where exiting Sia-UI would cause Host Manager to lose connection to Sia

## Changed
+ Update siad binary to latest version v1.4.1.1
+ Change market price API to use Sia Central market data which uses CoinGecko under the hood instead of CoinGecko directly

# 1.0.1 (2019-08-21)

## Fixed
+ Fix display issue with alert panel on Windows
+ Fix issue with blank screen after setup completion. Should now display the loading screen
+ Fix issue with windows binary not being packaged properly when using fresh source
+ Replace all branding titles with "Sia Host Manager" instead of "Sia Central"
+ siad will now properly be included on all platforms

## Added
+ Add receive Siacoin button to get an address to top up wallet.
+ Add address QR code to Receive Siacoin modal
+ Add loading message when pulling data from the Sia API

# 1.0.0 (2019-08-17)

## Fixed
+ Add timeout to all API requests to prevent the app from permanently locking up
+ Change the pinned pricing to update when the coin price is refreshed instead of with the config refresh
+ Fixed the siad launch flags for `host-addr` and `rpc-addr`
+ Changed the default data path to the Sia Central data path instead of the Sia-UI data path unless changed
+ Fixed the display issues on Linux
+ Fixed issue with clicking Accept Contract not enabling the Update button on the config page

# 0.1.3 (2019-08-08)

## Fixed
+ Change default font to be system font on all platforms
+ Fixed an issue with scrollbar not appearing on storage page
+ Fixed sorting of the storage page to be alphabetical and numerical instead of just alphabetical
+ Changed dashboard contract graph to only include used contracts
+ Fixed an issue with the configuration page update button being enabled before any values had changed

## Added
+ When setting host configuration you can now pin currency to Fiat or Crypto exchange rates.
+ When adding storage locations you can now split folders over 4TB into smaller folders automatically for easier management.

# 0.1.2 (2019-08-02)

## Fixed
+ Fix look of scrollbars on windows

## Added
+ Pull in additional host data from Sia Central explorer
+ Add wallet creation and recovery
+ Add wallet unlock
+ Add automatic wallet unlock
+ Add friendly status `Rejected` for contract status of `obligationRejected`

# 0.1.1 (2019-07-29)

## Fixed
+ Fix issue with donut allowing over 100% groups

## Changed
+ Change currency display to only show a maximum of 2 significant decimals when using Fiat

## Added
+ Added total row to contract grid
+ Add host health alerts
+ Remove extra padding near title bar on windows
+ Added About modal for basic information
+ Automatically starts Sia Daemon if it's not already running
+ Add additional host information from Sia Central explorer

# 0.1.0 (2019-07-27)
## Added
+ Connect to existing or start new daemon
+ Check host connectability
+ Automatically unlock host wallet
+ Add, remove, resize storage folders
+ Announce host
+ Update host configuration
+ View host contracts
+ View financials in different fiat and crypto currencies