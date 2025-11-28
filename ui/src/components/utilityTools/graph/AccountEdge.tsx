import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
  type Edge,
} from "@xyflow/react";
import { Badge } from "../../ui/badge";

export interface AccountEdgeData extends Record<string, unknown> {
  fieldName?: string;
  isRecent?: boolean;
}

export const AccountEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
  }: EdgeProps<Edge<AccountEdgeData>>) => {
    const [edgePath, labelX, labelY] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    });

    const isRecent = data?.isRecent || false;
    const fieldName = data?.fieldName;

    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          style={{
            stroke: isRecent
              ? "hsl(142 76% 45%)"
              : selected
              ? "hsl(var(--primary))"
              : "hsl(var(--border))",
            strokeWidth: selected ? 2.5 : isRecent ? 2 : 1.5,
            opacity: selected ? 1 : 0.6,
          }}
        />

        {fieldName && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: "absolute",
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: "all",
              }}
              className="nodrag nopan"
            >
              <Badge
                variant="secondary"
                className="text-[8px] px-1.5 py-0 h-3.5 bg-background/95 backdrop-blur-sm border border-border/50"
              >
                {fieldName}
              </Badge>
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  }
);

AccountEdge.displayName = "AccountEdge";
