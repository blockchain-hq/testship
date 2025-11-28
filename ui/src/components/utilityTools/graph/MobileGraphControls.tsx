import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../../ui/dropdown-menu";
import { Settings, Layout, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import type { LayoutAlgorithm } from "./GraphControls";

interface MobileGraphControlsProps {
  layoutAlgorithm: LayoutAlgorithm;
  onLayoutChange: (layout: LayoutAlgorithm) => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const MobileGraphControls = ({
  layoutAlgorithm,
  onLayoutChange,
  onFitView,
  onZoomIn,
  onZoomOut,
}: MobileGraphControlsProps) => {
  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2 lg:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 bg-background/95 backdrop-blur-sm shadow-sm"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="flex items-center gap-1.5 text-xs">
            <Layout className="w-3 h-3" />
            Layout
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={layoutAlgorithm}
            onValueChange={(value) =>
              onLayoutChange(value as LayoutAlgorithm)
            }
          >
            <DropdownMenuRadioItem value="hierarchical" className="text-xs">
              Hierarchical
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="force" className="text-xs">
              Force-Directed
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="radial" className="text-xs">
              Radial
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <div className="p-2 space-y-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-7 text-xs"
              onClick={onFitView}
            >
              <Maximize2 className="w-3 h-3 mr-1" />
              Fit View
            </Button>
            <div className="grid grid-cols-2 gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={onZoomIn}
              >
                <ZoomIn className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={onZoomOut}
              >
                <ZoomOut className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

