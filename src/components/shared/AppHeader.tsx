import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { IconButton, AppsMenu, Text } from "grindery-ui";
import useAppContext from "../../hooks/useAppContext";
import Logo from "./Logo";
import { GRINDERY_APPS, ICONS, SCREEN } from "../../constants";
import useWindowSize from "../../hooks/useWindowSize";
import { useMatch, useNavigate } from "react-router-dom";
import UserMenu from "./UserMenu";
import WorkspaceSelector from "./WorkspaceSelector";
import { useGrinderyNexus } from "use-grindery-nexus";
import Web3 from 'web3';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';

import lpTokenAbi from '../../abi/backd/lpToken.json';
import topupActionAbi from '../../abi/backd/topupAction.json';
import vaultBtcAbi from '../../abi/backd/vaultBtc.json';
import gasBankAbi from '../../abi/backd/gasBank.json';

const dataHong = require('../../abi/Hong.json');
const lpPoolAbi = require('../../abi/backd/lpPool.json');
const FujiOracle = require('../../abi/fujidao/FujiOracle.json');

const Wrapper = styled.div`
  border-bottom: 1px solid #dcdcdc;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 10px;
  position: fixed;
  background: #ffffff;
  width: 435px;
  max-width: 100vw;
  box-sizing: border-box;
  z-index: 1201;
  @media (min-width: ${SCREEN.TABLET}) {
    width: 100%;
    top: 0;
    max-width: 100%;
  }
`;

const UserWrapper = styled.div`
  margin-left: 0;
  order: 4;
  @media (min-width: ${SCREEN.TABLET}) {
    order: 4;
  }
`;

const CloseButtonWrapper = styled.div`
  & .MuiIconButton-root img {
    width: 16px !important;
    height: 16px !important;
  }

  @media (min-width: ${SCREEN.TABLET}) {
    margin-left: 0;
    margin-right: 8px;
    order: 1;
  }
`;

const LogoWrapper = styled.div`
  order: 1;
  @media (min-width: ${SCREEN.TABLET}) {
    order: 2;
  }
`;

const CompanyNameWrapper = styled.div`
  display: none;
  @media (min-width: ${SCREEN.TABLET}) {
    display: block;
    order: 3;
    font-weight: 700;
    font-size: 16px;
    line-height: 110%;
    color: #0b0d17;
    cursor: pointer;
  }
`;

const BackWrapper = styled.div`
  & img {
    width: 16px;
    height: 16px;
  }
`;

const WorkspaceSelectorWrapper = styled.div`
  order: 2;
  margin-left: 5px;
  @media (min-width: ${SCREEN.TABLET}) {
    order: 3;
    margin-left: 20px;
  }
`;

const AppsMenuWrapper = styled.div`
  margin-left: auto;
  order: 3;

  @media (max-width: ${SCREEN.TABLET}) {
    & .apps-menu__dropdown {
      min-width: 220px;
      max-width: 220px;
    }
  }

  @media (min-width: ${SCREEN.TABLET}) {
    order: 3;
  }
`;

const ConnectWrapper = styled.div`
  display: none;
  @media (min-width: ${SCREEN.TABLET}) {
    order: 4;
    display: block;

    & button {
      background: #0b0d17;
      border-radius: 5px;
      box-shadow: none;
      font-weight: 700;
      font-size: 16px;
      line-height: 150%;
      color: #ffffff;
      padding: 8px 24px;
      cursor: pointer;
      border: none;

      &:hover {
        box-shadow: 0px 4px 8px rgba(106, 71, 147, 0.1);
      }
    }
  }
`;

type Props = {};

const btcTokenAddress = '0x9C1DCacB57ADa1E9e2D3a8280B7cfC7EB936186F';
const depositContractAddress = '0xCE7cb549c42Ba8a6654AdE82f3d77D6F7d2BCD78';
const LPtoken = '0x9f2b4EEb926d8de19289E93CBF524b6522397B05';
const FujiOracleAddress = '0x707c7C644a733E71E97C54Ee0F9686468d74b9B4';


const WBTC = '0x9C1DCacB57ADa1E9e2D3a8280B7cfC7EB936186F';
const USDT = '0x02823f9B469960Bb3b1de0B3746D4b95B7E35543';

