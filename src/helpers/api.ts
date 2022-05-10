import algosdk from "algosdk";
import { IAssetData } from "./types";
import { } from './contract'
export enum ChainType {
  MainNet = "mainnet",
  TestNet = "testnet",
}

// user declared account mnemonics
export const creator_mnemonic = "smile display crunch hub warrior fault acquire live sudden dove brain high bundle firm sugar system tape refuse regret priority cotton allow sugar abstract enjoy";
export const user_mnemonic = "cabin coil young eyebrow furnace mimic team patient city reward start debris law setup young still crazy apology chest cushion two tiger virtual absorb crater";

// get account from mnemonic
export let creatorAccount = algosdk.mnemonicToSecretKey(creator_mnemonic); //J3DCCJUMCA2XISLMW4PVBNUBWXWLUW7CCGSRHWH6U4FCOGUICBHUTTWLL4
export let sender = creatorAccount.addr;

const mainNetClient = new algosdk.Algodv2("", "https://algoexplorerapi.io", "");
const testNetClient = new algosdk.Algodv2("", "https://testnet.algoexplorerapi.io", "");

function clientForChain(chain: ChainType): algosdk.Algodv2 {
  switch (chain) {
    case ChainType.MainNet:
      return mainNetClient;
    case ChainType.TestNet:
      return testNetClient;
    default:
      throw new Error(`Unknown chain type: ${chain}`);
  }
}

export async function apiGetAccountAssets(
  chain: ChainType,
  address: string,
): Promise<IAssetData[]> {
  const client = clientForChain(chain);

  const accountInfo = await client
    .accountInformation(address)
    .setIntDecoding(algosdk.IntDecoding.BIGINT)
    .do();

  const algoBalance = accountInfo.amount as bigint;
  const assetsFromRes: Array<{
    "asset-id": bigint;
    amount: bigint;
    creator: string;
    frozen: boolean;
  }> = accountInfo.assets;

  const assets: IAssetData[] = assetsFromRes.map(({ "asset-id": id, amount, creator, frozen }) => ({
    id: Number(id),
    amount,
    creator,
    frozen,
    decimals: 0,
  }));

  assets.sort((a, b) => a.id - b.id);

  await Promise.all(
    assets.map(async asset => {
      const { params } = await client.getAssetByID(asset.id).do();
      asset.name = params.name;
      asset.unitName = params["unit-name"];
      asset.url = params.url;
      asset.decimals = params.decimals;
    }),
  );

  assets.unshift({
    id: 0,
    amount: algoBalance,
    creator: "",
    frozen: false,
    decimals: 6,
    name: "Algo",
    unitName: "Algo",
  });

  return assets;
}

export async function apiGetTxnParams(chain: ChainType): Promise<algosdk.SuggestedParams> {
  const params = await clientForChain(chain)
    .getTransactionParams()
    .do();
  return params;
}

export async function apiSubmitTransactions(
  chain: ChainType,
  stxns: Uint8Array[],
): Promise<number> {
  const { txId } = await clientForChain(chain)
    .sendRawTransaction(stxns)
    .do();
  return await waitForTransaction(chain, txId);
}

async function waitForTransaction(chain: ChainType, txId: string): Promise<number> {
  const client = clientForChain(chain);

  let lastStatus = await client.status().do();
  let lastRound = lastStatus["last-round"];
  while (true) {
    const status = await client.pendingTransactionInformation(txId).do();
    if (status["pool-error"]) {
      throw new Error(`Transaction Pool Error: ${status["pool-error"]}`);
    }
    if (status["confirmed-round"]) {
      return status["confirmed-round"];
    }
    lastStatus = await client.statusAfterBlock(lastRound + 1).do();
    lastRound = lastStatus["last-round"];
  }
}



export async function callWithArgs() {

  let client = clientForChain(ChainType.MainNet);
  // get node suggested parameters
  let params = await client.getTransactionParams().do();
  // comment out the next two lines to use suggested fee
  params.fee = 1000;
  params.flatFee = true;

  // create unsigned transaction
  let txn = algosdk.makeApplicationNoOpTxn(sender, params, 0)

  // Sign the transaction
  let signedTxn = txn.signTxn(creatorAccount.sk);
  // let txId = signedTxn.transaction.get_txid()
  // Submit the transaction
  let confirmedTxnRound = await apiSubmitTransactions(ChainType.MainNet, [signedTxn]);

  //Get the completed Transaction
  let log = "Transaction " + txn.txID() + " confirmed in round " + confirmedTxnRound;
  console.log(log);
  // display results
  // let transactionResponse = await client.pendingTransactionInformation(txn.txID()).do();
  return log;
}
