import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Braces, User, MessageSquare, Database, Monitor, Search, GripVertical } from "lucide-react";
import type { FlowTree } from "@/lib/flow-engine/types";
import { getAvailableVariables, type AvailableVariable } from "@/lib/flow-engine/utils";

// ─── types ───
interface SmartVariableInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  flowTree: FlowTree;
  currentStepId?: string;
  multiline?: boolean;
}

const CATEGORY_META: Record<AvailableVariable["category"], { label: string; icon: React.ReactNode; color: string }> = {
  user: { label: "Användardata", icon: <User className="h-3 w-3" />, color: "bg-primary/15 text-primary border-primary/25" },
  answers: { label: "Svar", icon: <MessageSquare className="h-3 w-3" />, color: "bg-accent/15 text-accent border-accent/25" },
  lookups: { label: "Uppslagna", icon: <Database className="h-3 w-3" />, color: "bg-warning/15 text-warning border-warning/25" },
  derived: { label: "Beräknade", icon: <Database className="h-3 w-3" />, color: "bg-info/15 text-info border-info/25" },
  cmdb: { label: "CMDB", icon: <Monitor className="h-3 w-3" />, color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/25" },
};

// ─── Variable tag rendering ───
function VariableTag({ variable, onRemove }: { variable: AvailableVariable; onRemove?: () => void }) {
  const meta = CATEGORY_META[variable.category];
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border text-[11px] font-medium cursor-default select-none ${meta.color}`}
      title={`{{${variable.path}}}`}
    >
      {meta.icon}
      <span className="max-w-[120px] truncate">{variable.label}</span>
      {onRemove && (
        <button
          onClick={e => { e.stopPropagation(); onRemove(); }}
          className="ml-0.5 hover:opacity-100 opacity-60 text-current"
        >
          ×
        </button>
      )}
    </span>
  );
}

// ─── Parse text into segments (text + variable refs) ───
interface Segment {
  type: "text" | "variable";
  value: string; // for text: the raw text, for variable: the path (without {{ }})
}

function parseSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  const regex = /\{\{([\w.]+)\}\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: "variable", value: match[1] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }
  return segments;
}

// ─── Autocomplete dropdown ───
function AutocompleteDropdown({
  variables,
  searchTerm,
  onSelect,
  position,
}: {
  variables: AvailableVariable[];
  searchTerm: string;
  onSelect: (v: AvailableVariable) => void;
  position: { top: number; left: number };
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const filtered = useMemo(() => {
    if (!searchTerm) return variables;
    const lower = searchTerm.toLowerCase();
    return variables.filter(
      v => v.label.toLowerCase().includes(lower) || v.path.toLowerCase().includes(lower)
    );
  }, [variables, searchTerm]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, AvailableVariable[]>>((acc, v) => {
      (acc[v.category] ??= []).push(v);
      return acc;
    }, {});
  }, [filtered]);

  // Flatten for keyboard nav
  const flatList = useMemo(() => Object.values(grouped).flat(), [grouped]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, flatList.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === "Enter" || e.key === "Tab") {
        if (flatList[selectedIndex]) {
          e.preventDefault();
          onSelect(flatList[selectedIndex]);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [flatList, selectedIndex, onSelect]);

  if (flatList.length === 0) {
    return (
      <div
        className="absolute z-50 w-64 bg-popover border rounded-lg shadow-lg p-3 text-xs text-muted-foreground"
        style={{ top: position.top, left: position.left }}
      >
        Inga matchande variabler
      </div>
    );
  }

  let flatIdx = 0;

  return (
    <div
      className="absolute z-50 w-72 bg-popover border rounded-lg shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100"
      style={{ top: position.top, left: position.left }}
    >
      <div className="px-2.5 py-1.5 border-b bg-muted/30 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Braces className="h-3 w-3" />
        Infoga variabel
        {searchTerm && <span className="ml-auto font-mono">"{searchTerm}"</span>}
      </div>
      <ScrollArea className="max-h-52">
        <div className="p-1">
          {Object.entries(grouped).map(([cat, vars]) => {
            const meta = CATEGORY_META[cat as AvailableVariable["category"]];
            return (
              <div key={cat} className="mb-1">
                <div className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {meta.icon} {meta.label}
                </div>
                {vars.map(v => {
                  const thisIdx = flatIdx++;
                  const isSelected = thisIdx === selectedIndex;
                  return (
                    <button
                      key={v.path}
                      className={`w-full text-left px-2 py-1.5 text-xs rounded flex items-center justify-between transition-colors ${
                        isSelected ? "bg-primary/10 text-foreground" : "hover:bg-muted/50"
                      }`}
                      onMouseDown={e => {
                        e.preventDefault();
                        onSelect(v);
                      }}
                      onMouseEnter={() => setSelectedIndex(thisIdx)}
                    >
                      <span className="truncate">{v.label}</span>
                      <code className="text-[10px] text-muted-foreground font-mono ml-2 shrink-0">
                        {v.path}
                      </code>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="px-2.5 py-1 border-t bg-muted/20 text-[10px] text-muted-foreground flex gap-2">
        <span>↑↓ navigera</span>
        <span>↵ infoga</span>
        <span>Esc stäng</span>
      </div>
    </div>
  );
}

// ─── Rich preview (shows tags inline) ───
function RichPreview({ text, variables }: { text: string; variables: AvailableVariable[] }) {
  const varMap = useMemo(() => {
    const map = new Map<string, AvailableVariable>();
    variables.forEach(v => map.set(v.path, v));
    return map;
  }, [variables]);

  const segments = parseSegments(text);
  if (segments.length === 0 || (segments.length === 1 && segments[0].type === "text" && !segments[0].value)) {
    return null;
  }

  const hasVars = segments.some(s => s.type === "variable");
  if (!hasVars) return null;

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-1 py-1 min-h-[24px]">
      {segments.map((seg, i) => {
        if (seg.type === "text") {
          return <span key={i} className="text-xs text-muted-foreground whitespace-pre-wrap">{seg.value}</span>;
        }
        const variable = varMap.get(seg.value);
        if (variable) {
          return <VariableTag key={i} variable={variable} />;
        }
        return (
          <span key={i} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-[11px] font-mono">
            {`{{${seg.value}}}`}
          </span>
        );
      })}
    </div>
  );
}

// ─── Main component ───
export default function SmartVariableInput({
  value,
  onChange,
  placeholder,
  flowTree,
  currentStepId,
  multiline,
}: SmartVariableInputProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autocomplete, setAutocomplete] = useState<{ active: boolean; search: string; startPos: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const variables = useMemo(() => getAvailableVariables(flowTree, currentStepId), [flowTree, currentStepId]);

  // Detect {{ trigger
  const handleInput = useCallback((newValue: string) => {
    onChange(newValue);

    const el = inputRef.current;
    if (!el) return;
    const cursorPos = el.selectionStart ?? newValue.length;

    // Check if the text before cursor ends with {{ (possibly with some search text)
    const textBefore = newValue.slice(0, cursorPos);
    const triggerMatch = textBefore.match(/\{\{(\w*)$/);

    if (triggerMatch) {
      setAutocomplete({
        active: true,
        search: triggerMatch[1],
        startPos: triggerMatch.index!,
      });
    } else {
      setAutocomplete(null);
    }
  }, [onChange]);

  const handleSelectVariable = useCallback((v: AvailableVariable) => {
    if (!autocomplete) return;
    const before = value.slice(0, autocomplete.startPos);
    const after = value.slice((inputRef.current?.selectionStart ?? value.length));
    const inserted = `{{${v.path}}}`;
    const newValue = before + inserted + after;
    onChange(newValue);
    setAutocomplete(null);

    setTimeout(() => {
      const el = inputRef.current;
      if (el) {
        const pos = before.length + inserted.length;
        el.selectionStart = el.selectionEnd = pos;
        el.focus();
      }
    }, 0);
  }, [autocomplete, value, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape" && autocomplete) {
      setAutocomplete(null);
      e.preventDefault();
    }
  }, [autocomplete]);

  // Drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    const data = e.dataTransfer.types.includes("text/variable-path");
    if (data) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const path = e.dataTransfer.getData("text/variable-path");
    if (!path) return;

    const el = inputRef.current;
    const template = `{{${path}}}`;

    if (el) {
      // Try to insert at drop position (approximate via cursor)
      const start = el.selectionStart ?? value.length;
      const newValue = value.slice(0, start) + template + value.slice(start);
      onChange(newValue);
      setTimeout(() => {
        el.selectionStart = el.selectionEnd = start + template.length;
        el.focus();
      }, 0);
    } else {
      onChange(value + template);
    }
  }, [value, onChange]);

  // Close autocomplete on blur (with delay for click)
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setTimeout(() => setAutocomplete(null), 200);
  }, []);

  const hasVariables = value.includes("{{");

  // Approximate dropdown position
  const dropdownPos = { top: multiline ? 68 : 40, left: 0 };

  return (
    <div
      ref={containerRef}
      className="space-y-1 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`relative transition-all duration-150 ${isDragOver ? "ring-2 ring-primary/50 ring-offset-1 rounded-md" : ""}`}>
        {multiline ? (
          <textarea
            ref={inputRef as any}
            value={value}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            placeholder={placeholder}
            rows={2}
            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        ) : (
          <input
            ref={inputRef as any}
            value={value}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        )}

        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-primary/5 rounded-md pointer-events-none">
            <span className="text-xs text-primary font-medium flex items-center gap-1">
              <Braces className="h-3.5 w-3.5" /> Släpp variabel här
            </span>
          </div>
        )}
      </div>

      {/* Rich preview with tags */}
      {hasVariables && (
        <div className="border border-dashed rounded-md bg-muted/20 px-2 py-0.5">
          <RichPreview text={value} variables={variables} />
        </div>
      )}

      {/* Autocomplete dropdown */}
      {autocomplete?.active && (
        <AutocompleteDropdown
          variables={variables}
          searchTerm={autocomplete.search}
          onSelect={handleSelectVariable}
          position={dropdownPos}
        />
      )}

      {/* Hint line */}
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-0.5">
          <Braces className="h-2.5 w-2.5" /> Skriv {"{{" } för variabler
        </span>
        {hasVariables && (
          <Badge variant="outline" className="text-[10px] h-4 px-1">
            Dynamisk text
          </Badge>
        )}
      </div>
    </div>
  );
}

export { SmartVariableInput, VariableTag, CATEGORY_META };
