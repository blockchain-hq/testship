import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Checkbox } from "../../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../../ui/dropdown-menu";
import {
  Layout,
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Tag,
} from "lucide-react";

export type LayoutAlgorithm = "hierarchical" | "force" | "radial";

interface GraphControlsProps {
  layoutAlgorithm: LayoutAlgorithm;
  onLayoutChange: (layout: LayoutAlgorithm) => void;
  accountTypes: string[];
  selectedTypes: Set<string>;
  onTypeToggle: (type: string) => void;
  showEdgeLabels: boolean;
  onToggleEdgeLabels: () => void;
  onFitView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onExportPNG: () => void;
  minRefs: number;
  onMinRefsChange: (value: number) => void;
}

export const GraphControls = ({
  layoutAlgorithm,
  onLayoutChange,
  accountTypes,
  selectedTypes,
  onTypeToggle,
  showEdgeLabels,
  onToggleEdgeLabels,
  onFitView,
  onZoomIn,
  onZoomOut,
  onExportPNG,
  minRefs,
  onMinRefsChange,
}: GraphControlsProps) => {
  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg max-w-xs">
      {/* Layout Algorithm Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium flex items-center gap-1.5">
          <Layout className="w-3 h-3" />
          Layout Algorithm
        </label>
        <Select value={layoutAlgorithm} onValueChange={onLayoutChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hierarchical" className="text-xs">
              Hierarchical (Tree)
            </SelectItem>
            <SelectItem value="force" className="text-xs">
              Force-Directed
            </SelectItem>
            <SelectItem value="radial" className="text-xs">
              Radial (Circular)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Account Type Filter */}
      {accountTypes.length > 0 && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium flex items-center gap-1.5">
            <Tag className="w-3 h-3" />
            Account Types
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-full text-xs">
                <Filter className="w-3 h-3 mr-2" />
                {selectedTypes.size === accountTypes.length
                  ? "All Types"
                  : `${selectedTypes.size} Selected`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="text-xs">
                Filter by Type
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {accountTypes.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={selectedTypes.has(type)}
                  onCheckedChange={() => onTypeToggle(type)}
                  className="text-xs"
                >
                  {type}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Minimum References Filter */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium flex items-center justify-between">
          <span>Min References</span>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
            {minRefs}
          </Badge>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="10"
            value={minRefs}
            onChange={(e) => onMinRefsChange(Number(e.target.value))}
            className="flex-1 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      {/* Edge Labels Toggle */}
      <div className="flex items-center gap-2 py-1">
        <Checkbox
          id="edge-labels"
          checked={showEdgeLabels}
          onCheckedChange={onToggleEdgeLabels}
        />
        <label
          htmlFor="edge-labels"
          className="text-xs font-medium cursor-pointer"
        >
          Show Edge Labels
        </label>
      </div>

      {/* View Controls */}
      <div className="space-y-1.5 pt-2 border-t border-border/50">
        <div className="grid grid-cols-2 gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={onZoomIn}
          >
            <ZoomIn className="w-3 h-3 mr-1" />
            Zoom In
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={onZoomOut}
          >
            <ZoomOut className="w-3 h-3 mr-1" />
            Zoom Out
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-full text-xs"
          onClick={onFitView}
        >
          <Maximize2 className="w-3 h-3 mr-1" />
          Fit View
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-full text-xs"
          onClick={onExportPNG}
        >
          <Download className="w-3 h-3 mr-1" />
          Export PNG
        </Button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-[9px] text-muted-foreground pt-2 border-t border-border/50 space-y-0.5">
        <p>
          <kbd className="px-1 py-0.5 bg-muted rounded text-[8px]">F</kbd> Fit
          View
        </p>
        <p>
          <kbd className="px-1 py-0.5 bg-muted rounded text-[8px]">+</kbd>{" "}
          <kbd className="px-1 py-0.5 bg-muted rounded text-[8px]">-</kbd> Zoom
        </p>
      </div>
    </div>
  );
};

