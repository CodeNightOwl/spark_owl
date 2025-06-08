const { SparkWallet } = require("@buildonspark/spark-sdk");
const fs = require("fs");

//生成钱包的数量
const wallet_count = 3;

// 全局错误处理
process.on("uncaughtException", (err) => {
  console.error("[未捕获异常]", err);
});

process.on("unhandledRejection", (err) => {
  console.error("[未处理的Promise拒绝]", err);
});

(async () => {
  try {
    const results = [];
    let successCount = 0;
    let index = 0;
    let baseDelay = 3000;
    let maxDelay = 300000;

    while (successCount < wallet_count) {
      let outerRetry = 0;
      let addressGenerated = false;

      // 外层重试机制
      while (!addressGenerated && outerRetry < 5) {
        try {
          // 助记词生成
          const { wallet, mnemonic } = await SparkWallet.initialize({
            mnemonicOrSeed: null,
            options: {
              network: "MAINNET",
              derivationPath: `m/44'/0'/${index}'/0`,
              encryption: {
                algorithm: "aes-256-cbc",
                iv: Buffer.alloc(16).toString("hex"),
              },
            },
          }).catch((err) => {
            console.error("[钱包初始化错误]", err);
            throw err; // 重新抛出以便外层捕获
          });

          // RPC调用部分
          let address;
          let rpcRetry = 0;
          while (rpcRetry < 10) {
            try {
              address = await wallet.getSparkAddress().catch((err) => {
                console.error("[地址获取错误]", err);
                throw err;
              });
              break;
            } catch (rpcError) {
              console.error(
                `第${index}组地址获取失败 (重试次数: ${rpcRetry}/10):`,
                rpcError.message
              );
              rpcRetry++;
              await new Promise((resolve) =>
                setTimeout(
                  resolve,
                  Math.min(baseDelay * Math.pow(1.5, rpcRetry), maxDelay)
                )
              );
            }
          }

          if (!address) {
            console.error(
              `[致命错误] 第${index}组地址获取连续失败10次，跳过该组`
            );
            index++;
            outerRetry++;
            continue;
          }

          addressGenerated = true;
          results.push(`${mnemonic},${address}`);
          console.log(
            `成功生成第${successCount + 1}组: ${mnemonic},${address}`
          );
          successCount++;
          index++;
        } catch (outerError) {
          outerRetry++;
          console.error(
            `[全局错误] 第${index}组生成失败 (外层重试: ${outerRetry}/5):`,
            outerError.message
          );
          await new Promise((resolve) =>
            setTimeout(resolve, Math.min(5000 * outerRetry, maxDelay))
          );

          // 如果是认证错误，重置index并继续尝试
          if (outerError.message.includes("Authentication failed")) {
            console.log("检测到认证错误，重置计数器继续尝试...");
            continue;
          }
        }
      }

      if (!addressGenerated) {
        console.error(`连续5次外层重试失败，跳过第${index}组`);
        index++;
      }
    }

    fs.writeFileSync("地址.txt", results.join("\n"));
    console.log(`成功生成${wallet_count}组有效钱包，已保存到地址.txt`);
  } catch (finalError) {
    console.error("[主流程致命错误]", finalError);
    // 保存已生成的数据
    if (results.length > 0) {
      fs.writeFileSync("地址_部分.txt", results.join("\n"));
      console.log(`已保存部分数据(${results.length}组)到地址_部分.txt`);
    }
  }
})();
