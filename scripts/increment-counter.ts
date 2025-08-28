import hre from "hardhat";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hardhat } from "viem/chains";
import CounterArtifact from "../artifacts/contracts/Counter.sol/Counter.json";

async function main() {
  // 1. 直接使用本地节点的 URL，避免从 Hardhat 配置对象中读取
  const networkUrl = "http://127.0.0.1:8545";

  // 2. 手动创建一个 Public Client
  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http(networkUrl),
  });

  // 3. Hardhat 节点默认的第一个账户的私钥
  // WARNING: This is a default, well-known private key. DO NOT USE FOR MAINNET.
  const privateKey =
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const account = privateKeyToAccount(privateKey);

  // 4. 手动创建一个 Wallet Client
  const walletClient = createWalletClient({
    account,
    chain: hardhat,
    transport: http(networkUrl),
  });

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  console.log(`Interacting with Counter contract at: ${contractAddress}`);

  // 5. 发送交易
  console.log("Sending increment transaction...");
  const tx = await walletClient.writeContract({
    address: contractAddress,
    abi: CounterArtifact.abi,
    functionName: "inc",
    args: [],
  });

  console.log(`Transaction sent! Hash: ${tx}`);
  console.log("Waiting for transaction to be mined...");

  // 6. 等待交易确认
  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });

  if (receipt.status === "success") {
    console.log("Transaction mined successfully!");
    console.log(`Block Number: ${receipt.blockNumber}`);
    console.log(
      "A new 'Increment' event has been emitted."
    );
  } else {
    console.error("Transaction failed!");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
