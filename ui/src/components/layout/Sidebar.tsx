
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import UseIdl from '../../hooks/useIDL';

export const Sidebar = () => {
  const { idl } = UseIdl();

  return (
    <aside className="w-64 bg-surface-secondary dark:bg-surface-dark-secondary border-r border-border dark:border-border-dark min-h-screen hidden lg:block">
      <div className="p-4">
        <nav className="space-y-4">
          {/* Programs Section */}
          <Card className="bg-surface dark:bg-surface-dark border-border dark:border-border-dark">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2 text-foreground dark:text-foreground-dark">
                <span>📦</span>
                <span>Programs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {idl ? (
                <div className="text-sm text-foreground/70 dark:text-foreground-dark/70">
                  <div className="font-medium text-foreground dark:text-foreground-dark">{idl.metadata.name}</div>
                  <div className="text-xs mt-1">{idl.metadata.description}</div>
                </div>
              ) : (
                <div className="text-sm text-foreground/50 dark:text-foreground-dark/50">
                  No program loaded
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions Section */}
          <Card className="bg-surface dark:bg-surface-dark border-border dark:border-border-dark">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2 text-foreground dark:text-foreground-dark">
                <span>⚡</span>
                <span>Instructions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {idl && idl.instructions.length > 0 ? (
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {idl.instructions.map((instruction) => (
                      <Button
                        key={instruction.name}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left h-auto p-2 hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary text-foreground dark:text-foreground-dark"
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-sm">{instruction.name}</span>
                          <span className="text-xs text-foreground/50 dark:text-foreground-dark/50">
                            {instruction.accounts?.length || 0} accounts, {instruction.args?.length || 0} args
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-sm text-foreground/50 dark:text-foreground-dark/50">
                  No instructions available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-surface dark:bg-surface-dark border-border dark:border-border-dark">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2 text-foreground dark:text-foreground-dark">
                <span>🔧</span>
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start border-border dark:border-border-dark hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary text-foreground dark:text-foreground-dark">
                  📁 Load IDL
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start border-border dark:border-border-dark hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary text-foreground dark:text-foreground-dark">
                  🔄 Refresh
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start border-border dark:border-border-dark hover:bg-surface-secondary dark:hover:bg-surface-dark-secondary text-foreground dark:text-foreground-dark">
                  📊 View Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </nav>
      </div>
    </aside>
  );
};
