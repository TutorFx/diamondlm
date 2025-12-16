# Groups & Permissions

Power organization-level access control and team management.

## 🧱 Concepts

### Group Structure
- **Groups**: Isolated workspaces (e.g., "Engineering", "Sales").
- **Slug**: Unique URL identifier (e.g., `/dashboard/engineering`).
- **Isolation**: Guides and Chats belonging to a group are invisible to others (unless global).

### Permissions (ACL)
Diamond LLM uses a granular permission bitmask system.

| Permission | Description |
|------------|-------------|
| `guide:read` | View guides within the group |
| `guide:create` | Create new guides |
| `guide:edit` | Update existing guide content |
| `guide:delete` | Remove guides |
| `group:update` | Modify group settings |
| `member:manage` | Invite or remove members |

## 🕹️ Features

### Member Management
Admins can invite users via email. Permissions are toggleable via the UI.

### Session Persistence (Last Group)
The system enhances UX by remembering where you left off.
- **Mechanism**: Simple cache preference updated on navigation.
- **Behavior**: Auto-redirects to the last visited group on login.

## 🛠️ Admin Seeding
For bootstrapping new environments, you can define admins in a JSON file.

👉 **[See Seeding Documentation](./SEEDING.md)** for details.
