// App.js
import "./styles/App.css";

// フロントエンドとコントラクトを連携するライブラリをインポートします。
import { ethers } from "ethers";
// useEffect と useState 関数を React.js からインポートしています。
import React, { useEffect, useState } from "react";

import twitterLogo from "./assets/twitter-logo.svg";
import LabEventSBT from "./utils/ETHGlobalTokyoSBT.json";

const TWITTER_HANDLE = "YasuYasu_onFire";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "";
const TOTAL_MINT_COUNT = 50;

// コトントラクトアドレスをCONTRACT_ADDRESS変数に格納
// const CONTRACT_ADDRESS = "0xe1b9Cf8fdBBba1e12e8A75FE43fDFdA49ed799AD"; //for aki test
const CONTRACT_ADDRESS = "0x52B5B9a6AEB482c17Bb83b094A7c01E61275B1B2"; //for main
const App = () => {
  // ユーザーのウォレットアドレスを格納するために使用する状態変数を定義します。
  const [currentAccount, setCurrentAccount] = useState("");
  //送信先のアドレス
  const [addresses, setAddresses] = useState("");
  //管理者を追加/削除、チェックするときに格納するアドレス
  const [adminAddress, setAdminAddress] = useState("");
  //管理者をチェックするときに格納するアドレス（画面表示用）
  const [checkAddress, setCheckAddress] = useState("");
  //管理者のチェック結果を格納する
  const [checkResult, setCheckResult] = useState(false);
  //mintするSBTのIDを格納する
  const [mintID, setMintID] = useState("");

  // setupEventListener 関数を定義します。
  // MeetingSBT.sol の中で event が　emit された時に、
  // 情報を受け取ります。
  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          LabEventSBT.abi,
          signer
        );

        // Event が　emit される際に、コントラクトから送信される情報を受け取っています。
        // connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
        //   console.log(from, tokenId.toNumber());
        //   alert(
        //     `あなたのウォレットに NFT を送信しました。OpenSea に表示されるまで最大で10分かかることがあります。NFT へのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
        //   );
        // });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ユーザーが認証可能なウォレットアドレスを持っているか確認します。
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    // ユーザーが認証可能なウォレットアドレスを持っている場合は、ユーザーに対してウォレットへのアクセス許可を求める。許可されれば、ユーザーの最初のウォレットアドレスを accounts に格納する。
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);

      // イベントリスナーを設定
      // この時点で、ユーザーはウォレット接続が済んでいます。
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  };

  // connectWallet メソッドを実装します。
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      // ウォレットアドレスに対してアクセスをリクエストしています。
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);

      // ウォレットアドレスを currentAccount に紐付けます。
      setCurrentAccount(accounts[0]);

      // イベントリスナーを設定
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  // NFT を Mint する関数を定義しています。
  const askContractToMintNft = async (event) => {
    event.preventDefault()
    //console.log(addresses);
    const addresses_array = addresses.split(/\n/);
    console.log(addresses_array);
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          LabEventSBT.abi,
          signer
        );

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.airDrop(addresses_array, mintID);

        console.log("Mining...please wait.");
        await nftTxn.wait();
        console.log(nftTxn);
        //console.log(
        //  `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        //);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

//管理者を追加する(4種類のロール)
const AddAdmin = async(event) => {
  event.preventDefault();
  try {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        LabEventSBT.abi,
        signer
      );
      console.log(adminAddress);
      let DefaultRole = await connectedContract.DEFAULT_ADMIN_ROLE();
      let nftTxn = await connectedContract.grantRole(DefaultRole, adminAddress);
      await nftTxn.wait();

      let SetterRole = await connectedContract.URI_SETTER_ROLE();
      nftTxn = await connectedContract.grantRole(SetterRole, adminAddress);
      await nftTxn.wait();

      let PauserRole = await connectedContract.PAUSER_ROLE();
      nftTxn = await connectedContract.grantRole(PauserRole, adminAddress);
      await nftTxn.wait();

      let MinterRole = await connectedContract.MINTER_ROLE();
      nftTxn = await connectedContract.grantRole(MinterRole, adminAddress);
      await nftTxn.wait();


    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error);
  }

};

