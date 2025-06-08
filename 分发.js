const { SparkWallet } = require("@buildonspark/spark-sdk");
const fs = require("fs");

// 全局错误处理
process.on("uncaughtException", (err) => {
  console.error("[未捕获异常]", err);
});

process.on("unhandledRejection", (err) => {
  console.error("[未处理的Promise拒绝]", err);
});

// 从文件读取助记词
const FIXED_MNEMONIC = fs.readFileSync("单一词.txt", "utf8").trim();
// console.log("已读取助记词:", FIXED_MNEMONIC);

// 代币分发函数
async function distributeTokens(wallet, recipientAddress, amount) {
  console.log(
    `--------开始分发 ${amount}sat   代币到 ${recipientAddress}--------`
  );
  try {
    const tx = await wallet.transfer({
      receiverSparkAddress: recipientAddress,
      amountSats: amount,
    });
    tx_id = tx.id;
    console.log(
      `成功发送 ${amount}sat 代币到 ${recipientAddress}, 交易ID: ${tx_id}`
    );
    return tx_id;
  } catch (err) {
    console.error(`分发代币到 ${recipientAddress} 失败:`, err.message);
    console.log('转账接口挂了，就等待30秒后重试...');
    await new Promise((resolve) => setTimeout(resolve, 30000));
    throw err;
  }
}

(async () => {
  try {
    // 初始化固定助记词钱包
    const { wallet } = await SparkWallet.initialize({
      mnemonicOrSeed: FIXED_MNEMONIC,
      options: {
        network: "MAINNET",
        derivationPath: "m/44'/0'/0'/0",
        encryption: {
          algorithm: "aes-256-cbc",
          iv: Buffer.alloc(16).toString("hex"),
        },
      },
    });

    console.log("钱包初始化成功，地址:", await wallet.getSparkAddress());

    // 读取地址文件
    const addresses = fs.readFileSync("地址.txt", "utf8").split("\n");
    // const recipientAddresses = addresses.map((line) => line.split(",")[1]);

    // 检查余额
    const balance = (await wallet.getBalance()).balance;
    // 将BigInt类型转换为普通Number类型再进行转换
    let balanceInBTC = Number(balance) / Math.pow(10, 8);
    console.log("当前钱包余额:", balanceInBTC, "BTC");
    // // 设置每个地址分发数量
    // const amountPerAddress = 31600; // 单位: satoshi

    // 开始分发
    for (const item of addresses) {
      const address = item.split(",")[1];
      const amountPerAddress = Number(item.split(",")[2]);
      if (address == "" || amountPerAddress == 0) {
        console.log("跳过空地址或数量为0的地址");
        continue;
      }
      try {
        console.log(`开始分发到地址 ${address}`, amountPerAddress);
        // break;
        await distributeTokens(wallet, address, amountPerAddress);
      } catch (err) {
        console.error(`地址 ${address} 分发失败，跳过继续下一个`);
      }

      // 添加延迟避免频繁请求
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    console.log("代币分发完成");
  } catch (finalError) {
    console.error("[主流程致命错误]", finalError);
  }
})();
