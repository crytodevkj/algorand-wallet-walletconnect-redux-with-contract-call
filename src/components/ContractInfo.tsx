import AssetRow from "./AssetRow";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { IAssetData } from "../helpers/types";
import { callWithArgs } from "../helpers/api";
import myReadGlobalState from "../helpers/contract";
import { reset, setConnected, onConnect, onSessionUpdate, killSession, selectConnector, selectAssets, selectAddress, getAccountAssets, selectChain, selectConnected, walletConnectInit, switchChain, setFetching, selectFetching } from '../features/walletConnectSlice';

const ContractInfo = () => {

  const [contract_info, setContractInfo] = useState(new Array())
  const [res, setRes] = useState("")

  const address = useSelector(selectAddress);
  const chain = useSelector(selectChain);

  useEffect(() => {
    (async () => {
      setContractInfo(await myReadGlobalState());
      setRes(await callWithArgs());
    })();
  }, [address, chain]);

  return (
    <div>
      <h2>Contract Info</h2>
      <p>Call Response:{res}</p>
      {contract_info.map(info => (
        <AssetRow key={info.id} asset={info} />
      ))}
    </div>
  );
};

export default ContractInfo;
