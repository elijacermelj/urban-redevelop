import { PROGRAM_LIST } from "@/lib/programs";
import type { FilterState } from "@/lib/useScoredLocations";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  Briefcase,
  SlidersHorizontal,
  Landmark,
  List,
  Map,
  MapPin,
  PanelLeft,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PROGRAM_ICONS = {
  housing: Building2,
  public_services: Landmark,
  small_business: Briefcase,
  infrastructure: Wrench,
} as const satisfies Record<FilterState["program"], LucideIcon>;

const LAYER_OPTIONS = [
  { key: "settlements", label: "Naselja", dotColor: "oklch(0.78 0.06 220)" },
  { key: "opportunity_heat", label: "Opportunity heatmap", dotColor: "oklch(0.7 0.16 155)" },
  { key: "transport", label: "Javni prevoz", dotColor: "oklch(0.85 0.14 80)" },
  { key: "flood", label: "Poplavna območja", dotColor: "oklch(0.65 0.22 25)" },
  {
    key: "brownfield",
    label: "Brownfield / razvrednoteno",
    dotColor: "oklch(0.78 0.16 165)",
  },
  { key: "gji", label: "GJI", dotColor: "oklch(0.7 0.05 240)" },
] as const satisfies readonly {
  key: keyof FilterState["layers"];
  label: string;
  dotColor: string;
}[];

interface SidebarFiltersProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onCityChange: (city: FilterState["city"]) => void;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  cityOptions: readonly { id: FilterState["city"]; name: string }[];
  districtOptions: readonly string[];
  cityName: string;
  totalCount: number;
  excludedCount: number;
}

interface SharedFilterControlsProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onCityChange: (city: FilterState["city"]) => void;
  cityOptions: readonly { id: FilterState["city"]; name: string }[];
  districtOptions: readonly string[];
}

interface MobileFilterBarProps extends SharedFilterControlsProps {
  onOpenRecommendations: () => void;
}

export function SidebarFilters({
  filters,
  onChange,
  onCityChange,
  isCollapsed,
  onToggleCollapsed,
  cityOptions,
  districtOptions,
  cityName,
  totalCount,
  excludedCount,
}: SidebarFiltersProps) {
  const SelectedProgramIcon = PROGRAM_ICONS[filters.program];

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-border bg-surface/80 backdrop-blur-md transition-[width] duration-200 ease-out",
        isCollapsed ? "w-[72px]" : "w-[300px]",
      )}
    >
      {isCollapsed ? (
        <CollapsedSidebar
          filters={filters}
          onChange={onChange}
          onCityChange={onCityChange}
          onToggleCollapsed={onToggleCollapsed}
          cityOptions={cityOptions}
          districtOptions={districtOptions}
          SelectedProgramIcon={SelectedProgramIcon}
        />
      ) : (
        <>
          <div className="relative border-b border-border px-5 py-4">
            <button
              type="button"
              onClick={onToggleCollapsed}
              title="Skrij stranska panela"
              aria-label="Skrij stranska panela"
              className="absolute right-4 top-4 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
            >
              <PanelLeft className="size-4" />
            </button>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Občina / mesto
            </div>
            <div className="mt-1 pr-10 font-display text-lg font-semibold">{cityName}</div>
            <div className="mt-3 flex items-center gap-2 font-mono text-xs">
              <span className="rounded border border-border bg-surface-elevated px-2 py-0.5 tabular-nums">
                {totalCount} kandidatov
              </span>
              {excludedCount > 0 && (
                <span className="rounded border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-destructive tabular-nums">
                  {excludedCount} izločenih
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
            <Section title="Občina / City">
              <CitySelect filters={filters} onCityChange={onCityChange} cityOptions={cityOptions} />
            </Section>

            <Section title="Tip programa">
              <ProgramSelect
                filters={filters}
                onChange={onChange}
                SelectedProgramIcon={SelectedProgramIcon}
              />
            </Section>

            <Section title="Območje">
              <DistrictSelect
                filters={filters}
                onChange={onChange}
                districtOptions={districtOptions}
              />
            </Section>

            <Section title="Trdi filtri">
              <HardFilters filters={filters} onChange={onChange} />
            </Section>

            <Section title="Sloji na zemljevidu">
              <MapLayerToggles filters={filters} onChange={onChange} />
            </Section>
          </div>
        </>
      )}
    </aside>
  );
}