//管理者を削除する
const DelAdmin = async(event) => {
  event.preventDefault();
  try {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        LabEventSBT.abi,
        signer
      );
      console.log(adminAddress);
      
      let DefaultRole = await connectedContract.DEFAULT_ADMIN_ROLE();
      let nftTxn = await connectedContract.revokeRole(DefaultRole, adminAddress);
      await nftTxn.wait();

      let SetterRole = await connectedContract.URI_SETTER_ROLE();
      nftTxn = await connectedContract.revokeRole(SetterRole, adminAddress);
      await nftTxn.wait();

      let PauserRole = await connectedContract.PAUSER_ROLE();
      nftTxn = await connectedContract.revokeRole(PauserRole, adminAddress);
      await nftTxn.wait();

      let MinterRole = await connectedContract.MINTER_ROLE();
      nftTxn = await connectedContract.revokeRole(MinterRole, adminAddress);
      await nftTxn.wait();

    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error);
  }

};

  //フォームに入力したアドレスが管理者かどうかを返す
  const checkAdmin = async(event) => {
    event.preventDefault();
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        //const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          LabEventSBT.abi,
          provider
        );
        console.log(adminAddress);
        //console.log("Going to pop wallet now to pay gas...");
        let DefaultRole = await connectedContract.DEFAULT_ADMIN_ROLE();
        let nftTxn = await connectedContract.hasRole(DefaultRole, adminAddress);

        //console.log("Mining...please wait.");
        //await nftTxn.wait();
        console.log(nftTxn);
        //console.log(
        //  `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        //);
        setCheckResult(nftTxn);
        setCheckAddress(adminAddress);//結果表示のためアドレスを格納
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }

  };

  // ページがロードされた際に下記が実行されます。
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  // renderNotConnectedContainer メソッド（ Connect to Wallet を表示する関数）を定義します。
  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  // 配布先アドレスの貼り付け欄、 AirDropボタンをレンダリングするメソッドを定義します。
  const renderMintUI = () => (
    <>
    <p className="normal-text">Please enter the ID of the SBT to distribute (0, 1, 2, ...)</p>
    <input type="text" name="mintID" id="mintID" size="10" onChange={(e) => setMintID(e.target.value)}></input><br></br><br></br>
    <p className="normal-text">Enter the wallet address of the desired recipient</p><p className="normal-text">Copying and pasting from a spreadsheet is OK</p>
    <form method="post">
      <textarea name="dist_address" id="dist_address" cols="42" rows="10" onChange={(e) => setAddresses(e.target.value)} placeholder="0xabc...&#13;0xdef..."></textarea><br></br><br></br>
      <button
        onClick={askContractToMintNft}
        className="cta-button connect-wallet-button"
        type='submit'
      >
        AirDrop!!
      </button>
    </form>
    <br></br><br></br><br></br><br></br>

    <p className="normal-text">input address you want to add as ADMIN</p>
    <form method="post">
      <input type="text" name="add_admin" id="add_admin" size="42" onChange={(e) => setAdminAddress(e.target.value)}></input><br></br><br></br>
      <button
        onClick={AddAdmin}
        className="cta-button connect-wallet-button"
        type='submit'
      >
        追加
      </button>
    </form>
    <br></br><br></br>

    <p className="normal-text">input address you want to delete from ADMIN</p>
    <form method="post">
      <input type="text" name="del_admin" id="del_admin" size="42" onChange={(e) => setAdminAddress(e.target.value)}></input><br></br><br></br>
      <button
        onClick={DelAdmin}
        className="cta-button connect-wallet-button"
        type='submit'
      >
        削除
      </button>
    </form>
    <br></br><br></br>
    <br></br><br></br>

    <p className="normal-text">Check whether the address is ADMIN or NOT</p>
    <p className="normal-text">true:ADMIN false:NOT</p>
    <form method="post">
      <input type="text" name="check_admin" id="check_admin" size="42" onChange={(e) => setAdminAddress(e.target.value)}></input><br></br><br></br>
      <button
        onClick={checkAdmin}
        className="cta-button connect-wallet-button"
        type='submit'
      >
        Check
      </button>
    </form>
    <p className="normal-text"> Address　{checkAddress ? checkAddress : "〇〇"}　's result is </p>
    <p className="normal-text"> {checkResult ? "true" : "false"}</p>
    </>

  );

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">SBT AirDrop Manager</p>
          <p className="sub-text">【For ADMIN】AirDrop SBT💫</p>
          {/*条件付きレンダリング。
          // すでにウォレット接続されている場合は、
          // Mint NFT を表示する。*/}
          {currentAccount === ""
            ? renderNotConnectedContainer()
            : renderMintUI()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;