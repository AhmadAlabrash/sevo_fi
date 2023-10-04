import React from 'react'
import {Button, Modal} from "antd";
import tokenListeth from "../tokenListeth.json";
import { useState, useEffect } from 'react';

function Tokens() {
  
  const [isOpen , setIsOpen] = useState(false);
  const showModal = () => {
    setIsOpen(true);
  };



  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <>
    <Button style={{'backgroundColor' : 'white'  }} onClick={showModal}>
    Open Tokens List
  </Button>
    <Modal
    open={isOpen }
    footer={null}
    title="Select a token"
    onCancel={handleCancel}
    >

    <div className="modalContent">
    {tokenListeth?.map((e, i) => {
      return (
        <>
       
        <div
          className="tokenChoice2"
          key={i}
        >
          <img src={e.logoURI} alt={e.symbol} className="tokenLogo" />
          <div className="tokenChoiceNames">
            <div className="tokenName2">{e.name}</div>
            <div className="tokenTicker2">{e.symbol}</div>
            <div className="tokenName2">{e.address.slice(0,4) +"..." +e.address.slice(38)}</div>
          </div>
        </div>
        </>
      );
    })}
  </div>
  </Modal>
  </>
  
  
  )
}

export default Tokens