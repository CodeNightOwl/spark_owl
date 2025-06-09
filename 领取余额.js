const { SparkWallet } = require("@buildonspark/spark-sdk");
const fs = require("fs");

// 全局错误处理
process.on("uncaughtException", (err) => {
  console.error("[未捕获异常]", err);
});

process.on("unhandledRejection", (err) => {
  console.error("[未处理的Promise拒绝]", err);
});

fs.writeFileSync("领取结果.txt", "");  // 清空文件内容

// 代币领取函数
async function receiveTokens(mnemonic) {
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
    balance = (await wallet.getBalance()).balance;
    // console.log(wallet.getBalance.toString());
    await new Promise((resolve) => setTimeout(resolve, 5000));
    balance = (await wallet.getBalance()).balance;//需要2次才能获取到余额，第一次是领取，第二次是获取余额
    SparkAddress=(await wallet.getSparkAddress());
    console.log("钱包地址:", SparkAddress);
    // 将BigInt类型转换为普通Number类型再进行转换
    let balanceInBTC = Number(balance) / Math.pow(10, 8);
    console.log("钱包余额:", balanceInBTC, "BTC");

    // 将结果写入文件
    fs.appendFileSync("领取结果.txt", `Address: ${SparkAddress}, Balance: ${balanceInBTC} BTC\n`);

    return  SparkAddress,balanceInBTC;
  } catch (error) {
    console.error("初始化失败:", error.message);
  }
}

(async () => {
  try {
    // 读取地址文件
    const addresses = fs.readFileSync("地址.txt", "utf8").split("\n");
    const mnemonics = addresses.map((line) => line.split(",")[0]);

    // 开始领取代币
    for (const mnemonic of mnemonics) {
      try {
        await receiveTokens(mnemonic);
      } catch (err) {
        console.error(`地址 ${address} 领取失败，跳过继续下一个`);
      }

      // 添加延迟避免频繁请求
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    console.log("代币领取完成");
  } catch (finalError) {
    console.error("[主流程致命错误]", finalError);
  }
})();