import { useIDL } from "@/context/IDLContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import IDLLoaderModal from "./IDLLoaderModal";
import type { Idl } from "@coral-xyz/anchor";

interface SidebarProps {
  idl: Idl | null;
}

export const Sidebar = ({ idl }: SidebarProps) => {

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
                  <div className="font-medium text-foreground dark:text-foreground-dark">
                    {idl.metadata.name}
                  </div>
                  <div className="text-xs mt-1">{idl.metadata.description}</div>
                </div>
              ) : (
                <div className="text-sm text-foreground/50 dark:text-foreground-dark/50">
                  No program loaded
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
                <IDLLoaderModal />
              </div>
            </CardContent>
          </Card>
        </nav>
      </div>
    </aside>
  );
};
