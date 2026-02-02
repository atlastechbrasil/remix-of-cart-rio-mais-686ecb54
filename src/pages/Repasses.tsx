import { Calendar, Download, RefreshCw, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const repasses = [
  {
    id: 1,
    entidade: "Tribunal de Justiça - SP",
    tipo: "Custas Judiciais",
    competencia: "Janeiro/2024",
    valorBruto: 45000,
    valorRepasse: 14625,
    percentual: 32.5,
    vencimento: "10/02/2024",
    status: "pendente",
  },
  {
    id: 2,
    entidade: "IPESP",
    tipo: "Contribuição Previdenciária",
    competencia: "Janeiro/2024",
    valorBruto: 45000,
    valorRepasse: 4500,
    percentual: 10,
    vencimento: "15/02/2024",
    status: "pendente",
  },
  {
    id: 3,
    entidade: "SINOREG-SP",
    tipo: "Contribuição Sindical",
    competencia: "Janeiro/2024",
    valorBruto: 45000,
    valorRepasse: 900,
    percentual: 2,
    vencimento: "20/02/2024",
    status: "pendente",
  },
  {
    id: 4,
    entidade: "Tribunal de Justiça - SP",
    tipo: "Custas Judiciais",
    competencia: "Dezembro/2023",
    valorBruto: 42000,
    valorRepasse: 13650,
    percentual: 32.5,
    vencimento: "10/01/2024",
    status: "pago",
  },
  {
    id: 5,
    entidade: "IPESP",
    tipo: "Contribuição Previdenciária",
    competencia: "Dezembro/2023",
    valorBruto: 42000,
    valorRepasse: 4200,
    percentual: 10,
    vencimento: "15/01/2024",
    status: "pago",
  },
  {
    id: 6,
    entidade: "SINOREG-SP",
    tipo: "Contribuição Sindical",
    competencia: "Dezembro/2023",
    valorBruto: 42000,
    valorRepasse: 840,
    percentual: 2,
    vencimento: "20/01/2024",
    status: "pago",
  },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const statusConfig = {
  pendente: {
    label: "Pendente",
    icon: Clock,
    className: "bg-warning/10 text-warning border-warning/20",
  },
  pago: {
    label: "Pago",
    icon: CheckCircle,
    className: "bg-success/10 text-success border-success/20",
  },
  atrasado: {
    label: "Atrasado",
    icon: AlertCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

export default function Repasses() {
  const totalPendente = repasses
    .filter((r) => r.status === "pendente")
    .reduce((acc, r) => acc + r.valorRepasse, 0);

  const totalPago = repasses
    .filter((r) => r.status === "pago")
    .reduce((acc, r) => acc + r.valorRepasse, 0);

  return (
    <MainLayout>
      <PageHeader title="Repasses e Prestação de Contas" description="Controle de repasses obrigatórios">
        <div className="flex items-center gap-2">
          <Select defaultValue="janeiro">
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="janeiro">Janeiro 2024</SelectItem>
              <SelectItem value="dezembro">Dezembro 2023</SelectItem>
              <SelectItem value="novembro">Novembro 2023</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
          <Button className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Calcular Repasses
          </Button>
        </div>
      </PageHeader>

      <div className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receita Bruta do Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {formatCurrency(185420)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-warning" />
                Repasses Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-warning">
                {formatCurrency(totalPendente)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                Repasses Efetuados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(totalPago)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Repasse Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">32,5%</p>
              <Progress value={32.5} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Repasses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalhamento de Repasses</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Competência</TableHead>
                  <TableHead className="text-right">Receita Base</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead className="text-right">Valor Repasse</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repasses.map((repasse) => {
                  const config = statusConfig[repasse.status as keyof typeof statusConfig];
                  const StatusIcon = config.icon;
                  return (
                    <TableRow key={repasse.id}>
                      <TableCell className="font-medium">
                        {repasse.entidade}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {repasse.tipo}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{repasse.competencia}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(repasse.valorBruto)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {repasse.percentual}%
                      </TableCell>
                      <TableCell className="text-right font-bold text-warning">
                        {formatCurrency(repasse.valorRepasse)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {repasse.vencimento}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={config.className}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
