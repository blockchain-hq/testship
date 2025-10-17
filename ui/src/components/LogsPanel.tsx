import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { TransactionResult, TransactionResultLog } from '@/lib/types';
import { ExternalLinkIcon } from 'lucide-react';

 

export const LogsPanel = ({ transactionResults }: { transactionResults: TransactionResult[] }) => {
 

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

  
 
  return (
    <div className="space-y-4"> 
      <Card className="bg-surface dark:bg-surface-dark border-border dark:border-border-dark">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center space-x-2 text-foreground dark:text-foreground-dark">
              <span>📊</span>
              <span>Transaction Results</span>
            </CardTitle>
              <div className="flex space-x-2">
                {/* <Button variant="outline" size="sm" onClick={clearLogs} className="border-border dark:border-border-dark hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary text-foreground dark:text-foreground-dark">
                  Clear All
                </Button> */}
              </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 min-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-800">
          {transactionResults.length > 0 ? (
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {transactionResults.map((tx: TransactionResult) => (
                  <div key={tx.id} className="flex items-center justify-between p-2 bg-surface-secondary dark:bg-surface-dark-secondary rounded">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(tx.status)}
                      <span className="text-xs text-foreground/60 dark:text-foreground-dark/60">
                        {new Date(tx.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {tx.logs.map((log: TransactionResultLog) => (
                        <Badge key={log.id} variant={log.type === 'success' ? 'default' : log.type === 'error' ? 'destructive' : 'secondary'} className="text-xs">
                          {log.message}
                        </Badge>
                      ))}
                    </div>
                    {tx.explorerUrl && (
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs font-medium cursor-pointer text-foreground dark:text-foreground-dark p-0 h-auto text-accent-primary hover:text-accent-primary/80"
                        onClick={() => {
                          if (tx.explorerUrl) {
                            window.open(tx.explorerUrl, '_blank');
                          }
                        }}
                      >
                        <ExternalLinkIcon className="w-4 h-4" />
                        View in Explorer
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
    </div>
  );
};
