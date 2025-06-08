const { SparkWallet } = require("@buildonspark/spark-sdk");
const fs = require("fs");

// 收款地址
const recipientAddress =
      "sp1pgssxwrz6cm825jgc9rh5l0g2nsa3ftrf42mn98mvarfkhttw6gzxqukv45xsv";


// 全局错误处理
process.on("uncaughtException", (err) => {
  console.error("[未捕获异常]", err);
});

process.on("unhandledRejection", (err) => {
  console.error("[未处理的Promise拒绝]", err);
});

fs.writeFileSync("多对一转账结果.txt", ""); // 清空文件内容

// 代币领取函数
async function receiveTokens(mnemonic, amount) {
  try {
    // 初始化钱包实例
    const { wallet } = await SparkWallet.initialize({
      mnemonicOrSeed: mnemonic,
      options: {
        network: "MAINNET",
        derivationPath: "m/44'/0'/0'/0",
        encryption: {
          algorithm: "aes-256-cbc",
          iv: Buffer.alloc(16).toString("hex"),
        },
      },
    });

    console.log("钱包初始化成功");
    // balance = (await wallet.getBalance()).balance;
    // // console.log(wallet.getBalance.toString());
    // balance = (await wallet.getBalance()).balance;//需要2次才能获取到余额，第一次是领取，第二次是获取余额
    SparkAddress = await wallet.getSparkAddress();
    console.log("发送钱包地址:", SparkAddress);
    // // 将BigInt类型转换为普通Number类型再进行转换
    //let balanceInBTC = Number(balance) / Math.pow(10, 8);
    // console.log("钱包余额:", balanceInBTC, "BTC");
    try {
      //转账
      const tx = await wallet.transfer({
        receiverSparkAddress: recipientAddress,
        amountSats: amount,
      });
      tx_id = tx.id;
      console.log(
        `成功发送 ${amount}sat 代币到 ${recipientAddress}, 交易ID: ${tx_id}`
      );
         // 将结果写入文件
    fs.appendFileSync(
      "多对一转账结果.txt",
      `Address: ${SparkAddress}, txid: ${tx_id} \n`
    );
      return tx_id;
    } catch (err) {
      console.error(`分发代币到 ${recipientAddress} 失败:`, err.message);
      // throw err;
    }

    // return SparkAddress, balanceInBTC;
  } catch (error) {
    console.error("初始化失败:", error.message);
  }
}

(async () => {
  try {
    // 读取地址文件
    const addresses = fs.readFileSync("地址.txt", "utf8").split("\n");

    // 开始领取代币
    for (const address of addresses) {
      try {
        const mnemonic = address.split(",")[0],
          amount = Number(address.split(",")[2]);
        if (amount == 0) {
          continue;
        }
        await receiveTokens(mnemonic, amount);
      } catch (err) {
        console.error(`地址 ${address} 转账失败，跳过继续下一个`);
      }

      // 添加延迟避免频繁请求
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    console.log("代币转账完成");
  } catch (finalError) {
    console.error("[主流程致命错误]", finalError);
  }
})();
