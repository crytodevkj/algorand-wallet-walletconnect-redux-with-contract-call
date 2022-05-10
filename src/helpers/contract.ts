import algosdk from "algosdk";

// user declared account mnemonics
export const creator_mnemonic = "smile display crunch hub warrior fault acquire live sudden dove brain high bundle firm sugar system tape refuse regret priority cotton allow sugar abstract enjoy";
export const user_mnemonic = "cabin coil young eyebrow furnace mimic team patient city reward start debris law setup young still crazy apology chest cushion two tiger virtual absorb crater";

// user declared algod connection parameters
export const algodAddress = "https://academy-algod.dev.aws.algodev.network/";
export const algodPort = "";
export const algodToken = "2f3203f21e738a1de6110eba6984f9d03e5a95d7a577b34616854064cf2c0e7b";
export let algodClient = new algosdk.Algodv2(algodToken, algodAddress, algodPort);

// declare application state storage (immutable)
export const localInts = 1;
export const localBytes = 1;
export const globalInts = 1;
export const gobalBytes = 0;


// declare clear state program source
export const clearProgramSource = `#pragma version 4
int 1
`;

// get account from mnemonic
export let creatorAccount = algosdk.mnemonicToSecretKey(creator_mnemonic); //J3DCCJUMCA2XISLMW4PVBNUBWXWLUW7CCGSRHWH6U4FCOGUICBHUTTWLL4
export let sender = creatorAccount.addr;

// // get node suggested parameters
// let params = algodClient.getTransactionParams().do();
// // comment out the next two lines to use suggested fee
// params.fee = 1000;
// params.flatFee = true;

// read local state of application from user account
export async function readLocalState(client: algosdk.Algodv2, account: algosdk.Account, index: Number) {
  let accountInfoResponse = await client.accountInformation(account.addr).do();
  for (let i = 0; i < accountInfoResponse['apps-local-state'].length; i++) {
    if (accountInfoResponse['apps-local-state'][i].id == index) {
      console.log("User's local state:");
      for (let n = 0; n < accountInfoResponse['apps-local-state'][i][`key-value`].length; n++) {
        console.log(accountInfoResponse['apps-local-state'][i][`key-value`][n]);
      }
    }
  }
}

// read global state of application
export async function readGlobalState(client: algosdk.Algodv2, index: number) {
  let applicationInfoResponse = await client.getApplicationByID(index).do();
  let globalState = []
  if (applicationInfoResponse['params'].includes('global-state')) {
    globalState = applicationInfoResponse['params']['global-state']
  }
  for (let n = 0; n < globalState.length; n++) {
    console.log(applicationInfoResponse['params']['global-state'][n]);
  }
}

export default async function myReadGlobalState() {
  let applicationInfoResponse = await algodClient.getApplicationByID(0).do();
  let globalState = []
  if (applicationInfoResponse['params'].includes('global-state')) {
    globalState = applicationInfoResponse['params']['global-state']
  }
  for (let n = 0; n < globalState.length; n++) {
    console.log(applicationInfoResponse['params']['global-state'][n]);
  }
  return globalState;
}