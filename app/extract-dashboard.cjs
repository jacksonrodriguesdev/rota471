const fs = require('fs');

const dashboardCode = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

// The dashboard has <header>, <aside>, and <main> tags inside the main div.
// We'll extract them.

const headerMatch = dashboardCode.match(/<header[\s\S]*?<\/header>/);
const asideMatch = dashboardCode.match(/<aside[\s\S]*?<\/aside>/);
const mainMatch = dashboardCode.match(/<main[\s\S]*?<\/main>/);

if (headerMatch && asideMatch && mainMatch) {
  const headerContent = headerMatch[0];
  const asideContent = asideMatch[0];
  const mainContent = mainMatch[0];

  fs.mkdirSync('src/components/admin', { recursive: true });
  fs.mkdirSync('src/pages/admin', { recursive: true });

  // AdminHeader.jsx
  fs.writeFileSync('src/components/admin/AdminHeader.jsx', `import React from 'react';\n\nexport default function AdminHeader() {\n  return (\n    <>\n      ${headerContent}\n    </>\n  );\n}\n`);

  // AdminSidebar.jsx
  fs.writeFileSync('src/components/admin/AdminSidebar.jsx', `import React from 'react';\nimport { Link } from 'react-router-dom';\n\nexport default function AdminSidebar() {\n  return (\n    <>\n      ${asideContent}\n    </>\n  );\n}\n`);

  // DashboardLayout.jsx
  fs.writeFileSync('src/components/admin/DashboardLayout.jsx', `import React from 'react';\nimport { Outlet } from 'react-router-dom';\nimport AdminHeader from './AdminHeader';\nimport AdminSidebar from './AdminSidebar';\n\nexport default function DashboardLayout() {\n  return (\n    <div className="dark bg-surface-container-lowest min-h-screen">\n      <AdminHeader />\n      <AdminSidebar />\n      <div className="md:ml-64 pt-16 min-h-screen">\n        <Outlet />\n      </div>\n    </div>\n  );\n}\n`);

  // Overview.jsx
  fs.writeFileSync('src/pages/admin/Overview.jsx', `import React from 'react';\n\nexport default function Overview() {\n  return (\n    <>\n      ${mainContent}\n    </>\n  );\n}\n`);

  console.log('Admin components generated successfully!');
} else {
  console.log('Failed to match dashboard structure.');
}