const AppHeader = (props: Props) => {
  const { connect } = useGrinderyNexus();
  const { user, setAppOpened, appOpened } = useAppContext();
  const { size, width } = useWindowSize();
  let navigate = useNavigate();
  const [amount, setAmount] = useState<Number>(0);
  const [exchangeRate, setExchangeRate] = useState<Number>(0);
  const [priceOfBtc, setPriceOfBtc] = useState<Number>(0);
  const isMatchingWorkflowNew = useMatch("/workflows/new");
  const isMatchingWorkflowEdit = useMatch("/workflows/edit/:key");
  const matchNewWorfklow = isMatchingWorkflowNew || isMatchingWorkflowEdit;
  const handleClose = () => {
    setAppOpened(!appOpened);
  };

  const handleBack = () => {
    navigate("/workflows");
  };


  useEffect(() => {
    (async () => {
      if (localStorage.getItem("isWalletConnected") === "true") {
        //check metamask are connected before
        window.web3 = new Web3(window.web3.currentProvider);
        window.ethereum.enable();
        let validAccount = await window.ethereum.request({ method: "eth_accounts" });
        if (validAccount) {
        }
      }
    })
      ()
  }, [])


  useEffect(() => {
    if (window.web3) {
      try {

        const lpTokenContract = new window.web3.eth.Contract(dataHong, LPtoken);
        const depositContract = new window.web3.eth.Contract(lpPoolAbi, depositContractAddress);
        const oracle = new window.web3.eth.Contract(FujiOracle.abi, FujiOracleAddress);
        window.ethereum.enable();
        window.ethereum.request({ method: 'eth_requestAccounts' }).then(() => {
          lpTokenContract.methods.balanceOf("0xe71fa402007FAD17dA769D1bBEfA6d0790fCe2c7").call({}, (error : any, result :any) => {
            setAmount(result);
          })
          depositContract.methods.exchangeRate().call({}, (error : any, result :any) => {
            setExchangeRate(result);
          })

          let argsPriceOfBtc = [USDT, WBTC, 2]
          oracle.methods.getPriceOf(...argsPriceOfBtc).call({}, (error: any, result : any) => {
            setPriceOfBtc(result / 100);
          });
        });

      } catch (error) {
         console.log(error);
      }
    }
  }, [window.web3])

  return (
    <Wrapper>
      {user && matchNewWorfklow && (
        <BackWrapper>
          <IconButton icon={ICONS.BACK} onClick={handleBack} color="" />

        </BackWrapper>
      )}

      {!matchNewWorfklow ? (
        <>
          <LogoWrapper>
            <Logo variant="square" />
          </LogoWrapper>
          <CompanyNameWrapper
            onClick={() => {
              navigate("/");
            }}
          >
            Loanshark
          </CompanyNameWrapper>
        </>
      ) : (
        <></>
      )}

      {/* {user && !matchNewWorfklow && (
        <WorkspaceSelectorWrapper>
          <WorkspaceSelector />
        </WorkspaceSelectorWrapper>
      )} */}
      {!matchNewWorfklow && (
        <AppsMenuWrapper>
          {/* <AppsMenu apps={GRINDERY_APPS} /> */}
        </AppsMenuWrapper>
      )}

      {!user && "ethereum" in window && (
        <ConnectWrapper>
          <button
            onClick={() => {
              connect();
            }}
          >
            Connect wallet
          </button>
        </ConnectWrapper>
      )}

      {user && (
        <ConnectWrapper>
          <Text variant="persistent" value={
            "Vault Balance: " 
            + Number(Number(Number(amount) / 100000000 * window.web3.utils.fromWei((exchangeRate).toString(), 'ether')).toFixed(2)).toLocaleString() + " BTC ($"
            + Number(Number(Number(amount) / 100000000 * window.web3.utils.fromWei((exchangeRate).toString(), 'ether') * Number(priceOfBtc) ).toFixed(2)).toLocaleString()
            + ")"
          } />
          {`     `}{`     `}{`     `}
          <button
            onClick={async () => {
              // Prompt the user for the BTC amount
              const btcAmountString = prompt('Please enter the BTC amount:');
              if (!btcAmountString) {
                return; // User cancelled
              }

              window.ethereum.enable();

              const userAccount = await window.ethereum.request({ method: 'eth_requestAccounts' });

              let approveArgs = [
                depositContractAddress,
                window.web3.utils.toBN((Number(btcAmountString) * 100000000).toFixed(0)).toString()
              ];

              let args = [
                window.web3.utils.toBN((Number(btcAmountString) * 100000000).toFixed(0)).toString(),
              ];

              window.ethereum.enable();

              const btcTokenContract = new window.web3.eth.Contract(dataHong, btcTokenAddress);
              const lpTokenContract = new window.web3.eth.Contract(dataHong, LPtoken);
              const depositContract = new window.web3.eth.Contract(lpPoolAbi, depositContractAddress);

              await btcTokenContract.methods.totalSupply().call({}, (error: any, result: any) => {
                console.log(result);
              });

              await btcTokenContract.methods.approve(...approveArgs).send({ from: userAccount[0] })
                .on("error", (error: any, receipt: any) => {
                  console.error(error);
                }).then(async (receipt: any) => {

                  console.log(receipt);

                  await depositContract.methods.deposit(...args).send({ from: userAccount[0] })
                    .on("error", (error: any, receipt: any) => {
                      console.error(error);
                    }).then(async (receipt: any) => {
                      lpTokenContract.methods.balanceOf("0xe71fa402007FAD17dA769D1bBEfA6d0790fCe2c7").call({}, (error : any, result :any) => {
                        setAmount(result);
                      })
                    });

                });
            }}
          >
            Deposit BTC Smart Vault
          </button>
        </ConnectWrapper>
      )}

      {user && (
        <UserWrapper style={{ marginLeft: matchNewWorfklow ? "auto" : 0 }}>
          <UserMenu />
        </UserWrapper>
      )}

      {user &&
        (!matchNewWorfklow || size === "phone") &&
        ((width >= parseInt(SCREEN.TABLET.replace("px", "")) &&
          width < parseInt(SCREEN.TABLET_XL.replace("px", ""))) ||
          width >= parseInt(SCREEN.DESKTOP.replace("px", ""))) && (
          <CloseButtonWrapper style={{ marginLeft: !user ? "auto" : "0px" }}>
            {size === "desktop" && !appOpened ? (
              <IconButton icon={ICONS.MENU} onClick={handleClose} color="" />
            ) : size === "desktop" ? (
              <IconButton
                icon={ICONS.COLLAPSE}
                onClick={handleClose}
                color=""
              />
            ) : (
              <IconButton icon={ICONS.CLOSE} onClick={handleClose} color="" />
            )}
          </CloseButtonWrapper>
        )}
    </Wrapper>
  );
};

export default AppHeader;
