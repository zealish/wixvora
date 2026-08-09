"use client";

import { useEditor } from "../editor-provider";
import { Icon } from "../ui/icon-library";

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "textarea" | "select";
  options?: { label: string; value: string }[];
  placeholder?: string;
}

function Field({ label, value, onChange, type = "text", options, placeholder }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />
      ) : type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        >
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        />
      )}
    </div>
  );
}

function HeadingFields({ props, update }: { props: any; update: (p: any) => void }) {
  return (
    <>
      <Field
        label="Level"
        value={props.level || "h1"}
        onChange={(v) => update({ level: v })}
        type="select"
        options={[
          { label: "H1", value: "h1" },
          { label: "H2", value: "h2" },
          { label: "H3", value: "h3" },
          { label: "H4", value: "h4" },
        ]}
      />
      <Field
        label="Teks"
        value={props.text || ""}
        onChange={(v) => update({ text: v })}
        type="textarea"
      />
    </>
  );
}

function ParagraphFields({ props, update }: { props: any; update: (p: any) => void }) {
  return (
    <Field
      label="Teks"
      value={props.text || ""}
      onChange={(v) => update({ text: v })}
      type="textarea"
    />
  );
}

function ImageFields({ props, update }: { props: any; update: (p: any) => void }) {
  return (
    <>
      <Field
        label="URL Gambar"
        value={props.src || ""}
        onChange={(v) => update({ src: v })}
        placeholder="https://..."
      />
      <Field
        label="Alt Text"
        value={props.alt || ""}
        onChange={(v) => update({ alt: v })}
      />
      <Field
        label="Caption"
        value={props.caption || ""}
        onChange={(v) => update({ caption: v })}
      />
    </>
  );
}

function HeroFields({ props, update }: { props: any; update: (p: any) => void }) {
  const updateButton = (index: number, field: string, value: string) => {
    const buttons = [...(props.buttons || [])];
    buttons[index] = { ...buttons[index], [field]: value };
    update({ buttons });
  };

  return (
    <>
      <Field
        label="Badge"
        value={props.badge || ""}
        onChange={(v) => update({ badge: v })}
      />
      <Field
        label="Judul"
        value={props.title || ""}
        onChange={(v) => update({ title: v })}
      />
      <Field
        label="Subtitle"
        value={props.subtitle || ""}
        onChange={(v) => update({ subtitle: v })}
        type="textarea"
      />
      {(props.buttons || []).map((btn: any, i: number) => (
        <div key={i} className="space-y-1.5 rounded-lg border border-slate-100 p-3">
          <p className="text-xs font-medium text-slate-400">Tombol {i + 1}</p>
          <Field
            label="Teks"
            value={btn.text || ""}
            onChange={(v) => updateButton(i, "text", v)}
          />
          <Field
            label="URL"
            value={btn.url || ""}
            onChange={(v) => updateButton(i, "url", v)}
          />
        </div>
      ))}
    </>
  );
}

