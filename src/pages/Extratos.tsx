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
import { cn } from "@/lib/utils";
import { ImportarExtratoDialog } from "@/components/extratos/ImportarExtratoDialog";

const extratosImportados = [
  {
    id: 1,
    arquivo: "extrato_bb_jan2024.ofx",
    banco: "Banco do Brasil",
    conta: "56789-0",
    periodo: "01/01/2024 - 31/01/2024",
    lancamentos: 156,
    conciliados: 142,
    pendentes: 12,
    divergentes: 2,
    dataImportacao: "29/01/2024 14:30",
    status: "processado",
  },
  {
    id: 2,
    arquivo: "extrato_itau_jan2024.csv",
    banco: "Itaú Unibanco",
    conta: "12345-6",
    periodo: "01/01/2024 - 28/01/2024",
    lancamentos: 89,
    conciliados: 85,
    pendentes: 4,
    divergentes: 0,
    dataImportacao: "28/01/2024 16:45",
    status: "processado",
  },
  {
    id: 3,
    arquivo: "extrato_caixa_jan2024.ofx",
    banco: "Caixa Econômica",
    conta: "34567-8",
    periodo: "01/01/2024 - 27/01/2024",
    lancamentos: 45,
    conciliados: 45,
    pendentes: 0,
    divergentes: 0,
    dataImportacao: "27/01/2024 10:00",
    status: "conciliado",
  },
  {
    id: 4,
    arquivo: "extrato_santander_dez2023.ofx",
    banco: "Santander",
    conta: "78901-2",
    periodo: "01/12/2023 - 31/12/2023",
    lancamentos: 78,
    conciliados: 78,
    pendentes: 0,
    divergentes: 0,
    dataImportacao: "02/01/2024 09:15",
    status: "conciliado",
  },
];

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
  const [extratos, setExtratos] = useState(extratosImportados);

  const handleImportSuccess = (data: any[], banco: string, conta: string) => {
    const novoExtrato = {
      id: extratos.length + 1,
      arquivo: `extrato_import_${Date.now()}.ofx`,
      banco,
      conta,
      periodo: "01/01/2024 - 31/01/2024",
      lancamentos: data.length,
      conciliados: 0,
      pendentes: data.length,
      divergentes: 0,
      dataImportacao: new Date().toLocaleString("pt-BR"),
      status: "processado",
    };
    setExtratos([novoExtrato, ...extratos]);
  };

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
              <SelectItem value="bb">Banco do Brasil</SelectItem>
              <SelectItem value="itau">Itaú Unibanco</SelectItem>
              <SelectItem value="caixa">Caixa Econômica</SelectItem>
              <SelectItem value="santander">Santander</SelectItem>
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
                  <p className="text-2xl font-bold">{extratos.length}</p>
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
                    {extratos.filter((e) => e.status === "conciliado").length}
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
                    {extratos.filter((e) => e.status === "processado").length}
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
                  <p className="text-sm text-muted-foreground">Com Divergências</p>
                  <p className="text-2xl font-bold text-destructive">
                    {extratos.filter((e) => e.divergentes > 0).length}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Banco / Conta</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead className="text-center">Lançamentos</TableHead>
                  <TableHead className="text-center">Conciliados</TableHead>
                  <TableHead className="text-center">Pendentes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Importado em</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extratos.map((extrato) => (
                  <TableRow key={extrato.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">{extrato.arquivo}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{extrato.banco}</p>
                        <p className="text-xs text-muted-foreground">{extrato.conta}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {extrato.periodo}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {extrato.lancamentos}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-success font-medium">{extrato.conciliados}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      {extrato.pendentes > 0 ? (
                        <span className="text-warning font-medium">{extrato.pendentes}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusStyles[extrato.status as keyof typeof statusStyles]}
                      >
                        {statusLabels[extrato.status as keyof typeof statusLabels]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {extrato.dataImportacao}
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
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