function CollapsedSidebar({
  filters,
  onChange,
  onCityChange,
  onToggleCollapsed,
  cityOptions,
  districtOptions,
  SelectedProgramIcon,
}: {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onCityChange: (city: FilterState["city"]) => void;
  onToggleCollapsed: () => void;
  cityOptions: readonly { id: FilterState["city"]; name: string }[];
  districtOptions: readonly string[];
  SelectedProgramIcon: LucideIcon;
}) {
  return (
    <TooltipProvider delayDuration={150} skipDelayDuration={100}>
      <div className="flex justify-center py-3">
        <CollapsedSidebarTooltip label="Prikaži stranski vrstici">
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label="Prikaži stranska panela"
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
          >
            <PanelLeft className="size-4" />
          </button>
        </CollapsedSidebarTooltip>
      </div>

      <div className="flex flex-1 flex-col items-center gap-3 py-4">
        <FilterPopoverButton icon={MapPin} label="Občina / City" showTooltip>
          <PopoverSection title="Občina / City">
            <CitySelect filters={filters} onCityChange={onCityChange} cityOptions={cityOptions} />
          </PopoverSection>
        </FilterPopoverButton>

        <FilterPopoverButton icon={SelectedProgramIcon} label="Tip programa" showTooltip>
          <PopoverSection title="Tip programa">
            <ProgramSelect
              filters={filters}
              onChange={onChange}
              SelectedProgramIcon={SelectedProgramIcon}
            />
          </PopoverSection>
        </FilterPopoverButton>

        <FilterPopoverButton icon={Map} label="Območje" showTooltip>
          <PopoverSection title="Območje">
            <DistrictSelect
              filters={filters}
              onChange={onChange}
              districtOptions={districtOptions}
            />
          </PopoverSection>
        </FilterPopoverButton>

        <FilterPopoverButton icon={SlidersHorizontal} label="Filtri" showTooltip>
          <div className="space-y-4">
            <PopoverSection title="Trdi filtri">
              <HardFilters filters={filters} onChange={onChange} />
            </PopoverSection>
            <PopoverSection title="Sloji na zemljevidu">
              <MapLayerToggles filters={filters} onChange={onChange} />
            </PopoverSection>
          </div>
        </FilterPopoverButton>
      </div>
    </TooltipProvider>
  );
}

export function MobileFilterBar({
  filters,
  onChange,
  onCityChange,
  cityOptions,
  districtOptions,
  onOpenRecommendations,
}: MobileFilterBarProps) {
  const SelectedProgramIcon = PROGRAM_ICONS[filters.program];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md">
      <div className="grid h-16 grid-cols-5 items-center gap-0.5 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <FilterPopoverButton
          icon={MapPin}
          label="Občina / City"
          side="top"
          align="center"
          sideOffset={12}
          buttonClassName="mx-auto h-11 w-11"
          popoverClassName="w-[min(92vw,420px)] max-h-[min(65vh,560px)] overflow-y-auto border-border bg-surface-elevated p-4"
        >
          <PopoverSection title="Občina / City">
            <CitySelect filters={filters} onCityChange={onCityChange} cityOptions={cityOptions} />
          </PopoverSection>
        </FilterPopoverButton>

        <FilterPopoverButton
          icon={SelectedProgramIcon}
          label="Tip programa"
          side="top"
          align="center"
          sideOffset={12}
          buttonClassName="mx-auto h-11 w-11"
          popoverClassName="w-[min(92vw,420px)] max-h-[min(65vh,560px)] overflow-y-auto border-border bg-surface-elevated p-4"
        >
          <PopoverSection title="Tip programa">
            <ProgramSelect
              filters={filters}
              onChange={onChange}
              SelectedProgramIcon={SelectedProgramIcon}
            />
          </PopoverSection>
        </FilterPopoverButton>

        <FilterPopoverButton
          icon={Map}
          label="Območje"
          side="top"
          align="center"
          sideOffset={12}
          buttonClassName="mx-auto h-11 w-11"
          popoverClassName="w-[min(92vw,420px)] max-h-[min(65vh,560px)] overflow-y-auto border-border bg-surface-elevated p-4"
        >
          <PopoverSection title="Območje">
            <DistrictSelect
              filters={filters}
              onChange={onChange}
              districtOptions={districtOptions}
            />
          </PopoverSection>
        </FilterPopoverButton>

        <FilterPopoverButton
          icon={SlidersHorizontal}
          label="Trdi filtri"
          side="top"
          align="center"
          sideOffset={12}
          buttonClassName="mx-auto h-11 w-11"
          popoverClassName="w-[min(92vw,420px)] max-h-[min(65vh,560px)] overflow-y-auto border-border bg-surface-elevated p-4"
        >
          <div className="space-y-4">
            <PopoverSection title="Trdi filtri">
              <HardFilters filters={filters} onChange={onChange} />
            </PopoverSection>
            <PopoverSection title="Sloji na zemljevidu">
              <MapLayerToggles filters={filters} onChange={onChange} />
            </PopoverSection>
          </div>
        </FilterPopoverButton>

        <button
          type="button"
          onClick={onOpenRecommendations}
          title="Priporočila"
          aria-label="Priporočila"
          className="mx-auto inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
        >
          <List className="size-5" />
        </button>
      </div>
    </div>
  );
}

