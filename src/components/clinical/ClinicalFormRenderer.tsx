import type {
  ClinicalField,
  ClinicalFieldValue,
  ClinicalFormTemplate,
  ClinicalFormValues,
} from "@/lib/clinicalForms";
import { formatClinicalValue } from "@/lib/clinicalForms";

type ClinicalFormRendererProps = {
  template: ClinicalFormTemplate;
  values: ClinicalFormValues;
  onChange?: (fieldId: string, value: ClinicalFieldValue) => void;
  readOnly?: boolean;
};

export function ClinicalFormRenderer({
  template,
  values,
  onChange,
  readOnly = false,
}: ClinicalFormRendererProps) {
  return (
    <div className="space-y-5">
      {template.sections.map((section) => (
        <section key={section.id} className="rounded-2xl border border-border bg-background p-4">
          <div className="mb-4">
            <h4 className="text-sm font-semibold">{section.title}</h4>
            {section.description && (
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {section.description}
              </p>
            )}
          </div>

          {readOnly ? (
            <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border">
              {section.fields.map((field) => (
                <div
                  key={field.id}
                  className="grid gap-1 px-3 py-2 text-sm md:grid-cols-[minmax(0,1fr)_minmax(180px,0.75fr)] md:items-start"
                >
                  <dt className="text-muted-foreground">{field.label}</dt>
                  <dd className="font-medium text-foreground md:text-right">
                    {formatClinicalValue(values[field.id])}
                    {field.unit && formatClinicalValue(values[field.id]) !== "Não preenchido"
                      ? ` ${field.unit}`
                      : ""}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {section.fields.map((field) => (
                <ClinicalFieldControl
                  key={field.id}
                  field={field}
                  value={values[field.id]}
                  onChange={(value) => onChange?.(field.id, value)}
                />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

function ClinicalFieldControl({
  field,
  value,
  onChange,
}: {
  field: ClinicalField;
  value: ClinicalFieldValue | undefined;
  onChange: (value: ClinicalFieldValue) => void;
}) {
  const stringValue = Array.isArray(value) ? "" : (value ?? "");
  const isFull = field.span === "full" || field.type === "textarea" || field.type === "checkbox";

  return (
    <div className={`block text-sm font-medium ${isFull ? "md:col-span-2" : ""}`}>
      <span className="flex items-center justify-between gap-2">
        <span>{field.label}</span>
        {field.unit && (
          <span className="text-xs font-normal text-muted-foreground">{field.unit}</span>
        )}
      </span>

      {field.type === "textarea" && (
        <textarea
          value={stringValue}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className="mt-2 min-h-28 w-full resize-none rounded-xl border border-border bg-card p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )}

      {(field.type === "text" || field.type === "date" || field.type === "number") && (
        <input
          value={stringValue}
          type={field.type === "number" ? "number" : field.type}
          inputMode={field.type === "number" ? "decimal" : undefined}
          step={field.type === "number" ? "any" : undefined}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          className="mt-2 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )}

      {field.type === "readonly" && (
        <input
          value={stringValue}
          readOnly
          className="mt-2 h-11 w-full rounded-xl border border-border bg-secondary/60 px-3 text-sm font-semibold text-muted-foreground"
        />
      )}

      {field.type === "select" && (
        <select
          value={stringValue}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Selecionar</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {field.type === "radio" && (
        <div className="mt-2 flex flex-wrap gap-2">
          {field.options?.map((option) => (
            <label
              key={option.value}
              className={`inline-flex min-h-9 cursor-pointer items-center rounded-full border px-3 py-1 text-xs font-medium transition ${
                stringValue === option.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-accent"
              }`}
            >
              <input
                type="radio"
                checked={stringValue === option.value}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      )}

      {field.type === "checkbox" && (
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {field.options?.map((option) => {
            const selectedValues = Array.isArray(value) ? value : [];
            const selected = selectedValues.includes(option.value);
            return (
              <label
                key={option.value}
                className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                  selected ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    onChange(
                      selected
                        ? selectedValues.filter((item) => item !== option.value)
                        : [...selectedValues, option.value],
                    )
                  }
                  className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      )}

      {field.helper && (
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{field.helper}</p>
      )}
    </div>
  );
}
