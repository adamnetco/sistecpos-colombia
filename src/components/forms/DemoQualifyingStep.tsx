import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  SALES_PER_DAY, EMPLOYEES, TIME_TO_SYSTEMATIZE, BUSINESS_AGE_PERIOD,
} from "@/data/demoQualifyingOptions";

export interface QualifyingValues {
  qual_has_software: boolean | null;
  qual_knows_inventory: boolean | null;
  qual_main_pain: string;
  qual_ideal_pos: string;
  qual_sales_per_day: string;
  qual_employees: string;
  qual_time_to_systematize: string;
  qual_business_age_value: string; // string para input controlado
  qual_business_age_period: string;
}

export const emptyQualifying: QualifyingValues = {
  qual_has_software: null,
  qual_knows_inventory: null,
  qual_main_pain: "",
  qual_ideal_pos: "",
  qual_sales_per_day: "",
  qual_employees: "",
  qual_time_to_systematize: "",
  qual_business_age_value: "",
  qual_business_age_period: "Meses",
};

interface Props {
  values: QualifyingValues;
  onChange: (v: QualifyingValues) => void;
}

export default function DemoQualifyingStep({ values, onChange }: Props) {
  const set = <K extends keyof QualifyingValues>(k: K, v: QualifyingValues[K]) =>
    onChange({ ...values, [k]: v });

  const YN = ({ field }: { field: "qual_has_software" | "qual_knows_inventory" }) => (
    <div className="flex gap-2">
      {[
        { v: true, label: "Sí" },
        { v: false, label: "No" },
      ].map(opt => (
        <button
          key={opt.label}
          type="button"
          onClick={() => set(field, opt.v)}
          className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition ${
            values[field] === opt.v
              ? "border-primary bg-primary/10 text-primary"
              : "border-input hover:bg-muted"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-xs text-primary">
        Estas preguntas nos ayudan a asesorarte mejor. Toma 30 segundos.
      </div>

      <div className="space-y-2">
        <Label className="text-sm">a) ¿Actualmente maneja algún software? *</Label>
        <YN field="qual_has_software" />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">b) ¿Sabe cómo están sus inventarios, ganancias, pérdidas, rotación de productos? *</Label>
        <YN field="qual_knows_inventory" />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">c) ¿Cuál cree que es el mayor inconveniente que tiene por no haber sistematizado? *</Label>
        <Textarea
          rows={3}
          placeholder="Déjanos tu necesidad"
          value={values.qual_main_pain}
          onChange={e => set("qual_main_pain", e.target.value)}
          maxLength={500}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">d) ¿Qué debería tener su software POS ideal? *</Label>
        <Textarea
          rows={3}
          placeholder="Funciones, módulos, integraciones..."
          value={values.qual_ideal_pos}
          onChange={e => set("qual_ideal_pos", e.target.value)}
          maxLength={500}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">e) ¿Cuántas ventas promedio hace por día (en cantidad)? *</Label>
        <Select value={values.qual_sales_per_day} onValueChange={v => set("qual_sales_per_day", v)}>
          <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
          <SelectContent>
            {SALES_PER_DAY.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">f) ¿Cuántos empleados tiene? *</Label>
        <Select value={values.qual_employees} onValueChange={v => set("qual_employees", v)}>
          <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
          <SelectContent>
            {EMPLOYEES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">g) ¿En cuánto tiempo quiere sistematizar? *</Label>
        <Select value={values.qual_time_to_systematize} onValueChange={v => set("qual_time_to_systematize", v)}>
          <SelectTrigger><SelectValue placeholder="Seleccione" /></SelectTrigger>
          <SelectContent>
            {TIME_TO_SYSTEMATIZE.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">h) ¿Hace cuánto tiempo tiene el negocio? *</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Ej: 6"
            value={values.qual_business_age_value}
            onChange={e => set("qual_business_age_value", e.target.value)}
            onFocus={e => e.currentTarget.select()}
          />
          <Select value={values.qual_business_age_period} onValueChange={v => set("qual_business_age_period", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {BUSINESS_AGE_PERIOD.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export function isQualifyingComplete(v: QualifyingValues): string | null {
  if (v.qual_has_software === null) return "Responde la pregunta (a)";
  if (v.qual_knows_inventory === null) return "Responde la pregunta (b)";
  if (!v.qual_main_pain.trim()) return "Cuéntanos tu mayor inconveniente (c)";
  if (!v.qual_ideal_pos.trim()) return "Cuéntanos qué debe tener tu POS ideal (d)";
  if (!v.qual_sales_per_day) return "Selecciona ventas por día (e)";
  if (!v.qual_employees) return "Selecciona empleados (f)";
  if (!v.qual_time_to_systematize) return "Selecciona tiempo para sistematizar (g)";
  if (!v.qual_business_age_value || Number(v.qual_business_age_value) <= 0) return "Indica antigüedad del negocio (h)";
  return null;
}
