"use client";

interface ToggleSwitchProps {
  id: string;
  name: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

export function ToggleSwitch({
  id,
  name,
  defaultChecked = false,
  disabled = false,
  onChange,
}: ToggleSwitchProps) {
  return (
    <label
      htmlFor={id}
      className="relative inline-flex cursor-pointer items-center"
    >
      <input
        type="checkbox"
        id={id}
        name={name}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="peer sr-only"
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <div className="peer bg-muted after:border-border peer-checked:bg-primary peer-focus:ring-ring h-6 w-11 rounded-full peer-focus:ring-2 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:bg-white after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full" />
    </label>
  );
}
