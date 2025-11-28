import { useState, useMemo } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  ChevronDown,
  ChevronUp,
  Columns3,
  Download,
  ExternalLink,
} from "lucide-react";
import type { DecodedAccount } from "@/hooks/useProgramAccounts";
import { formatLamports, countPublicKeyRefs } from "@/lib/utils/account-state";
import { AccountDecodedData } from "./AccountDecodedData";

interface AccountTableViewProps {
  accounts: DecodedAccount[];
  getAccountExplorerUrl: (address: string) => string;
  recentChanges?: Map<
    string,
    { timestamp: number; txSignature: string; instructionName: string }
  >;
}

type SortField = "address" | "type" | "lamports" | "refs" | "recent";
type SortDirection = "asc" | "desc";

interface ColumnConfig {
  id: string;
  label: string;
  enabled: boolean;
}

export const AccountTableView = ({
  accounts,
  getAccountExplorerUrl,
  recentChanges,
}: AccountTableViewProps) => {
  const [sortField, setSortField] = useState<SortField>("address");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { id: "address", label: "Address", enabled: true },
    { id: "type", label: "Type", enabled: true },
    { id: "lamports", label: "Balance", enabled: true },
    { id: "refs", label: "References", enabled: true },
    { id: "recent", label: "Recent", enabled: true },
  ]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const toggleColumn = (columnId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, enabled: !col.enabled } : col
      )
    );
  };

  const toggleRowExpanded = (pubkey: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(pubkey)) {
        next.delete(pubkey);
      } else {
        next.add(pubkey);
      }
      return next;
    });
  };

  const sortedAccounts = useMemo(() => {
    const sorted = [...accounts].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "address":
          comparison = a.pubkey.localeCompare(b.pubkey);
          break;
        case "type":
          comparison = (a.accountType || "").localeCompare(b.accountType || "");
          break;
        case "lamports":
          comparison = a.account.lamports - b.account.lamports;
          break;
        case "refs":
          const refsA = a.decoded ? countPublicKeyRefs(a.decoded) : 0;
          const refsB = b.decoded ? countPublicKeyRefs(b.decoded) : 0;
          comparison = refsA - refsB;
          break;
        case "recent":
          const recentA = recentChanges?.get(a.pubkey)?.timestamp || 0;
          const recentB = recentChanges?.get(b.pubkey)?.timestamp || 0;
          comparison = recentB - recentA;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [accounts, sortField, sortDirection, recentChanges]);

  const exportToCSV = () => {
    const enabledColumns = columns.filter((col) => col.enabled);
    const headers = enabledColumns.map((col) => col.label).join(",");

    const rows = sortedAccounts.map((account) => {
      const row: string[] = [];

      enabledColumns.forEach((col) => {
        switch (col.id) {
          case "address":
            row.push(`"${account.pubkey}"`);
            break;
          case "type":
            row.push(`"${account.accountType || "N/A"}"`);
            break;
          case "lamports":
            row.push(account.account.lamports.toString());
            break;
          case "refs":
            const refs = account.decoded
              ? countPublicKeyRefs(account.decoded)
              : 0;
            row.push(refs.toString());
            break;
          case "recent":
            const recent = recentChanges?.has(account.pubkey) ? "Yes" : "No";
            row.push(recent);
            break;
        }
      });

      return row.join(",");
    });

    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `accounts-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-3 h-3 inline ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 inline ml-1" />
    );
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const enabledColumns = columns.filter((col) => col.enabled);

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Columns3 className="w-4 h-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  checked={col.enabled}
                  onCheckedChange={() => toggleColumn(col.id)}
                >
                  {col.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={exportToCSV}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {sortedAccounts.length} account
          {sortedAccounts.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-10"></TableHead>
                {enabledColumns.map((col) => (
                  <TableHead
                    key={col.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort(col.id as SortField)}
                  >
                    <div className="flex items-center font-semibold">
                      {col.label}
                      <SortIcon field={col.id as SortField} />
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAccounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={enabledColumns.length + 2}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No accounts found
                  </TableCell>
                </TableRow>
              ) : (
                sortedAccounts.map((account) => {
                  const isExpanded = expandedRows.has(account.pubkey);
                  const refCount = account.decoded
                    ? countPublicKeyRefs(account.decoded)
                    : 0;
                  const recentChange = recentChanges?.get(account.pubkey);

                  return (
                    <>
                      <TableRow
                        key={account.pubkey}
                        className="hover:bg-muted/20 cursor-pointer"
                        onClick={() => toggleRowExpanded(account.pubkey)}
                      >
                        <TableCell className="text-center">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 inline" />
                          ) : (
                            <ChevronUp className="w-4 h-4 inline rotate-180" />
                          )}
                        </TableCell>

                        {enabledColumns.map((col) => {
                          switch (col.id) {
                            case "address":
                              return (
                                <TableCell key={col.id}>
                                  <div className="font-mono text-xs">
                                    {account.pubkey.slice(0, 8)}...
                                    {account.pubkey.slice(-8)}
                                  </div>
                                </TableCell>
                              );

                            case "type":
                              return (
                                <TableCell key={col.id}>
                                  {account.accountType ? (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px]"
                                    >
                                      {account.accountType}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground text-xs">
                                      N/A
                                    </span>
                                  )}
                                </TableCell>
                              );

                            case "lamports":
                              return (
                                <TableCell key={col.id}>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] font-mono"
                                  >
                                    {formatLamports(account.account.lamports)}
                                  </Badge>
                                </TableCell>
                              );

                            case "refs":
                              return (
                                <TableCell key={col.id}>
                                  <Badge
                                    variant="outline"
                                    className="text-[10px]"
                                  >
                                    {refCount}
                                  </Badge>
                                </TableCell>
                              );

                            case "recent":
                              return (
                                <TableCell key={col.id}>
                                  {recentChange ? (
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                      <span className="text-xs text-muted-foreground">
                                        {formatTimeAgo(recentChange.timestamp)}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">
                                      -
                                    </span>
                                  )}
                                </TableCell>
                              );

                            default:
                              return <TableCell key={col.id}>-</TableCell>;
                          }
                        })}

                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(
                                getAccountExplorerUrl(account.pubkey),
                                "_blank"
                              );
                            }}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Row */}
                      {isExpanded && account.decoded && (
                        <TableRow key={`${account.pubkey}-expanded`}>
                          <TableCell
                            colSpan={enabledColumns.length + 2}
                            className="bg-muted/10 p-4"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between pb-2 border-b border-border/30">
                                <p className="text-sm font-semibold font-mono">
                                  Decoded Data
                                </p>
                                {recentChange && (
                                  <div className="text-xs text-muted-foreground">
                                    Modified by {recentChange.instructionName}
                                  </div>
                                )}
                              </div>
                              <AccountDecodedData decoded={account.decoded} />
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
