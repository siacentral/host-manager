## August 2019

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