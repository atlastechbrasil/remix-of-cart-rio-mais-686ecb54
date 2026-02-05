import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Building2, CreditCard, FileSpreadsheet, Loader2 } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useGlobalSearch, SearchResultType } from "@/hooks/useGlobalSearch";
import { useDebounce } from "@/hooks/useDebounce";

const typeConfig: Record<SearchResultType, { icon: React.ElementType; label: string }> = {
  lancamento: { icon: FileText, label: "Lançamentos" },
  conta_bancaria: { icon: CreditCard, label: "Contas Bancárias" },
  extrato: { icon: FileSpreadsheet, label: "Extratos" },
  cartorio: { icon: Building2, label: "Cartórios" },
  usuario: { icon: Building2, label: "Usuários" },
};

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { results, isSearching, search, clearResults } = useGlobalSearch();
  const navigate = useNavigate();

  // Keyboard shortcut
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search when query changes
  React.useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery);
    } else {
      clearResults();
    }
  }, [debouncedQuery, search, clearResults]);

  // Clear on close
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setQuery("");
      clearResults();
    }
  };

  // Handle selection
  const handleSelect = (route: string) => {
    setOpen(false);
    setQuery("");
    clearResults();
    navigate(route);
  };

  // Group results by type
  const groupedResults = React.useMemo(() => {
    const groups: Record<SearchResultType, typeof results> = {
      lancamento: [],
      conta_bancaria: [],
      extrato: [],
      cartorio: [],
      usuario: [],
    };

    results.forEach(result => {
      groups[result.type].push(result);
    });

    return groups;
  }, [results]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden lg:flex gap-2 w-48 xl:w-64 justify-start text-muted-foreground bg-muted/50 border-0 hover:bg-muted"
        onClick={() => setOpen(true)}
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Buscar...</span>
        <kbd className="pointer-events-none hidden xl:inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <CommandInput
          placeholder="Buscar lançamentos, contas, extratos..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isSearching && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {!isSearching && query.length >= 2 && results.length === 0 && (
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          )}
          
          {!isSearching && query.length < 2 && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Digite ao menos 2 caracteres para buscar...
            </div>
          )}

          {!isSearching && (Object.keys(groupedResults) as SearchResultType[]).map((type) => {
            const items = groupedResults[type];
            if (items.length === 0) return null;
            
            const config = typeConfig[type];
            const Icon = config.icon;

            return (
              <CommandGroup key={type} heading={config.label}>
                {items.map(result => (
                  <CommandItem
                    key={result.id}
                    value={`${result.type}-${result.id}`}
                    onSelect={() => handleSelect(result.route)}
                    className="cursor-pointer"
                  >
                    <Icon className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="truncate font-medium">{result.title}</span>
                      {result.subtitle && (
                        <span className="text-xs text-muted-foreground truncate">
                          {result.subtitle}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
