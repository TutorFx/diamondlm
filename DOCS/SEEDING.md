# Database Seeding

Bootstrap your database with initial admins, groups, and global guides.

## 🚀 Usage

Execute the seed script via Bun.

```bash
bun run seed
```

> [!WARNING]
> **Data Loss:** This command **WIPES** all existing data (Users, Groups, Guides, Embeddings) before creating new entries.

## 📂 Directory Structure

The `seed/` directory maps directly to your database structure.

| Path | Description |
|------|-------------|
| `seed/admins.json` | Configuration for admin users |
| `seed/public/*.md` | **Global Guides** (Accessible by everyone) |
| `seed/<slug>/*.md` | **Group Guides** (Created under a group with name `<slug>`) |

### Example Layout

```
seed/
├── admins.json
├── public/
│   └── getting-started.md
├── marketing/            # Creates "Marketing" group
│   └── brand-guidelines.md
└── engineering/          # Creates "Engineering" group
    └── setup.md
```

## 👤 Admin Configuration

Define your initial super-admins in `seed/admins.json`. These users are automatically added to **all seeded groups** with full permissions.

**`seed/admins.json`**:

```json
{
  "admins": [
    {
      "name": "System Admin",
      "email": "admin@diamond.com",
      "password": "strong-password-here"
    }
  ]
}
```

> [!TIP]
> This file is optional. If missing, the script skips admin creation but still processes guides.
