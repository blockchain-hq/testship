import { useState } from 'react';
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

export const LogsPanel = () => {
  const [logs, setLogs] = useState<LogEntry[]>([
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

  const [transactions, setTransactions] = useState<TransactionResult[]>([]);

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
      case 'success': return 'text-log-success';
      case 'error': return 'text-log-error';
      case 'warning': return 'text-log-warning';
      default: return 'text-log-info';
    }
  };

  const getStatusBadge = (status: TransactionResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500 text-white">Success</Badge>;
      case 'error':
        return <Badge variant="destructive" className="bg-red-500 text-white">Error</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500 text-white">Pending</Badge>;
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
      <Card className="bg-surface dark:bg-surface-dark border-border dark:border-border-dark">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center space-x-2 text-foreground dark:text-foreground-dark">
              <span>📊</span>
              <span>Transaction Results</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={addMockTransaction} className="border-border dark:border-border-dark hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary text-foreground dark:text-foreground-dark">
                Test Transaction
              </Button>
              <Button variant="outline" size="sm" onClick={clearLogs} className="border-border dark:border-border-dark hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary text-foreground dark:text-foreground-dark">
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
                  <div key={tx.id} className="flex items-center justify-between p-2 bg-surface-secondary dark:bg-surface-dark-secondary rounded">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(tx.status)}
                      <span className="text-xs text-foreground/60 dark:text-foreground-dark/60">
                        {tx.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    {tx.signature && (
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs p-0 h-auto text-accent-primary hover:text-accent-primary/80"
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
            <div className="text-sm text-foreground/50 dark:text-foreground-dark/50 text-center py-4">
              No transactions yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Console Logs */}
      <Card className="bg-surface dark:bg-surface-dark border-border dark:border-border-dark">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center space-x-2 text-foreground dark:text-foreground-dark">
            <span>🖥️</span>
            <span>Console Logs</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-48">
            <div className="space-y-1 font-mono text-sm">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start space-x-2">
                  <span className="text-foreground/40 dark:text-foreground-dark/40 text-xs">
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
