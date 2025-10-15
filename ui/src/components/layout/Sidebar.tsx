import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import UseIdl from '../../hooks/useIDL';

export const Sidebar: React.FC = () => {
  const { idl } = UseIdl();

  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen hidden lg:block">
      <div className="p-4">
        <nav className="space-y-4">
          {/* Programs Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <span>📦</span>
                <span>Programs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {idl ? (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div className="font-medium">{idl.metadata.name}</div>
                  <div className="text-xs mt-1">{idl.metadata.description}</div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  No program loaded
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
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
                        className="w-full justify-start text-left h-auto p-2"
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-sm">{instruction.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {instruction.accounts?.length || 0} accounts, {instruction.args?.length || 0} args
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  No instructions available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <span>🔧</span>
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  📁 Load IDL
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  🔄 Refresh
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
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
