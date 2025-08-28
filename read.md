# Get Test Block Data - 全栈 Web3 项目

本项目是一个完整的 DApp (去中心化应用) 示例，旨在演示如何使用 Hardhat, The Graph, 和 Vite+React 技术栈，从区块链（无论是本地测试网还是公共测试网如 Sepolia）读取数据并在前端进行展示。

## 核心技术栈

- **智能合约 (后端): `Hardhat`**
  - **作用**: 用于编写、编译、测试和部署我们的 `Counter.sol` 智能合约。它是链上数据的来源。
  - **业务逻辑**: `Counter.sol` 合约允许任何用户增加一个计数器的值。每当值增加时，它会触发一个 `Increment` 事件，并将增加的数值作为参数广播出去。

- **数据索引 (中间层): `The Graph`**
  - **作用**: 作为一个高效的数据索引层。直接从链上查询历史事件非常缓慢。The Graph 通过运行一个“子图 (subgraph)”来监听我们合约的 `Increment` 事件，将事件数据抓取并存储在优化的数据库中，然后通过一个标准的 GraphQL API 将数据暴露出来。
  - **交互**: 子图通过合约地址和 ABI 知道要监听哪个合约的哪个事件。当事件发生时，子图的 `mapping` 逻辑（AssemblyScript代码）会被触发，将事件数据转换为我们定义的 `Schema` (数据模型) 并保存。

- **前端应用 (前端): `Vite + React`**
  - **作用**: 构建用户界面，让用户可以直观地看到链上发生的数据变化。
  - **交互**: 前端应用使用 Apollo Client 库来向 The Graph 子图的 GraphQL API 发送查询请求，获取所有 `Increment` 事件的历史记录，然后将这些数据显示在一个表格中。

## 开发工作流程 (本地联调)

这是我们进行本地开发和测试的完整流程：

1.  **启动本地链**: 在一个终端中运行 `yarn hardhat node`。这会启动一个本地的、内存中的以太坊节点，模拟真实的区块链环境。

2.  **部署合约**: 在另一个终端中，运行 `yarn hardhat ignition deploy ignition/modules/Counter.ts --network localhost`。此命令会将 `Counter.sol` 合约部署到我们刚刚启动的本地节点上。**记下输出的合约地址**。

3.  **配置并部署子图**:
    a.  打开 `subgraph/subgraph.yaml` 文件。
    b.  将 `dataSources.source.address` 的值更新为上一步中获得的**本地合约地址**。
    c.  (此步骤需要 Docker) 启动一个本地的 graph-node 实例。
    d. 确保subgraph.yml中的network名称与docker-compose.yml中graph-node的环境变量的ethereum定义的网络名称一致，比如现在都叫mainnet
    d.  进入subgraph目录，运行 `yarn create-local`, `yarn deploy-local` 等命令将子图部署到本地节点。
    e. 在 subgraph 目录下成功运行 yarn deploy-local (或 npm run deploy-local) 时，终端的输出信息里会明确告诉您 GraphQL API 的地址，类似Queries (HTTP):     http://localhost:8000/subgraphs/name/get-test-block-data。
    这个地址的结构是：http://<graph-node-ip>:<http-port>/subgraphs/name/<subgraph-name>。根据

4.  **启动前端应用**:
    a.  确保 `frontend/src/` 中的 Apollo Client 配置指向本地 graph-node 的 API 端点 (通常是 `http://127.0.0.1:8000/subgraphs/name/...`)。
    b.  在 `frontend` 目录下运行 `yarn dev`。

5.  **交互与验证**:
    a.  使用 Hardhat script 或 Ethers.js 与本地部署的合约进行交互（例如调用 `inc()` 函数）。
    b.  观察前端界面，新的 `Increment` 事件数据应该会实时或刷新后出现。

## 切换到线上测试网 (Sepolia)

当本地开发完成后，切换到 Sepolia 的流程如下：

1.  **准备钱包和测试币**: 确保你的钱包中有足够的 Sepolia ETH。
2.  **配置环境变量**: 在项目根目录创建 `.env` 文件，并填入你的 `SEPOLIA_RPC_URL` 和 `SEPOLIA_PRIVATE_KEY`。
3.  **部署合约**: 运行 `yarn hardhat ignition deploy ignition/modules/Counter.ts --network sepolia`。**记下输出的合约地址**。
4.  **更新并部署子图**:
    a.  打开 `subgraph/subgraph.yaml`，将合约地址更新为 Sepolia 上的地址。
    b.  将 `network` 从 `mainnet` 改回 `sepolia`。
    c.  将子图部署到 The Graph 的托管服务。
5.  **更新前端**: 修改前端 Apollo Client 的 API 地址，指向你在 The Graph 托管服务上的子图 API 端点。
