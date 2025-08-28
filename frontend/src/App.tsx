import { gql } from "@apollo/client";
import { useQuery } from '@apollo/client/react';
import './App.css';

// 1. 定义 GraphQL 查询
const GET_INCREMENTS = gql`
  query GetIncrements {
    increments(orderBy: blockTimestamp, orderDirection: desc) {
      id
      by
      transactionHash
      blockTimestamp
    }
  }
`;

interface Increment {
  id: string;
  by: string;
  transactionHash: string;
  blockTimestamp: string;
}

function App() {
  // 2. 使用 useQuery hook 执行查询
  const { loading, error, data } = useQuery<{ increments: Increment[] }>(GET_INCREMENTS);

  const formatTimestamp = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString();
  };

  const truncateHash = (hash: string) => {
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  }

  return (
    <>
      <h1>Counter Increments</h1>
      <p>
        This table displays historical data of the <code>Increment</code> event from the Counter smart contract, indexed by The Graph.
      </p>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Incremented By</th>
              <th>Timestamp</th>
              <th>Transaction Hash</th>
            </tr>
          </thead>
          <tbody>
            {/* 3. 处理加载和错误状态 */}
            {loading && (
              <tr>
                <td colSpan={4}>Loading...</td>
              </tr>
            )}
            {error && (
              <tr>
                <td colSpan={4} className="error">
                  Error fetching data: {error.message}. Is your local graph-node running?
                </td>
              </tr>
            )}
            {/* 4. 渲染数据 */}
            {data && data.increments.map((inc) => (
              <tr key={inc.id}>
                <td title={inc.id}>{truncateHash(inc.id)}</td>
                <td>{inc.by}</td>
                <td>{formatTimestamp(inc.blockTimestamp)}</td>
                <td>
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${inc.transactionHash}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    title={inc.transactionHash}
                  >
                    {truncateHash(inc.transactionHash)}
                  </a>
                </td>
              </tr>
            ))}
             {data && data.increments.length === 0 && (
              <tr>
                <td colSpan={4}>No events found. Interact with the contract to see data here.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default App;
