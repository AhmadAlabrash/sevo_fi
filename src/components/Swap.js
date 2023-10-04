import React, { useState, useEffect , useRef} from "react";
import { InputNumber,Input, Popover, Radio, Modal, message, Button } from "antd";
import {
  ArrowDownOutlined,
  DownOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import tokenListop from "../tokenListop.json";
import anychart from 'anychart';
import tokenListpo from "../tokenListpo.json";
import tokenListeth from "../tokenListeth.json";
import tokenListbs from "../tokenListbs.json";
import tokenListar from "../tokenListar.json";
import tokenListav from "../tokenListav.json";
import axios from "axios";
import { ethers } from 'ethers';

const qs = require('qs');



function Swap(props) {
  const {  account , isConnected , network , providert } = props; 
  let tokenList , networkName , baseUrl , url , chart , mainToken ;
  switch (network) {
    case 1:
      tokenList = tokenListeth ;
      networkName = 'Ethereum' ;
      baseUrl = 'https://api.0x.org'
      mainToken = 'eth'
      
      break;
    case 10:
      tokenList = tokenListop ;
      networkName = 'optimism';
      baseUrl = 'https://optimism.api.0x.org'
      mainToken = 'eth'
      break;
    case 56:
      tokenList = tokenListbs ;
      networkName = 'bsc';
      baseUrl = 'https://bsc.api.0x.org'
      mainToken = 'bnb'
      break;
    case 137:
        tokenList = tokenListpo ;
        networkName = 'polygon';
        baseUrl = 'https://polygon.api.0x.org'
        mainToken='matic'
        break;
    case 42161:
        tokenList = tokenListar ;
        networkName = 'arbitrum';
        baseUrl = 'https://arbitrum.api.0x.org'
        mainToken='eth'
        break;    
    case 43114:
        tokenList = tokenListav ;
        networkName = 'Avalanche';
        baseUrl = 'https://avalanche.api.0x.org/'
        mainToken ='avax'
        break;     
  

    }

  const [gasFee , setGasFee] = useState(0)
  const [balanceOfToken , setbalanceOfToken] = useState(0)
  const [contra, setContra] = useState(null)
  const chartRef = useRef(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [slippage, setSlippage] = useState(2.5);
  const [tokenOneAmount, setTokenOneAmount] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [tokenTwoAmount, setTokenTwoAmount] = useState(null);
  const [tokenOne, setTokenOne] = useState(tokenList[3]);
  const [tokenTwo, setTokenTwo] = useState(tokenList[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState(1);
  const [prices, setPrices] = useState(null);
  const [txDetails, setTxDetails] = useState({
    to:null,
    data: null,
    value: null,
  }); 


  const [isLoading , setIsLoading] = useState(false);
  const [isApproving , setApproving] = useState(false);
  const [isSuccess , setIsSuccess] = useState(false);
  const [isError , setIsError] = useState(false);
  const [isFetchingPrices , setisFetchingPrices] = useState(false);
  const [isFetchingPricesError , setisFetchingPricesError] = useState(false);
  const [isFetchingBalance , setisFetchingBalance] = useState(false);
  const [txHash , settxHash] = useState(false);
  const [tokenPriceDollar , settokenPriceDollar] = useState(0);
  const [tokenTwoPriceDollar , settokenTwoPriceDollar] = useState(0);
  const [isStillWritting , setisStillWritting] = useState(false);


  const handleSwap = async () => {
    if (tokenOneAmount === '0' || tokenOneAmount === null || account === null || isLoading === true || isApproving === true) {
      console.log('Error: Swap button should not be clicked');
    } else if (tokenOneAmount > balanceOfToken) {
      await setisFetchingBalance(true)
      setTimeout(() => {
        setisFetchingBalance(false);
      }, 3000);

    } else {
      fetchDexSwap();
    }
  };

  async function seeHashOnScan(){

    switch (network){
      case 137 : 
      url = `https://polygonscan.com/tx/${txHash}`;
      break;
      case 1 : 
      url = `https://etherscan.io/tx/${txHash}`;
      break;
      case 56 : 
      url = `https://bscscan.com/tx/${txHash}`;
      break;
      case 42161 : 
      url = `https://arbiscan.io/tx/${txHash}`;
      break;
      case 43114 : 
      url = `https://snowtrace.io/tx/${txHash}`;
      break;
  
    }
     
    // Open the URL in a new tab
    await window.open(url, '_blank');
  }


  function handleSlippageChange(e) {
    setSlippage(e.target.value);
  }

  
  async function changeAmount(e) { 
     await setTokenOneAmount(e.target.value);
     await setisStillWritting(true);
     await setTokenTwoAmount(null)
    

    setTimeout(async() => {
      await setisStillWritting(false);
    }, 1900);
  }

  async function switchTokens() {
   
    const one = await tokenOne;
    const two = await tokenTwo;

    await setTokenOne(two);
    await setTokenTwo(one);

    await getBalance(two.symbol) ; 

    await fetchPrices(two.address, one.address);

  }

  function openModal(asset) {
    setChangeToken(asset);
    setIsOpen(true);
  }
  async function getBalance(token_Name){

    if(account){
      const res = await axios.get(`https://sevo-dex-backend.onrender.com/getBalance?address=${account}&tokenName=${token_Name}&chain=${network}`);
      await console.log("here is my balance of the token : "+res.data)  ;
      await setbalanceOfToken(res.data)
      
    }else{
       console.log('account is not connected')
    }
  
  } 


  async function modifyToken(i){
    if (changeToken === 1) {
      await getBalance(tokenList[i].symbol) ; 
      await  setTokenOne(tokenList[i]);
      if (tokenOneAmount === '0' || tokenOneAmount === null ||  tokenOneAmount === 0){
        await setIsOpen(false);
        return;
      }else{
        fetchPrices(tokenList[i].address, tokenTwo.address)
      } 
    } else {
      await setTokenTwo(tokenList[i]);
      if (tokenOneAmount === '0' || tokenOneAmount === null ||  tokenOneAmount === 0){
        await setIsOpen(false);
        return;
      }else{
        fetchPrices(tokenOne.address, tokenList[i].address) }
    }
    await setIsOpen(false);
  }


  const approve = async ()=>{
    try{
      if (isNaN(tokenOneAmount) || tokenOneAmount === 0 || tokenOneAmount === null || tokenOneAmount === '0') {
        console.error("tokenOneAmount is zero. The function will not run.");
        return;
      }
   
    const zerox = '0xDef1C0ded9bec7F1a1670819833240f027b25EfF'  ;
    const erc20abi = [{ "inputs": [ { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "uint256", "name": "max_supply", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "burnFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" } ], "name": "decreaseAllowance", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" } ], "name": "increaseAllowance", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transfer", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }]

    const contrac = await new ethers.Contract(tokenOne.address , erc20abi , providert)
    
    await setContra(contrac)
    
    const currentAllowance = await contrac.allowance(account, zerox);

   if (currentAllowance < tokenOneAmount * (10 ** tokenOne.decimals)) {

      

     const signer = await  providert.getSigner();
     await setApproving(true)

     const trx = await contrac.connect(signer).approve(zerox, tokenOneAmount * (10 ** tokenOne.decimals))
     await trx.wait()

     await setApproving(false)
     await setTxDetails(trx.data);

          
    }
  }catch(err){
    await setIsLoading(false)
    await setIsSuccess(false)
    await setApproving(false)
    }
 }

  const fetchDexSwap = async ()=>{
    await setIsError(false)
    await approve()
  .then(async() => {
    if (isNaN(tokenOneAmount) || tokenOneAmount === 0 || tokenOneAmount === null || tokenOneAmount === '0') {
      console.error("tokenOneAmount is zero. The function will not run.");
      return;
    }

      const params = {
        sellToken: tokenOne.address, 
        buyToken: tokenTwo.address, 
        sellAmount: tokenOneAmount * (10 ** tokenOne.decimals), 
        takerAddress: account };
      console.log(params)  ;
    
      const headers = {'0x-api-key': '3d2a5f2b-a9b5-430d-bf36-83ad4ccf6070'}; 
  
      const response = await fetch(
        `${baseUrl}/swap/v1/quote?${qs.stringify(params)}`, { headers }); 
    
      const quote = await response.json();
      await console.log(quote)
    
    
      const signer2 = await providert.getSigner();
      await setIsLoading(true)
    
      const trx2 = await signer2.sendTransaction({
       gasLimit: quote.gas,
       gasPrice: quote.gasPrice,
       to: quote.to,
       data: quote.data,
       value: quote.value,
       chainId: quote.chainId,
       });
    
       await trx2.wait()
       await settxHash(trx2.hash)
       await console.log(trx2)
    
       
       await setIsLoading(false)
       await setIsSuccess(true)
       await setTxDetails(trx2.data.tx);
  })
  .catch(async(error) => {

    await setIsError(true)
    await setIsLoading(false)
    await setIsSuccess(false)
  });
}

async function fetchPrices(one, two ){
  try {
    if (isFetchingPrices || isNaN(tokenOneAmount) || tokenOneAmount === 0 || tokenOneAmount === null || tokenOneAmount === '0' || tokenOneAmount === '00'|| tokenOneAmount === '000') {
      console.error("tokenOneAmount is zero. The function will not run.");
      return;
    }
      await setIsError(false)
      await setisFetchingPrices(true);
      
      const paramsb = {
        buyToken: two,
        sellToken: one,
        sellAmount: parseInt(tokenOneAmount * (10 ** tokenOne.decimals)) ,
      };  
      const headersb = {'0x-api-key': '36c9b9ea-dc6b-4bd6-9bde-34b12d905a58'}; 
  
      const responseb = await fetch(
        `${baseUrl}/swap/v1/price?${qs.stringify(paramsb)}`, { headers : headersb }); 

      if (!responseb.ok) {
        await setTokenTwoAmount(null);
        await setTokenOneAmount(null);          
          throw new Error(`Server returned `);
          return;
        }  
  
      const quoteb = await responseb.json();
      console.log(quoteb);
      const price =await  parseFloat(quoteb.price);
      const fee = await ((quoteb.gasPrice)* (quoteb.gas) )
      await setGasFee(fee)
      
  
      await  setPrices({
        'tokenOne' : 1 ,
        'tokenTwo' : 1 ,
        'ratio' : price

      })
       await setTokenTwoAmount((tokenOneAmount * price).toFixed(4))
      await setisFetchingPrices(false)  
    
  }catch (error)  {
    console.error("Fetching function error "+error);
    await setisFetchingPrices(false)
    await setisFetchingPricesError(true);
    setTimeout(() => {
      setisFetchingPricesError(false);
    }, 1000);

   
    await setTokenTwoAmount(null);
    await setTokenOneAmount(null);
  }
};

useEffect(()=>{

  messageApi.destroy();

  if(isFetchingBalance){
    messageApi.open({
      type: 'error',
      content: `Insufficient ${tokenOne.symbol} balance`,
      duration: 0,
    })
  }    

},[isFetchingBalance])

useEffect(()=>{

  messageApi.destroy();

  if(isFetchingPricesError){
    messageApi.open({
      type: 'error',
      content: `Please Change Amount You Have Been Entered`,
      duration: 0,
    })
  }    

},[isFetchingPricesError])

  useEffect(()=>{
    messageApi.destroy();
    if(isFetchingPrices){
      messageApi.open({
        type: 'loading',
        content: 'Fetching the best price ...',
        duration: 0,
      })
    }    

  },[isFetchingPrices])


  useEffect(()=>{
    messageApi.destroy();
    if(isLoading){
      messageApi.open({
        type: 'loading',
        content: 'Transaction is Pending...',
        duration: 0,
      })
    }    

  },[isLoading])

  useEffect(()=>{
    messageApi.destroy();
    if(isSuccess){
      messageApi.open({
        type: 'success',
        content: `Transaction Successful ,Click Here To View Transction Details`,
        onClick:() => seeHashOnScan(),
        duration: 5,
      })
    }else if(isError){
      messageApi.open({
        type: 'error',
        content:`Transaction Failed `,
        onClick:() => seeHashOnScan(),
        
        duration: 1.50,
      })
    }


  },[isSuccess,isError])

  useEffect(()=>{

    messageApi.destroy();

    if(isApproving){
      messageApi.open({
        type: 'loading',
        content: 'Approving Transaction Is Pending...',
        duration: 0,
      })
    }    

  },[isApproving])

  const settings = (
    <>
      <div>Slippage Tolerance</div>
      <div>
        <Radio.Group value={slippage} onChange={handleSlippageChange}>
          <Radio.Button value={0.5}>0.5%</Radio.Button>
          <Radio.Button value={2.5}>2.5%</Radio.Button>
          <Radio.Button value={5}>5.0%</Radio.Button>
        </Radio.Group>
      </div>
    </>
  );


  useEffect(()  => {
    if (!tokenTwoAmount && !isStillWritting && tokenOneAmount && (tokenOneAmount !== 0 ) && (tokenOneAmount !== '0' )&& (tokenOneAmount !== null )) {
        fetchPrices(tokenOne.address , tokenTwo.address );
    }
  }, [!isStillWritting && !tokenTwoAmount && tokenOneAmount && (tokenOneAmount !== 0 ) && (tokenOneAmount !== '0' )&& (tokenOneAmount !== null )]) 
  


  useEffect(() => {
    // Fetch data from the API
    axios
      .get(
        `https://api.coingecko.com/api/v3/coins/${tokenOne.coingeckoId}/market_chart?vs_currency=usd&days=30`
      )
      .then((response) => {
        // Extract the prices data from the API response
        const prices = response.data.prices;
        setChartData(prices);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [tokenOne]);

  useEffect(() => {

    
   
    if (chartData.length > 0) {

      const chartDataFormatted = chartData.map((data) => ({
        x: new Date(data[0]), // Convert the timestamp to a Date object
        value: data[1],
      }));

      if (chartRef.current) {
        chartRef.current.title(`${tokenOne.name} Price (USD)`)
        chartRef.current.data(chartDataFormatted);
      } else {

      chart = anychart.area();
      chart.animation(true);

      chart.title(`${tokenOne.name} Price (USD)`);
      chart.background().fill('transparent');
      chart.interactivity().hoverMode('by-x');

      // set data
      const area = chart.splineArea(chartDataFormatted);
      area.color('White 0.3');
      area.name('Price $');


      // set container and draw chart
      chart.container('chartcontainer').draw();

      chartRef.current = chart;
   }}
  }, [chartData]);

  useEffect(()=>{
    if ( isNaN(tokenOneAmount) || tokenOneAmount === 0 || tokenOneAmount === null || tokenOneAmount === '0' || tokenOneAmount === '00'|| tokenOneAmount === '000') {
    
      settokenPriceDollar(0)}else{
    const tokenNameCoinGecko = tokenOne.coingeckoId ; 
    axios
      .get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenNameCoinGecko}&vs_currencies=usd`
      )
      .then((response) => {
        // Extract the prices data from the API response
        const usdValue = response.data[tokenNameCoinGecko].usd;
        const usdMulTokenAm = (usdValue * tokenOneAmount).toFixed(3) ; 
        
        settokenPriceDollar(usdMulTokenAm)
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });}

  },[tokenOneAmount , tokenOne])
  useEffect(()=>{
    if ( isNaN(tokenTwoAmount) || tokenTwoAmount === 0 || tokenTwoAmount === null || tokenTwoAmount === '0' || tokenTwoAmount === '00'|| tokenTwoAmount === '000') {
    
      settokenTwoPriceDollar(0)
    }else{
    const tokenNameCoinGecko = tokenTwo.coingeckoId ; 
    axios
      .get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenNameCoinGecko}&vs_currencies=usd`
      )
      .then((response) => {
        // Extract the prices data from the API response
        const usdValue = response.data[tokenNameCoinGecko].usd;
        const usdMulTokenAm = (usdValue * tokenTwoAmount).toFixed(3) ; 
        
        settokenTwoPriceDollar(usdMulTokenAm)
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });}

  },[tokenTwoAmount , tokenTwo])


  return (
    <>
      {contextHolder}

      <Modal
        open={isOpen}
        footer={null}
        onCancel={() => setIsOpen(false)}
        title="Select a token"
      >
        <div className="modalContent">
          {tokenList?.map((e, i) => {
            return (
              <div
                className="tokenChoice"
                key={i}
                onClick={() => modifyToken(i)}
              >
                <img src={e.logoURI} alt={e.symbol} className="tokenLogo" />
                <div className="tokenChoiceNames">
                  <div className="tokenName">{e.name}</div>
                  <div className="tokenTicker">{e.symbol}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>



 <div style={{ display: 'flex', width: '100%',  height: '120vh' , overflow: 'hidden'  , paddingTop : '28px'}}>
      <div style={{ flex: '0.6', paddingLeft : '25px'}}>
        <div id="chartcontainer"  style={{height: '60%' }}></div>
      </div>
      <div style={{ flex: '0.4'  ,paddingTop : '30px'}}>
      <div className="container">
      <div className="tradeBox">
        <div className="tradeBoxHeader">
          <h2>Swap</h2>
          <Popover
            content={settings}
            title="Settings"
            trigger="click"
            placement="bottomRight"
          >
            <SettingOutlined className="cog" />
          </Popover>
        </div>
      <h6 style={{ margin: '0 0 0 0', paddingBottom: '5px'}}>Balance: {(balanceOfToken)? (balanceOfToken):(0.00)}</h6> 
        <div className="inputs">  
          <Input
            type="number"
            placeholder="0"
            value={tokenOneAmount}
            onChange={changeAmount}
            disabled={isFetchingPrices}
             />
        <h6 style={{ padding : ' 0 0 2px 0  ' , margin : '0' , fontSize : '11px'}}>Price: $ {(tokenPriceDollar)? (tokenPriceDollar):(0.00)}</h6>

          <Input  placeholder="0" value={tokenTwoAmount} disabled={true}  />
          <h6 style={{ padding : '0' , margin : '0'}}>Price: $ {(tokenTwoPriceDollar)? (tokenTwoPriceDollar):(0.00)}</h6>
          <h6 style={{ padding : ' 5px 0 2px 0  ' , margin : '0' , fontSize : '11px'}}>gasPrice:  {(gasFee)? ((gasFee/ 1000000000000000000 ).toFixed(4) + ` ${mainToken}`):(0.00)}</h6>

          <div className="switchButton" onClick={switchTokens} disabled={isFetchingPrices || isApproving || isLoading}>
            <ArrowDownOutlined className="switchArrow"  />
          </div>
          <div className="assetOne" onClick={() => openModal(1)}>
            <img src={tokenOne.logoURI} alt="assetOneLogo" className="assetLogo" />
            {tokenOne.symbol}
            <DownOutlined />
          </div>
          <div className="assetTwo" onClick={() => openModal(2)}>
            <img src={tokenTwo.logoURI} alt="assetOneLogo" className="assetLogo" />
            {tokenTwo.symbol}
            <DownOutlined />
          </div>
        </div>
        <div className="swapButton" onClick={handleSwap}>
       {(tokenOne.symbol ==  "MATIC" || tokenOne.symbol == "ETH" || tokenOne.symbol == "BNB" || tokenOne.symbol == "AVAX" ) ? 'Swap' : 'Approve & Swap' }
      </div>
      </div>
           
     </div>  
      </div>
    </div>     

     
    </>
  );
}

export default Swap;