function FilterPopoverButton({
  icon: Icon,
  label,
  children,
  side = "right",
  align = "start",
  sideOffset = 10,
  buttonClassName,
  popoverClassName,
  showTooltip = false,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  side?: React.ComponentProps<typeof PopoverContent>["side"];
  align?: React.ComponentProps<typeof PopoverContent>["align"];
  sideOffset?: number;
  buttonClassName?: string;
  popoverClassName?: string;
  showTooltip?: boolean;
}) {
  const button = (
    <button
      type="button"
      title={showTooltip ? undefined : label}
      aria-label={label}
      className={cn(
        "inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground data-[state=open]:bg-[#E4F7EE] data-[state=open]:text-[#00A86B] data-[state=open]:hover:bg-[#E4F7EE] data-[state=open]:hover:text-[#00A86B]",
        buttonClassName,
      )}
    >
      <Icon className="size-5" />
    </button>
  );

  return (
    <Popover>
      {showTooltip ? (
        <CollapsedSidebarTooltip label={label}>
          <PopoverTrigger asChild>{button}</PopoverTrigger>
        </CollapsedSidebarTooltip>
      ) : (
        <PopoverTrigger asChild>{button}</PopoverTrigger>
      )}
      <PopoverContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={cn("w-[320px] border-border bg-surface-elevated p-4", popoverClassName)}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}

function CollapsedSidebarTooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        sideOffset={12}
        className="border border-border bg-surface-elevated px-2.5 py-1.5 font-medium text-foreground shadow-[var(--shadow-panel)]"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function PopoverSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}

function CitySelect({
  filters,
  onCityChange,
  cityOptions,
}: {
  filters: FilterState;
  onCityChange: (city: FilterState["city"]) => void;
  cityOptions: readonly { id: FilterState["city"]; name: string }[];
}) {
  return (
    <SelectField
      icon={MapPin}
      value={filters.city}
      onChange={(value) => onCityChange(value as FilterState["city"])}
      options={cityOptions}
    />
  );
}

function ProgramSelect({
  filters,
  onChange,
  SelectedProgramIcon,
}: {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  SelectedProgramIcon: LucideIcon;
}) {
  return (
    <SelectField
      icon={SelectedProgramIcon}
      value={filters.program}
      onChange={(value) => onChange({ ...filters, program: value as FilterState["program"] })}
      options={PROGRAM_LIST.map((program) => ({
        id: program.id,
        name: program.label,
        optionIcon: PROGRAM_ICONS[program.id],
      }))}
    />
  );
}

function DistrictSelect({
  filters,
  onChange,
  districtOptions,
}: {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  districtOptions: readonly string[];
}) {
  return (
    <SelectField
      icon={Map}
      value={filters.district}
      onChange={(value) => onChange({ ...filters, district: value })}
      options={districtOptions.map((district) => ({ id: district, name: district }))}
    />
  );
}

function SelectField({
  icon: Icon,
  value,
  onChange,
  options,
}: {
  icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  options: readonly { id: string; name: string; optionIcon?: LucideIcon }[];
}) {
  const selectedLabel =
    options.find((option) => option.id === value)?.name ?? options[0]?.name ?? "";

  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="relative h-10 rounded-lg border-border bg-surface-elevated pl-9 pr-9 font-medium text-foreground shadow-none [&>svg]:absolute [&>svg]:right-3 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 [&>svg]:opacity-70">
          <SelectValue>{selectedLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent align="start" className="border-border bg-surface-elevated">
          {options.map((option) => {
            const OptionIcon = option.optionIcon;
            return (
              <SelectItem key={option.id} value={option.id}>
                <span className="inline-flex items-center gap-2">
                  {OptionIcon && <OptionIcon className="size-3.5 text-muted-foreground" />}
                  <span>{option.name}</span>
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

function HardFilters({
  filters,
  onChange,
}: {
  filters: FilterState;
  onChange: (next: FilterState) => void;
}) {
  return (
    <Toggle
      label="Izključi visoko poplavno tveganje"
      checked={filters.excludeFlood}
      onChange={(value) => onChange({ ...filters, excludeFlood: value })}
    />
  );
}

function MapLayerToggles({
  filters,
  onChange,
}: {
  filters: FilterState;
  onChange: (next: FilterState) => void;
}) {
  return (
    <div className="space-y-1.5">
      {LAYER_OPTIONS.map((layer) => (
        <Toggle
          key={layer.key}
          label={layer.label}
          dotColor={layer.dotColor}
          checked={filters.layers[layer.key]}
          onChange={(value) =>
            onChange({ ...filters, layers: { ...filters.layers, [layer.key]: value } })
          }
        />
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  dotColor,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  dotColor?: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full cursor-pointer items-center justify-between rounded-md border border-border bg-surface-elevated px-3 py-2 text-left text-xs font-medium transition-colors hover:border-border/80",
        checked ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <span className="flex items-center gap-2">
        {dotColor && (
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: dotColor, opacity: checked ? 1 : 0.3 }}
          />
        )}
        {label}
      </span>
      <span
        className={cn(
          "relative inline-flex h-4 w-7 items-center rounded-full transition-colors",
          checked ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "absolute size-3 rounded-full bg-background transition-transform",
            checked ? "translate-x-3.5" : "translate-x-0.5",
          )}
        />
      </span>
    </button>
  );
}
