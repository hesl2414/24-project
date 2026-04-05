import { SITE_OPTIONS } from "../../config/theme";

type SiteSelectProps = {
  site: string;
  onChange: (value: string) => void;
  label?: string;
};

export default function SiteSelect({ site, onChange, label = "Site" }: SiteSelectProps) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </label>
      <select
        value={site}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none transition focus:border-[var(--color-primary)]"
      >
        {SITE_OPTIONS.map((siteItem) => (
          <option key={siteItem}>{siteItem}</option>
        ))}
      </select>
    </div>
  );
}
