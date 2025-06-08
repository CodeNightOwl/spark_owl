# Spark Owl 代币分发工具

## 项目简介
Spark Owl 是一个基于 Spark SDK 的代币分发工具，用于批量向多个地址发送SPARK代币。
接收方也需要助记词getbalance才能领取

## 主要功能
- 批量创建spark钱包助记词及地址
- 批量分发代币到多个地址
- 批量领取代币

## 基础环境
1. 确保已安装 Node.js (建议版本 16+) 和 npm
2. 安装yarn 4.5.0
3. 安装git
```bash
npm install -g yarn
```

## 安装及使用
1. 安装依赖并运行
```bash
yarn add @buildonspark/spark-sdk
git clone https://github.com/CodeNightOwl/spark_owl
yarn install
```
或者npm
```bash
npm i @buildonspark/spark-sdk
git clone https://github.com/CodeNightOwl/spark_owl
npm install
```
2. 运行创建助记词及地址.js   执行后会生成 `地址.txt` 生成多少组第五行代码`wallet_count`控制
3. 准备 `单一词.txt` 文件，包含钱包助记词 (就一行助记词,这个钱包用来分发代币,可以用第一步生成的助记词)
4. 准备接收分发的 `地址.txt` 文件，每行格式为 `序号,地址,金额`  金额是sat， (运行创建助记词及地址.js生成的后面加金额即可)


5. 如有其它参考项目官方文档
https://docs.spark.money/wallet/cn/documentation/api-reference

## 注意事项
- 确保钱包有足够余额(从btc链上或交易所转钱到spark链上)
- 网络请求有3秒间隔避免频繁调用
- 错误会自动记录并跳过继续执行
- transfer转账后，需要接收方用getbalance领取，否则一直是pending状态

## 文件说明
- `app.js` - 钱包功能测试脚本
- `创建助记词及地址.js` - 生成助记词和地址的工具
- `根据助记词获取L1地址.js` - 根据助记词获取L1地址,就是主链打款地址，bc1p........
- `分发.js` - 主分发脚本(把这个钱包的钱分发给其他钱包，sp1p........)
- `领取余额.js` - 领取transfer余额
- `多对一转.js` - 批量转账(把一个钱包的钱分发给多个钱包,注意第五行是收款地址，自行修改)



## 比如打aurora这个项目的流程 (https://x.com/Aurorai_spark)
1. 创建助记词及地址.js  创建一组钱包，比如用第一个钱包用来做分发。
   用第一个钱包生成L1地址，从主链充值btc。
2. 用分发.js    把第一个钱包的钱分发给其他钱包。
3. 领取余额.js  所有钱包领取分发的来的btc
4. 多对一转.js  把其他钱包的btc打给项目地址
5. 到spark浏览器查看项目方的地址是否确认收到你的打款.  https://www.sparkscan.io/?network=mainnet