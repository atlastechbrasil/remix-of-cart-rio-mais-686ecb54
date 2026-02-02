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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const statusStyles = {
  processado: "pendente",
  conciliado: "conciliado",
  erro: "divergente",
};

const statusLabels = {
  processado: "Em Processamento",
  conciliado: "Conciliado",
  erro: "Com Erros",
};

export default function Extratos() {
  const { data: extratos, isLoading: loadingExtratos } = useExtratos();
  const { data: contas } = useContasBancarias();

  const handleImportSuccess = (data: any[], banco: string, conta: string) => {
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

  const extratosData = extratos || [];

  return (
    <MainLayout>
      <PageHeader
        title="Importação de Extratos"
        description="Importe e gerencie extratos bancários OFX e CSV"
      >
        <div className="flex items-center gap-2">
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
        </div>
      </PageHeader>

      <div className="flex-1 p-6 space-y-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Extratos Importados</p>
                  <p className="text-2xl font-bold">{extratosData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Totalmente Conciliados</p>
                  <p className="text-2xl font-bold text-success">
                    {extratosData.filter((e) => e.status === "conciliado").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Em Processamento</p>
                  <p className="text-2xl font-bold text-warning">
                    {extratosData.filter((e) => e.status === "processado").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-destructive/10">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Com Erros</p>
                  <p className="text-2xl font-bold text-destructive">
                    {extratosData.filter((e) => e.status === "erro").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Histórico de Importações */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Histórico de Importações</CardTitle>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {extratosData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Banco / Conta</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead className="text-center">Lançamentos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Importado em</TableHead>
                    <TableHead className="w-24"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extratosData.map((extrato) => (
                    <TableRow key={extrato.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">{extrato.arquivo}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {extrato.conta_bancaria?.banco || "N/A"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {extrato.conta_bancaria?.conta || "N/A"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(parseISO(extrato.periodo_inicio), "dd/MM/yyyy")} -{" "}
                        {format(parseISO(extrato.periodo_fim), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {extrato.total_lancamentos}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusStyles[extrato.status as keyof typeof statusStyles]}
                        >
                          {statusLabels[extrato.status as keyof typeof statusLabels] || extrato.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(parseISO(extrato.created_at), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-12 text-center">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum extrato importado</h3>
                <p className="text-muted-foreground mb-4">
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
