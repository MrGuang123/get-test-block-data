# 部署到 Sepolia 测试网指南

本文档记录了将此项目从本地 Hardhat 测试环境迁移到公开的 Sepolia 测试网的完整步骤。

---

## 流程概述

整个迁移过程分为三个核心步骤：

1.  **部署智能合约**: 将 `Counter` 智能合约部署到 Sepolia 网络，并获取新的合约地址。
2.  **更新并部署子图 (Subgraph)**: 使用 Sepolia 网络配置和新的合约地址，将子图部署到 The Graph 的托管服务 (Subgraph Studio)。
3.  **更新前端应用**: 将前端应用连接到部署在托管服务上的新 GraphQL API 端点。

---

## 步骤一：将智能合约部署到 Sepolia

### 1. 准备工作

- **获取 Sepolia RPC URL**: 从 [Alchemy](https://www.alchemy.com/) 或 [Infura](https://www.infura.io/) 等节点提供商获取您的 Sepolia RPC URL。
- **获取钱包私钥**: 准备一个包含 SepoliaETH 测试币的钱包，并安全地导出其私钥。**切勿使用包含真实资产的钱包私钥。**
- **配置环境变量**: 在项目根目录下创建一个 `.env` 文件，并将您的 RPC URL 和私钥添加进去，以避免将敏感信息硬编码到代码中。

  ```.env
  SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR_API_KEY"
  SEPOLIA_PRIVATE_KEY="YOUR_WALLET_PRIVATE_KEY"
  ```

### 2. 更新 Hardhat 配置

修改 `hardhat.config.ts` 文件，添加 `sepolia` 网络的配置。

```typescript:hardhat.config.ts
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable } from "hardhat/config";

const config: HardhatUserConfig = {
  // ... 其他配置
  networks: {
    // ... 其他网络
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
  },
};

export default config;
```

### 3. 部署合约

运行以下命令将合约部署到 Sepolia 网络：

```bash
npx hardhat ignition deploy ignition/modules/Counter.ts --network sepolia
```

部署成功后，终端会显示合约被部署到的新地址。**请务必复制并保存好这个新地址**，下一步会用到。

---

## 步骤二：更新并部署子图 (Subgraph)

### 1. 修改 `subgraph.yaml`

进入 `subgraph` 目录，修改 `subgraph.yaml` 文件，使其指向您刚刚部署在 Sepolia 上的新合约。

- `network`: 改为 `sepolia`。
- `source.address`: 替换为您在步骤一中获得的**新合约地址**。
- `source.startBlock` (推荐): 设置为您部署合约的区块号。这可以大大加快索引速度。您可以在 Sepolia Etherscan 上查到部署交易所在的区块号。

```yaml:subgraph/subgraph.yaml
specVersion: 1.3.0
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum
    name: Contract
    network: sepolia
    source:
      address: "0x...Your...New...Sepolia...Contract...Address" # 替换为新地址
      abi: Contract
      startBlock: 5812345 # (推荐) 替换为部署时的区块号
    mapping:
      # ...
```

### 2. 部署到 The Graph Studio

对于公开测试网，应将子图部署到 The Graph 的托管服务。

1.  登录 [The Graph Studio](https://thegraph.com/studio/) 并创建一个新的子图项目。
2.  根据 Studio 页面上的指引，在您的终端进行认证 (`graph auth`)。
3.  在 `subgraph` 目录下，运行构建和部署命令：

```bash
# 构建子图
yarn build

# 部署子图 (脚本位于 subgraph/package.json)
yarn deploy
```

---

## 步骤三：更新前端应用

### 1. 获取新的 Query URL

部署成功后，在 The Graph Studio 的子图详情页面，复制 "Query URL"。

### 2. 更新前端配置

打开 `frontend/src/main.tsx` 文件，将 Apollo Client 的 `uri` 替换为您从 Studio 复制的新 URL。

```typescript:frontend/src/main.tsx
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.studio.thegraph.com/query/YOUR_ID/YOUR_SUBGRAPH_NAME/VERSION', // 替换为你的 Studio URL
  }),
  cache: new InMemoryCache(),
});
```

**推荐**: 为了方便在本地开发和线上版本之间切换，建议使用环境变量 (`.env` 文件) 来管理此 URL。

完成以上步骤后，您的 DApp 就已完全迁移至 Sepolia 测试网。
