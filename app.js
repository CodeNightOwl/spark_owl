// 使用CommonJS规范导入模块
const { SparkWallet } = require("@buildonspark/spark-sdk");
const fs = require("fs");
// 从文件读取助记词
const FIXED_MNEMONIC = fs.readFileSync("单一词.txt", "utf8").trim();
(async () => {
  try {
    // 初始化钱包实例
    const { wallet, mnemonic } = await SparkWallet.initialize({
      mnemonicOrSeed:
        FIXED_MNEMONIC,
      options: {
        network: "MAINNET",
        derivationPath: "m/44'/0'/0'/0",
        // 添加必要的加密参数
        encryption: {
          algorithm: "aes-256-cbc",
          iv: Buffer.alloc(16).toString("hex"),
        },
      },
    });

    console.log("钱包初始化成功，助记词:", mnemonic);
    console.log("钱包地址:", wallet.getSparkAddress());
    balance = (await wallet.getBalance()).balance;
    // 将BigInt类型转换为普通Number类型再进行转换
    let balanceInBTC = Number(balance) / Math.pow(10, 8);
    console.log("钱包余额:", balanceInBTC, "BTC");
  } catch (error) {
    console.error("初始化失败:", error.message);
  }
})();
