import { useState } from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  Download,
  Calendar,
  Filter,
  Loader2,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImportarExtratoDialog } from "@/components/extratos/ImportarExtratoDialog";
import { useExtratos, useContasBancarias } from "@/hooks/useConciliacao";
import { format, parseISO } from "date-fns";
import { ResponsiveTable, type Column } from "@/components/ui/responsive-table";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ExtratoItem {
  id: string;
  arquivo: string;
  conta_bancaria: { banco: string; conta: string } | null;
  periodo_inicio: string;
  periodo_fim: string;
  total_lancamentos: number;
  status: string;
  created_at: string;
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

export default function Extratos() {
  const { data: extratos, isLoading: loadingExtratos } = useExtratos();
  const { data: contas } = useContasBancarias();
  const isMobile = useIsMobile();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleImportSuccess = (data: unknown[], banco: string, conta: string) => {
    // O hook já invalida o cache automaticamente
  };

  if (loadingExtratos) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const extratosData = (extratos || []) as ExtratoItem[];

  const columns: Column<ExtratoItem>[] = [
    {
      key: "arquivo",
      header: "Arquivo",
      render: (item) => (
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="font-medium text-sm truncate">{item.arquivo}</span>
        </div>
      ),
    },
    {
      key: "conta_bancaria",
      header: "Banco / Conta",
      render: (item) => (
        <div>
          <p className="font-medium text-sm">{item.conta_bancaria?.banco || "N/A"}</p>
          <p className="text-xs text-muted-foreground">{item.conta_bancaria?.conta || "N/A"}</p>
        </div>
      ),
    },
    {
      key: "periodo",
      header: "Período",
      hideOnMobile: true,
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {format(parseISO(item.periodo_inicio), "dd/MM/yyyy")} -{" "}
          {format(parseISO(item.periodo_fim), "dd/MM/yyyy")}
        </span>
      ),
    },
    {
      key: "total_lancamentos",
      header: "Lançamentos",
      className: "text-center",
      render: (item) => <span className="font-medium">{item.total_lancamentos}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <Badge variant="outline" className={statusStyles[item.status] || ""}>
          {statusLabels[item.status] || item.status}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Importado em",
      hideOnMobile: true,
      render: (item) => (
        <span className="text-sm text-muted-foreground">
          {format(parseISO(item.created_at), "dd/MM/yyyy HH:mm")}
        </span>
      ),
    },
  ];

  const renderActions = (item: ExtratoItem) => (
    <>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Eye className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <Download className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
        <Trash2 className="w-4 h-4" />
      </Button>
    </>
  );

  return (
    <MainLayout>
      <PageHeader
        title="Importação de Extratos"
        description="Importe e gerencie extratos bancários OFX e CSV"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {/* Mobile: Collapsible filters */}
          {isMobile ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setFiltersOpen(!filtersOpen)}>
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <ImportarExtratoDialog onImportSuccess={handleImportSuccess} />
            </div>
          ) : (
            <>
              <Select defaultValue="todos">
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Banco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Bancos</SelectItem>
                  {contas?.map((conta) => (
                    <SelectItem key={conta.id} value={conta.id}>
                      {conta.banco}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Período
              </Button>
              <ImportarExtratoDialog onImportSuccess={handleImportSuccess} />
            </>
          )}
        </div>
      </PageHeader>

      <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Mobile Filters Collapsible */}
        {isMobile && (
          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleContent className="space-y-3">
              <Card>
                <CardContent className="p-4 space-y-3">
                  <Select defaultValue="todos">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Banco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Bancos</SelectItem>
                      {contas?.map((conta) => (
                        <SelectItem key={conta.id} value={conta.id}>
                          {conta.banco}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="w-full">
                    <Calendar className="w-4 h-4 mr-2" />
                    Selecionar Período
                  </Button>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                  <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Importados</p>
                  <p className="text-lg sm:text-2xl font-bold">{extratosData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-success/10">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Conciliados</p>
                  <p className="text-lg sm:text-2xl font-bold text-success">
                    {extratosData.filter((e) => e.status === "conciliado").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-warning/10">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Processando</p>
                  <p className="text-lg sm:text-2xl font-bold text-warning">
                    {extratosData.filter((e) => e.status === "processado").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-destructive/10">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Com Erros</p>
                  <p className="text-lg sm:text-2xl font-bold text-destructive">
                    {extratosData.filter((e) => e.status === "erro").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Histórico de Importações */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">Histórico de Importações</CardTitle>
              {!isMobile && (
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            {extratosData.length > 0 ? (
              <ResponsiveTable
                data={extratosData}
                columns={columns}
                keyExtractor={(item) => item.id}
                renderActions={renderActions}
              />
            ) : (
              <div className="py-8 sm:py-12 text-center">
                <FileSpreadsheet className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">Nenhum extrato importado</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Importe seu primeiro extrato bancário para iniciar a conciliação.
                </p>
                <ImportarExtratoDialog onImportSuccess={handleImportSuccess} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
