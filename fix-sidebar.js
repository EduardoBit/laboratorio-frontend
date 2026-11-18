const fs = require('fs');
const file = 'src/app/layout/sidebar/sidebar.component.ts';
let content = fs.readFileSync(file, 'utf8');

const newMenuConfig = const MENU_CONFIG: MenuGroup[] = [
  {
    label: 'Dashboard',
    items: [
      { label: 'Inicio', route: '/dashboard', icon: 'pi pi-home', roles: ['ROLE_ADMIN', 'ROLE_FARMACEUTICO', 'ROLE_VENDEDOR', 'ROLE_ALMACENERO', 'ROLE_TECNICO', 'ROLE_DIRECTOR_TECNICO'] }
    ]
  },
  {
    label: 'Operación',
    items: [
      { label: 'Pacientes', route: '/pacientes', icon: 'pi pi-users', roles: ['ROLE_VENDEDOR', 'ROLE_FARMACEUTICO', 'ROLE_ADMIN'] },
      { label: 'Médicos', route: '/medicos', icon: 'pi pi-user-plus', roles: ['ROLE_VENDEDOR', 'ROLE_FARMACEUTICO', 'ROLE_ADMIN'] },
      { label: 'Recetas', route: '/recetas', icon: 'pi pi-file-edit', roles: ['ROLE_VENDEDOR', 'ROLE_FARMACEUTICO', 'ROLE_DIRECTOR_TECNICO', 'ROLE_ADMIN'] }
    ]
  }
];;

content = content.replace(/const MENU_CONFIG: MenuGroup\[\] = \[[\s\S]*?\];/m, newMenuConfig);
fs.writeFileSync(file, content, 'utf8');
