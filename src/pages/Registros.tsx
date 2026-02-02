import { useState } from "react";
import { Search, FileSpreadsheet, MoreHorizontal, Eye } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NovoRegistroDialog } from "@/components/registros/NovoRegistroDialog";

// Dados adaptados para Registro de Imóveis
const registros = [
  {
    id: 1,
    matricula: "45.678",
    tipo: "Registro",
    livro: "2-R",
    folha: "245",
    partes: "João Silva → Maria Santos",
    valor: 2450,
    taxa: 350,
    repasse: 612.5,
    data: "29/01/2024",
    status: "concluído",
    responsavel: "Dr. Carlos",
  },
  {
    id: 2,
    matricula: "12.345",
    tipo: "Averbação",
    livro: "2-AV",
    folha: "189",
    partes: "Empresa ABC Ltda",
    valor: 185,
    taxa: 45,
    repasse: 46.25,
    data: "29/01/2024",
    status: "concluído",
    responsavel: "Dra. Ana",
  },
  {
    id: 3,
    matricula: "78.901",
    tipo: "Registro",
    livro: "2-R",
    folha: "246",
    partes: "Pedro Oliveira → Construtora XYZ",
    valor: 8500,
    taxa: 1200,
    repasse: 2125,
    data: "28/01/2024",
    status: "em andamento",
    responsavel: "Dr. Carlos",
  },
  {
    id: 4,
    matricula: "34.567",
    tipo: "Cancelamento",
    livro: "2-R",
    folha: "201",
    partes: "Espólio de Maria Costa",
    valor: 450,
    taxa: 80,
    repasse: 112.5,
    data: "28/01/2024",
    status: "aguardando docs",
    responsavel: "Dra. Lucia",
  },
  {
    id: 5,
    matricula: "56.789",
    tipo: "Averbação",
    livro: "2-AV",
    folha: "190",
    partes: "Condomínio Residencial Sol",
    valor: 375,
    taxa: 60,
    repasse: 93.75,
    data: "27/01/2024",
    status: "concluído",
    responsavel: "Escrevente Paula",
  },
  {
    id: 6,
    matricula: "23.456",
    tipo: "Registro",
    livro: "2-R",
    folha: "244",
    partes: "Incorporadora Beta → Diversos",
    valor: 12500,
    taxa: 1800,
    repasse: 3125,
    data: "27/01/2024",
    status: "concluído",
    responsavel: "Escrevente Paula",
  },
];

const tiposRegistros = [
  { nome: "Registro", quantidade: 156, valorMedio: 4200 },
  { nome: "Averbação", quantidade: 289, valorMedio: 320 },
  { nome: "Cancelamento", quantidade: 45, valorMedio: 280 },
  { nome: "Certidão", quantidade: 892, valorMedio: 85 },
  { nome: "Busca", quantidade: 520, valorMedio: 15 },
  { nome: "Prenotação", quantidade: 78, valorMedio: 50 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const statusStyles = {
  "concluído": "conciliado",
  "em andamento": "bg-info/10 text-info border-info/20",
  "aguardando docs": "pendente",
  "cancelado": "divergente",
};

export default function Registros() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <MainLayout>
      <PageHeader title="Registros de Imóveis" description="Matrículas, averbações e registros">
        <NovoRegistroDialog />
      </PageHeader>

      <div className="flex-1 p-6 space-y-6">
        {/* Resumo por Tipo */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {tiposRegistros.map((tipo) => (
            <Card key={tipo.nome} className="hover:border-primary/20 transition-colors cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground truncate">
                    {tipo.nome}
                  </span>
                </div>
                <p className="text-xl font-bold text-foreground">{tipo.quantidade}</p>
                <p className="text-xs text-muted-foreground">
                  Média: {formatCurrency(tipo.valorMedio)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabela de Registros */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg">Registros Recentes</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por matrícula..."
                    className="pl-9 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select defaultValue="todos">
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tipo de Registro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    <SelectItem value="registro">Registro</SelectItem>
                    <SelectItem value="averbacao">Averbação</SelectItem>
                    <SelectItem value="cancelamento">Cancelamento</SelectItem>
                    <SelectItem value="certidao">Certidão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Livro/Folha</TableHead>
                  <TableHead>Partes</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Taxa</TableHead>
                  <TableHead className="text-right">Repasse</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registros.map((registro) => (
                  <TableRow key={registro.id}>
                    <TableCell className="font-medium font-mono text-sm">
                      {registro.matricula}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{registro.tipo}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {registro.livro} / {registro.folha}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {registro.partes}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(registro.valor)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(registro.taxa)}
                    </TableCell>
                    <TableCell className="text-right text-warning font-medium">
                      {formatCurrency(registro.repasse)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusStyles[registro.status as keyof typeof statusStyles]}
                      >
                        {registro.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {registro.responsavel}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
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