function NavbarFields({ props, update }: { props: any; update: (p: any) => void }) {
  const links: { label: string; url: string }[] = Array.isArray(props.links)
    ? props.links.map((l: any) => (typeof l === "string" ? { label: l, url: "#" } : l))
    : [];

  const updateLink = (index: number, field: "label" | "url", value: string) => {
    const newLinks = links.map((l, i) => (i === index ? { ...l, [field]: value } : l));
    update({ links: newLinks });
  };

  const addLink = () => update({ links: [...links, { label: "Baru", url: "#" }] });

  const removeLink = (index: number) => update({ links: links.filter((_, i) => i !== index) });

  return (
    <>
      <Field
        label="Logo Teks"
        value={props.logoText || ""}
        onChange={(v) => update({ logoText: v })}
      />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-600">Tautan</label>
          <button
            onClick={addLink}
            className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100"
          >
            <Icon name="plus" size={12} />
            Tambah
          </button>
        </div>
        {links.map((link, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1 space-y-1">
              <input
                value={link.label}
                onChange={(e) => updateLink(i, "label", e.target.value)}
                placeholder="Label"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
              />
              <input
                value={link.url}
                onChange={(e) => updateLink(i, "url", e.target.value)}
                placeholder="URL"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => removeLink(i)}
              className="mt-1 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <Icon name="trash" size={14} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function PricingFields({ props, update }: { props: any; update: (p: any) => void }) {
  const plans = props.plans || [];

  const updatePlan = (index: number, field: string, value: any) => {
    const newPlans = [...plans];
    newPlans[index] = { ...newPlans[index], [field]: value };
    update({ plans: newPlans });
  };

  const updateFeature = (planIndex: number, featureIndex: number, value: string) => {
    const newPlans = [...plans];
    const features = [...newPlans[planIndex].features];
    features[featureIndex] = value;
    newPlans[planIndex] = { ...newPlans[planIndex], features };
    update({ plans: newPlans });
  };

  const addFeature = (planIndex: number) => {
    const newPlans = [...plans];
    newPlans[planIndex] = {
      ...newPlans[planIndex],
      features: [...(newPlans[planIndex].features || []), "Fitur baru"],
    };
    update({ plans: newPlans });
  };

  const removeFeature = (planIndex: number, featureIndex: number) => {
    const newPlans = [...plans];
    newPlans[planIndex] = {
      ...newPlans[planIndex],
      features: newPlans[planIndex].features.filter((_: string, i: number) => i !== featureIndex),
    };
    update({ plans: newPlans });
  };

  return (
    <div className="space-y-4">
      {plans.map((plan: any, pi: number) => (
        <div key={pi} className="space-y-2 rounded-lg border border-slate-200 p-3">
          <p className="text-xs font-semibold text-slate-700">Paket {pi + 1}</p>
          <Field
            label="Nama"
            value={plan.name || ""}
            onChange={(v) => updatePlan(pi, "name", v)}
          />
          <Field
            label="Harga"
            value={plan.price || ""}
            onChange={(v) => updatePlan(pi, "price", v)}
          />
          <Field
            label="Periode"
            value={plan.period || ""}
            onChange={(v) => updatePlan(pi, "period", v)}
          />
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-600">Fitur</label>
              <button
                onClick={() => addFeature(pi)}
                className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
              >
                <Icon name="plus" size={12} />
                Tambah
              </button>
            </div>
            {(plan.features || []).map((f: string, fi: number) => (
              <div key={fi} className="flex items-center gap-2">
                <input
                  value={f}
                  onChange={(e) => updateFeature(pi, fi, e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => removeFeature(pi, fi)}
                  className="rounded-md p-1 text-slate-400 hover:text-red-500"
                >
                  <Icon name="trash" size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FormContactFields({ props, update }: { props: any; update: (p: any) => void }) {
  return (
    <>
      <Field
        label="Judul"
        value={props.title || ""}
        onChange={(v) => update({ title: v })}
      />
      <Field
        label="Subtitle"
        value={props.subtitle || ""}
        onChange={(v) => update({ subtitle: v })}
      />
      <Field
        label="Placeholder"
        value={props.placeholder || ""}
        onChange={(v) => update({ placeholder: v })}
      />
      <Field
        label="Teks Tombol"
        value={props.buttonText || ""}
        onChange={(v) => update({ buttonText: v })}
      />
    </>
  );
}

function FooterFields({ props, update }: { props: any; update: (p: any) => void }) {
  return (
    <>
      <Field
        label="Nama Brand"
        value={props.brandName || ""}
        onChange={(v) => update({ brandName: v })}
      />
      <Field
        label="Copyright"
        value={props.copyright || ""}
        onChange={(v) => update({ copyright: v })}
      />
    </>
  );
}

function ContainerFields({ props, update }: { props: any; update: (p: any) => void }) {
  return (
    <Field
      label="Konten"
      value={props.content || ""}
      onChange={(v) => update({ content: v })}
      type="textarea"
    />
  );
}

const FIELD_MAP: Record<string, React.FC<{ props: any; update: (p: any) => void }>> = {
  heading: HeadingFields,
  paragraph: ParagraphFields,
  image: ImageFields,
  hero: HeroFields,
  navbar: NavbarFields,
  pricing: PricingFields,
  form_contact: FormContactFields,
  footer: FooterFields,
  container: ContainerFields,
};

export function ContentTab() {
  const { activeBlock, updateBlockProps } = useEditor();
  if (!activeBlock) return null;

  const Fields = FIELD_MAP[activeBlock.type];

  return (
    <div className="space-y-4 p-4">
      <Field
        label="Nama Layer"
        value={activeBlock.props.layerName || ""}
        onChange={(v) => updateBlockProps({ layerName: v })}
        placeholder="My Block"
      />
      {Fields && <Fields props={activeBlock.props} update={updateBlockProps} />}
    </div>
  );
}
