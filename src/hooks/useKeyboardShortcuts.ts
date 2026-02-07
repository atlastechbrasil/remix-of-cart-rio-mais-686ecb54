import { useEffect, useCallback } from "react";

interface KeyboardShortcutsConfig {
  onFocusSearch?: () => void;
  onVincular?: () => void;
  onClearSelection?: () => void;
  onNextDay?: () => void;
  onPrevDay?: () => void;
  onOpenSugestoes?: () => void;
  onOpenAutoMatch?: () => void;
  isVincularEnabled?: boolean;
  isSugestoesEnabled?: boolean;
  isAutoEnabled?: boolean;
}

export function useKeyboardShortcuts({
  onFocusSearch,
  onVincular,
  onClearSelection,
  onNextDay,
  onPrevDay,
  onOpenSugestoes,
  onOpenAutoMatch,
  isVincularEnabled = false,
  isSugestoesEnabled = false,
  isAutoEnabled = false,
}: KeyboardShortcutsConfig) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Ctrl+F or Cmd+F - Focus search (works even in input)
      if ((event.ctrlKey || event.metaKey) && event.key === "f") {
        event.preventDefault();
        onFocusSearch?.();
        return;
      }

      // Don't process other shortcuts if in input field
      if (isInputField) return;

      // Enter - Vincular selecionados
      if (event.key === "Enter" && !event.ctrlKey && !event.metaKey) {
        if (isVincularEnabled) {
          event.preventDefault();
          onVincular?.();
        }
        return;
      }

      // Escape - Clear selection
      if (event.key === "Escape") {
        event.preventDefault();
        onClearSelection?.();
        return;
      }

      // Arrow Left - Previous day
      if (event.key === "ArrowLeft" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        onPrevDay?.();
        return;
      }

      // Arrow Right - Next day
      if (event.key === "ArrowRight" && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        onNextDay?.();
        return;
      }

      // S - Open Sugestões (when item selected)
      if (event.key === "s" && !event.ctrlKey && !event.metaKey) {
        if (isSugestoesEnabled) {
          event.preventDefault();
          onOpenSugestoes?.();
        }
        return;
      }

      // A - Open Auto-match
      if (event.key === "a" && !event.ctrlKey && !event.metaKey) {
        if (isAutoEnabled) {
          event.preventDefault();
          onOpenAutoMatch?.();
        }
        return;
      }
    },
    [
      onFocusSearch,
      onVincular,
      onClearSelection,
      onNextDay,
      onPrevDay,
      onOpenSugestoes,
      onOpenAutoMatch,
      isVincularEnabled,
      isSugestoesEnabled,
      isAutoEnabled,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}
