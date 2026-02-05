import { Building2, Bell, Palette, Database, Shield, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Configuracoes() {
  const isMobile = useIsMobile();

  return (
    <MainLayout>
      <PageHeader title="Configurações" description="Personalize o sistema conforme suas necessidades" />

      <div className="flex-1 p-4 sm:p-6">
        <Tabs defaultValue="cartorio" className="space-y-4 sm:space-y-6">
          {/* Scrollable tabs for mobile */}
          <ScrollArea className="w-full">
            <TabsList className="w-full sm:w-auto flex">
              <TabsTrigger value="cartorio" className="gap-1 sm:gap-2 text-xs sm:text-sm flex-shrink-0">
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Cartório</span>
                <span className="sm:hidden">Dados</span>
              </TabsTrigger>
              <TabsTrigger value="notificacoes" className="gap-1 sm:gap-2 text-xs sm:text-sm flex-shrink-0">
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Notificações</span>
                <span className="sm:hidden">Alertas</span>
              </TabsTrigger>
              <TabsTrigger value="aparencia" className="gap-1 sm:gap-2 text-xs sm:text-sm flex-shrink-0">
                <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Aparência</span>
              </TabsTrigger>
              <TabsTrigger value="integracao" className="gap-1 sm:gap-2 text-xs sm:text-sm flex-shrink-0">
                <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Integrações</span>
                <span className="sm:hidden">APIs</span>
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" className="sm:hidden" />
          </ScrollArea>

          <TabsContent value="cartorio">
            <div className="grid gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    Dados do Cartório
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Informações básicas da serventia
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="text-sm">Nome do Cartório</Label>
                      <Input id="nome" defaultValue="1º Ofício de Notas de São Paulo" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cnpj" className="text-sm">CNPJ</Label>
                      <Input id="cnpj" defaultValue="12.345.678/0001-90" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endereco" className="text-sm">Endereço</Label>
                      <Input id="endereco" defaultValue="Rua das Notícias, 123 - Centro" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cidade" className="text-sm">Cidade/UF</Label>
                      <Input id="cidade" defaultValue="São Paulo - SP" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone" className="text-sm">Telefone</Label>
                      <Input id="telefone" defaultValue="(11) 3333-4444" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">E-mail</Label>
                      <Input id="email" defaultValue="contato@1oficiosp.com.br" />
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-end">
                    <Button className="w-full sm:w-auto">Salvar Alterações</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                    Titular e Substituto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="titular" className="text-sm">Tabelião Titular</Label>
                      <Input id="titular" defaultValue="Dr. José Roberto da Silva" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="substituto" className="text-sm">Tabelião Substituto</Label>
                      <Input id="substituto" defaultValue="Dra. Maria Helena Costa" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notificacoes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  Preferências de Notificação
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Configure como e quando deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5 min-w-0">
                      <Label className="text-sm">Notificações por E-mail</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Receba resumos diários por e-mail
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5 min-w-0">
                      <Label className="text-sm">Alertas de Vencimento</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Notificações sobre repasses próximos do vencimento
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5 min-w-0">
                      <Label className="text-sm">Relatórios Automáticos</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Envio automático de relatórios mensais
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5 min-w-0">
                      <Label className="text-sm">Alertas de Segurança</Label>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Notificações sobre acessos e alterações importantes
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aparencia">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                  Aparência
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Personalize a interface do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Idioma</Label>
                    <Select defaultValue="pt-BR">
                      <SelectTrigger className="w-full sm:w-64">
                        <Globe className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-sm">Formato de Data</Label>
                    <Select defaultValue="dd/mm/yyyy">
                      <SelectTrigger className="w-full sm:w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dd/mm/yyyy">DD/MM/AAAA</SelectItem>
                        <SelectItem value="mm/dd/yyyy">MM/DD/AAAA</SelectItem>
                        <SelectItem value="yyyy-mm-dd">AAAA-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-sm">Moeda</Label>
                    <Select defaultValue="BRL">
                      <SelectTrigger className="w-full sm:w-64">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">Real (R$)</SelectItem>
                        <SelectItem value="USD">Dólar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integracao">
            <div className="grid gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Database className="w-4 h-4 sm:w-5 sm:h-5" />
                    Integrações Disponíveis
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Conecte o sistema com outros serviços
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                        <Database className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base">Tribunal de Justiça</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Integração com sistemas do TJ para repasses automáticos
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full sm:w-auto">Configurar</Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 bg-success/10 rounded-lg flex-shrink-0">
                        <Database className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base">Conciliação Bancária</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Importação automática de extratos bancários
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full sm:w-auto">Configurar</Button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg opacity-60">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                        <Database className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm sm:text-base">Sistema ERP</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Integração com ERPs de mercado (em breve)
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="w-fit">Em breve</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
