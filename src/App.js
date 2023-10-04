import "./App.css";
import Header from "./components/Header";
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

import Swap from "./components/Swap";
import Tokens from "./components/Tokens";
import Buy from "./components/Buy";
import { Routes, Route } from "react-router-dom";
import { useConnect, useAccount ,useContract  } from "wagmi";
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useWeb3ModalState } from '@web3modal/wagmi/react'


function App() {
  
  const { address, isConnected } = useAccount();
  const [account, setAccount] = useState(null)
  const [providert, setprovidert] = useState(null)
  const [network, setNetwork] = useState(null)
  const [tokenListMainApp, settokenListMainApp] = useState(null)
  const { open, selectedNetworkId , close } = useWeb3ModalState()




  useEffect(()=>{
   const providereth = new ethers.providers.Web3Provider(window.ethereum);
   setprovidert(providereth);
   setAccount(address)
   setNetwork(selectedNetworkId); 
 
  } , [selectedNetworkId && isConnected])

  useEffect(() => {
    // Listen for the 'chainChanged' event to detect when the user changes networks
      window.ethereum.on('chainChanged', () => {
      // Reload the page when the network is changed
      window.location.reload();
    });})
  
  return (

    <div className="App" >
      <Header />
      <div className="mainWindow">
{network === 1 || network === 56 || network === 137 || network === 42161 || network === 10 || network === 43114 ? (        <Routes>
          <Route path="/" element={<Swap account={account} isConnected={isConnected} network={network} providert={providert} />} />
          <Route path="/tokens" element={<Tokens  />} />
          <Route path="/buy" element={< Buy />} />

        </Routes>): (<div>We are available now just on Ethereum , OP Mainnet , Binance Chain , Polygon , Avalanche and Arbitrum .</div>)}
      </div>

    </div>
  )
}

export default App;
