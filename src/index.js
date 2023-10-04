import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'

import { WagmiConfig , useAccount} from 'wagmi'
import { arbitrum, avalanche, bsc, mainnet, optimism, polygon } from 'wagmi/chains'
/*
import { configureChains, mainnet, WagmiConfig, createClient } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

const { provider, webSocketProvider } = configureChains(
  [mainnet],
  [publicProvider()]
);

const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
}); */

// 1. Get projectId
const projectId = 'cc2b576ca58c22f7887c9eaa6079bef3'

// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [ mainnet, bsc,  polygon ,  optimism ,  arbitrum, avalanche]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains })

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
   <WagmiConfig config={wagmiConfig}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      </WagmiConfig>
  </React.StrictMode>
);