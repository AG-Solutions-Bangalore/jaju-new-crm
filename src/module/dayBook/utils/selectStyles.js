export const selectStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: "36px",
    height: "36px",
    borderRadius: "0.375rem",
    borderColor: "hsl(var(--input))",
    backgroundColor: "hsl(var(--background))",
    boxShadow: "none",
    "&:hover": {
      borderColor: "hsl(var(--input))",
    },
    "&:focus-within": {
      borderColor: "hsl(var(--ring))",
      boxShadow: "0 0 0 2px hsl(var(--ring))",
    },
  }),
  input: (provided) => ({
    ...provided,
    margin: "0",
    padding: "0",
    color: "hsl(var(--foreground))",
  }),
  valueContainer: (provided) => ({
    ...provided,
    height: "36px",
    padding: "0 6px",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "hsl(var(--foreground))",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "hsl(var(--muted-foreground))",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "hsl(var(--muted-foreground))",
    padding: "4px",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "0.375rem",
    border: "1px solid hsl(var(--border))",
    boxShadow:
      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    zIndex: 50,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "hsl(var(--primary))"
      : state.isFocused
        ? "hsl(var(--accent))"
        : "hsl(var(--background))",
    color: state.isSelected
      ? "hsl(var(--primary-foreground))"
      : "hsl(var(--foreground))",
    "&:hover": {
      backgroundColor: "hsl(var(--accent))",
      color: "hsl(var(--accent-foreground))",
    },
  }),
};
