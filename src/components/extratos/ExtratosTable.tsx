import React, { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  Eye,
  Trash2,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export interface ExtratoItem {
  id: string;
  arquivo: string;
  conta_id: string;
  conta_bancaria: { banco: string; agencia?: string; conta: string } | null;
  periodo_inicio: string;
  periodo_fim: string;
  total_lancamentos: number;
  status: string;
  created_at: string;
}

type SortField = "arquivo" | "total_lancamentos" | "status" | "created_at";
type SortDirection = "asc" | "desc";

interface ExtratosTableProps {
  data: ExtratoItem[];
  onViewDetails: (extrato: ExtratoItem) => void;
  onDownload: (extrato: ExtratoItem) => void;
  onDelete: (extrato: ExtratoItem) => void;
  onDeleteBatch: (extratos: ExtratoItem[]) => void;
}

const statusStyles: Record<string, string> = {
  processado: "pendente",
  conciliado: "conciliado",
  erro: "divergente",
};

const statusLabels: Record<string, string> = {
  processado: "Em Processamento",
  conciliado: "Conciliado",
  erro: "Com Erros",
};

const statusOrder: Record<string, number> = {
  erro: 0,
  processado: 1,
  conciliado: 2,
};

export function ExtratosTable({
  data,
  onViewDetails,
  onDownload,
  onDelete,
  onDeleteBatch,
}: ExtratosTableProps) {
  const isMobile = useIsMobile();

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Sort data
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "arquivo":
          comparison = a.arquivo.localeCompare(b.arquivo);
          break;
        case "total_lancamentos":
          comparison = a.total_lancamentos - b.total_lancamentos;
          break;
        case "status":
          comparison = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
          break;
        case "created_at":
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [data, sortField, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Reset page when items per page changes or data changes
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Handle selection
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map((e) => e.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleDeleteSelected = () => {
    const selectedExtratos = data.filter((e) => selectedIds.has(e.id));
    onDeleteBatch(selectedExtratos);
    setSelectedIds(new Set());
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 text-muted-foreground" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  const SortableHeader = ({
    field,
    children,
    className,
  }: {
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead className={className}>
      <button
        onClick={() => handleSort(field)}
        className="flex items-center hover:text-foreground transition-colors"
      >
        {children}
        {getSortIcon(field)}
      </button>
    </TableHead>
  );

  // Mobile card layout
  if (isMobile) {
    return (
      <div className="space-y-3">
        {/* Batch actions for mobile */}
        {selectedIds.size > 0 && (
          <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
            <span className="text-sm font-medium">
              {selectedIds.size} selecionado{selectedIds.size !== 1 && "s"}
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Excluir
            </Button>
          </div>
        )}

        {paginatedData.map((item) => (
          <Card
            key={item.id}
            className={cn(
              "overflow-hidden",
              selectedIds.has(item.id) && "ring-2 ring-primary"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedIds.has(item.id)}
                  onCheckedChange={() => toggleSelect(item.id)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-medium text-sm truncate">
                      {item.arquivo}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.conta_bancaria?.banco} • {item.conta_bancaria?.conta}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{item.total_lancamentos} lançamentos</Badge>
                    <Badge variant="outline" className={statusStyles[item.status] || ""}>
                      {statusLabels[item.status] || item.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Importado em {format(parseISO(item.created_at), "dd/MM/yyyy HH:mm")}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2 border-t pt-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onViewDetails(item)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onDownload(item)}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => onDelete(item)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Mobile pagination */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">
            {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, sortedData.length)} de {sortedData.length}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop table layout
  return (
    <div className="space-y-4">
      {/* Batch actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedIds.size} extrato{selectedIds.size !== 1 && "s"} selecionado
            {selectedIds.size !== 1 && "s"}
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir Selecionados
          </Button>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={
                    paginatedData.length > 0 &&
                    selectedIds.size === paginatedData.length
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <SortableHeader field="arquivo">Arquivo</SortableHeader>
              <TableHead>Banco / Conta</TableHead>
              <TableHead>Período</TableHead>
              <SortableHeader field="total_lancamentos" className="text-center">
                Lançamentos
              </SortableHeader>
              <SortableHeader field="status">Status</SortableHeader>
              <SortableHeader field="created_at">Importado em</SortableHeader>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item) => (
              <TableRow
                key={item.id}
                className={cn(selectedIds.has(item.id) && "bg-muted/50")}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(item.id)}
                    onCheckedChange={() => toggleSelect(item.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-medium text-sm truncate max-w-[200px]">
                      {item.arquivo}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">
                      {item.conta_bancaria?.banco || "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.conta_bancaria?.conta || "N/A"}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {format(parseISO(item.periodo_inicio), "dd/MM/yyyy")} -{" "}
                    {format(parseISO(item.periodo_fim), "dd/MM/yyyy")}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-medium">{item.total_lancamentos}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusStyles[item.status] || ""}>
                    {statusLabels[item.status] || item.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {format(parseISO(item.created_at), "dd/MM/yyyy HH:mm")}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onViewDetails(item)}
                      title="Ver detalhes"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onDownload(item)}
                      title="Baixar extrato"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(item)}
                      title="Excluir extrato"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Itens por página:</span>
          <Select
            value={String(itemsPerPage)}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, sortedData.length)} de{" "}
            {sortedData.length}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
