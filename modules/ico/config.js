import { createConfig, http } from "wagmi";
import { ChainConfig } from "../globals/BlockChainWrapper";

// --------------------------------------TESTNET START-------------------------------------------
export const ICO_CONTRACT_ADDRESS_BNB =
  "0x01b2904047C6A5B3e926b54089c092D6EEeBc5C2";
export const ICO_CONTRACT_ADDRESS_BNB_OLD =
  "0x8d5592bAfE543a16e18ABfeBb4F683E9bC12313C";
export const BNB_USDT_ADDRESS = "0x4855536EBD51eb6DFB492009959DF10e234ec48b";
export const BNB_USDC_ADDRESS = "0x4855536EBD51eb6DFB492009959DF10e234ec48b";
// --------------------------------------TESTNET END---------------------------------------------

// --------------------------------------MAINNET START-------------------------------------------

// export const ICO_CONTRACT_ADDRESS_BNB =
//   "0x9D46242bAd94121ff9Bf0F42652f8A726B0d421d";
// export const ICO_CONTRACT_ADDRESS_BNB_OLD =
//   "0x8d5592bAfE543a16e18ABfeBb4F683E9bC12313C";
// export const BNB_USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
// export const BNB_USDC_ADDRESS = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";

// --------------------------------------MAINNET END---------------------------------------------

const bsc = ChainConfig?.find((item) => item?.nativeCurrency?.symbol == "BNB");

export const bscConfig = createConfig({
  chains: [bsc],
  transports: {
    [bsc.id]: http(),
  },
});
