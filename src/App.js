import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import myNFT from './utils/MyNFT.json';

// Constants
const TWITTER_HANDLE = 'heyztb';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-3uyldohbsq';
const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = "0xf14aa29cdfB105707df2E0E202226b81662Dabf9";

const App = () => {

  const [currentMintCount, setCurrentMintCount] = useState(0);
  const [currentAccount, setCurrentAccount] = useState("");

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have MetaMask");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account", account);
      setCurrentAccount(account);
      let mintCount = await updateMintCount();
      setCurrentMintCount(mintCount);
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  }

  const checkNetwork = async () => {
    const { ethereum } = window;
    let chainId = await ethereum.request({ method: "eth_chainId" });
    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network! Please connect to it in your Metamask Wallet to continue.");
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      let mintCount = await updateMintCount();
      setCurrentMintCount(mintCount);
      setupEventListener();
    } catch (e) {
      console.log(e);
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myNFT.abi, signer);

        connectedContract.on("NewNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
        });

        console.log("Setup Event Listener");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (e) {
      console.log(e);
    }
  }

  const askContractToMintNFT = async () => {

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myNFT.abi, signer);

        console.log("Popping wallet to pay Gas Fees");
        let nftTxn = await connectedContract.makeNFT();

        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

        let mintCount = await updateMintCount();
        setCurrentMintCount(mintCount);
      } else {
        console.log("No ethereum object!");
      }
    } catch (e) {
      console.log(e);
    }
  }

  const updateMintCount = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myNFT.abi, signer);

        let mintCount = await connectedContract.getTotalNFTsMintedSoFar();

        return mintCount;
      } else {
        console.log("No ethereum object!");
      }
    } catch (e) {
      console.log(e);
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
    checkNetwork();
    //eslint-disable-next-line
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
              <>
                <button onClick={askContractToMintNFT} className="cta-button connect-wallet-button">
                Mint NFT
                </button>
                <p className='mint-count'>{`${currentMintCount}/${TOTAL_MINT_COUNT} NFTs minted so far! Don't miss out!`}</p>
              <a href={OPENSEA_LINK}><button className='cta-button opensea-button'>🌊 View Collection on OpenSea</button></a>
              </>
          )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
