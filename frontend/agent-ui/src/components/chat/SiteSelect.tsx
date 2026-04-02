import { SITE_OPTIONS } from "../../config/theme";

type SiteSelectProps = {
  site: string;
  onChange: (value: string) => void;
  label?: string;
  dark?: boolean;
};

export default function SiteSelect({ site, onChange, label = "Site", dark = false }: SiteSelectProps) {
  const labelClass = dark
    ? "text-[var(--color-text-on-dark-subtle)]"
    : "text-[var(--color-text-muted)]";

  const selectClass = dark
    ? "border-none bg-[var(--color-dark-input)] text-[var(--color-text-on-dark)] shadow-[inset_0_0_0_1px_var(--color-border-on-dark-strong)]"
    : "border border-[var(--color-input-border)] bg-[var(--color-surface-strong)] text-[var(--color-text-main)] focus:border-[var(--color-accent)] focus:shadow-[var(--shadow-focus)]";

  return (
    <div>
      <label className={`mb-2 block text-[10px] font-bold uppercase tracking-[0.22em] ${labelClass}`}>
        {label}
      </label>
      <select
        value={site}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-2xl px-3 py-3 text-sm outline-none transition ${selectClass}`}
      >
        {SITE_OPTIONS.map((siteItem) => (
          <option
            key={siteItem}
            value={siteItem}
            className={dark ? "bg-[#002c5f] text-white" : "bg-white text-slate-900"}
          >
            {siteItem}
          </option>
        ))}
      </select>
    </div>
  );
}
