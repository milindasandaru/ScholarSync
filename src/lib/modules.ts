export type ModuleOption = {
  code: string;
  name: string;
};

export const MODULE_OPTIONS: ModuleOption[] = [
  { code: 'CS301', name: 'Database Systems' },
  { code: 'CS201', name: 'Data Structures' },
  { code: 'CS401', name: 'Software Engineering' },
  { code: 'CS302', name: 'Computer Networks' },
  { code: 'CS501', name: 'Machine Learning' },
  { code: 'CS202', name: 'Web Development' },
  { code: 'IT3040', name: 'IT Project Management' },
  { code: 'IT3010', name: 'Data Science & Analytics' },
];

export function getModuleLabel(moduleCode?: string): string | null {
  if (!moduleCode) {
    return null;
  }

  const module = MODULE_OPTIONS.find((item) => item.code === moduleCode);
  return module ? `${module.code} - ${module.name}` : moduleCode;
}
