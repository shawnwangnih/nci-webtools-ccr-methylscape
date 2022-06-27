export const sources = [
  {
    sourcePath: "organization.csv",
    table: "organization",
    description: "Organization table",
    columns: [
      { sourceName: "order", name: "order" },
      { sourceName: "name", name: "name" },
    ],
  },
  {
    sourcePath: "role.csv",
    table: "role",
    description: "Role table",
    columns: [
      { sourceName: "name", name: "name" },
      { sourceName: "description", name: "description" },
    ],
  },
  {
    sourcePath: "rolePolicy.csv",
    table: "rolePolicy",
    description: "rolePolicy table",
    columns: [
      { sourceName: "roleId", name: "roleId" },
      { sourceName: "action", name: "action" },
      { sourceName: "resource", name: "resource" },
    ],
  },
  {
    sourcePath: "user.csv",
    table: "user",
    description: "Policy table",
    columns: [
      { sourceName: "roleId", name: "roleId" },
      { sourceName: "organizationId", name: "organizationId" },
      { sourceName: "organizationOther", name: "organizationOther" },
      { sourceName: "accountType", name: "accountType" },
      { sourceName: "name", name: "name" },
      { sourceName: "firstName", name: "firstName" },
      { sourceName: "lastName", name: "lastName" },
      { sourceName: "email", name: "email" },
      { sourceName: "status", name: "status" },
      { sourceName: "receiveNotification", name: "receiveNotification" },
    ],
  },
];
