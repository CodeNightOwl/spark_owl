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

      // 获取您的L1地址用于充值
    const l1Address =await wallet.getSingleUseDepositAddress();
    console.log("获取从btc主链上收钱的地址，地址:", l1Address);
    // console.log("列出没有使用的bc1p地址，地址:", await wallet.getUnusedDepositAddresses());

  } catch (finalError) {
    console.error("[主流程致命错误]", finalError);
  }
})();
