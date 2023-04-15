# Cryptalk

## Features

- [] use openAI models to interact with users to extract swap information
- [] use 1Inch fusion API to swap tokens
- [] use metamask SDK to interact with wallet
- [] use Airstack to fetch balances on Ethereum network
- [] use RPC to fetch balances on other networks

### Bot features

- [] get swap informations
- [x] show token user can swap (fetch user wallet balances) and told
- [] check has enough gas to swap
  - [] if not then tell the user to add gas (probably not a problem with fusion)
- [] check has enough token to swap
  - [] if not then they don't have enough token to swap

## TODO

- [x] conversation UI
  - [x] user input
  - [x] chat box with bot
  - [x] buttons + input
- [] swap logic using 1inch fusion SDK
- [] define decision tree for bot
  - [] what the user want to do
    - [x] if a swap then ask for the token to swap from
    - [x] if a swap then ask for the token to swap to
    - [x] if a swap then ask for the amount to swap
    - [] if a swap then ask for the network to swap on
