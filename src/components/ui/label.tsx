export const Label = ({ children, htmlFor }: any) => (
  <label htmlFor={htmlFor} className="text-sm font-medium">
    {children}
  </label>
);