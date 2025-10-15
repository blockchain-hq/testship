import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

interface TransactionResult {
  id: string;
  signature?: string;
  status: 'success' | 'error' | 'pending';
  logs: LogEntry[];
  timestamp: Date;
}

export const LogsPanel: React.FC = () => {
  const [logs, setLogs] = React.useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date(),
      type: 'info',
      message: 'Application started',
    },
    {
      id: '2',
      timestamp: new Date(),
      type: 'success',
      message: 'Wallet connected successfully',
    },
    {
      id: '3',
      timestamp: new Date(),
      type: 'info',
      message: 'Ready for instructions...',
    },
  ]);

  const [transactions, setTransactions] = React.useState<TransactionResult[]>([]);

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  const getStatusBadge = (status: TransactionResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const clearLogs = () => {
    setLogs([]);
    setTransactions([]);
  };

  const addMockTransaction = () => {
    const newTransaction: TransactionResult = {
      id: Math.random().toString(36).substr(2, 9),
      signature: Math.random().toString(36).substr(2, 44),
      status: 'success',
      timestamp: new Date(),
      logs: [
        {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          type: 'info',
          message: 'Instruction executed',
        },
        {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date(),
          type: 'success',
          message: 'Transaction confirmed',
        },
      ],
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setLogs(prev => [...newTransaction.logs, ...prev]);
  };

  return (
    <div className="space-y-4">
      {/* Transaction Results */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <span>📊</span>
              <span>Transaction Results</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={addMockTransaction}>
                Test Transaction
              </Button>
              <Button variant="outline" size="sm" onClick={clearLogs}>
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {transactions.length > 0 ? (
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(tx.status)}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {tx.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    {tx.signature && (
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs p-0 h-auto"
                        onClick={() => {
                          // Mock explorer link
                          console.log('Opening explorer for:', tx.signature);
                        }}
                      >
                        {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No transactions yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Console Logs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <span>🖥️</span>
            <span>Console Logs</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-48">
            <div className="space-y-1 font-mono text-sm">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start space-x-2">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="flex-shrink-0">
                    {getLogIcon(log.type)}
                  </span>
                  <span className={`flex-1 ${getLogColor(log.type)}`}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
