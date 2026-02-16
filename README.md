# dbpeek

> A lightweight, zero-config CLI tool and library for inspecting database schemas in Docker containers.

dbpeek lets you quickly view your database structure without leaving your workflow. It is designed to be used in three ways:

1. **CLI**: Quick terminal inspection.
2. **Web UI**: Visual schema exploration.
3. **Programmatically**: As a Node.js library in your own code.

Perfect for developers working with containerized databases who need a fast, read-only peek at their schema.

## Features

- **Three modes**: CLI, Web UI, and Programmatic Library
- Auto-detect running database containers
- View tables and their schemas
- Preview sample rows from any table
- Read-only by design
- Zero-config for standard Docker setups

## Installation

### Global Installation (Recommended)

```bash
npm install -g dbpeek
```

### Local Project Installation

```bash
npm install dbpeek
```

## Usage

### CLI Mode

**Interactive inspection:**

```bash
dbpeek inspect
```

This will:

1. List all running database containers
2. Let you select one
3. Display all tables with their schema details

**Example output:**

```
Detected containers:
1. my-postgres-db (postgres:14)
2. test-db (postgres:latest)

Select a container: 1

Tables in my-postgres-db:

users
┌───────────┬──────────────┬──────────┬─────────┐
│ Column    │ Type         │ Nullable │ Default │
├───────────┼──────────────┼──────────┼─────────┤
│ id        │ integer      │ NO       │ nextval │
│ name      │ varchar(255) │ YES      │ NULL    │
│ email     │ varchar(255) │ NO       │ NULL    │
│ created_at│ timestamp    │ YES      │ now()   │
└───────────┴──────────────┴──────────┴─────────┘

Preview (3 rows):
┌────┬───────┬─────────────────┬────────────────────┐
│ id │ name  │ email           │ created_at         │
├────┼───────┼─────────────────┼────────────────────┤
│ 1  │ John  │ john@email.com  │ 2026-01-30 12:00   │
│ 2  │ Alice │ alice@email.com │ 2026-01-30 13:00   │
│ 3  │ Bob   │ bob@email.com   │ 2026-01-30 14:00   │
└────┴───────┴─────────────────┴────────────────────┘
```

### Web UI Mode

**Start the web server:**

```bash
dbpeek web
```

Then open your browser at [http://localhost:3333](http://localhost:3333)

The web UI provides:

- Container selection dropdown
- Table list with expandable schemas
- Sample data preview
- Clean, read-only interface

## Supported Databases

- PostgreSQL (Available now)
- MySQL (Coming soon)
- MongoDB (Planned)
- Redis (Planned)

## Requirements

- Node.js 16.x or higher
- Docker running locally
- Docker socket access (standard on Mac/Linux at /var/run/docker.sock)

## Usage as a Library

You can also use dbpeek programmatically in your Node.js projects:

```typescript
import { DockerDetector, PostgresInspector } from "dbpeek";

// Detect database containers
const detector = new DockerDetector();
const containers = await detector.getDatabaseContainers();

// Inspect a PostgreSQL database
const inspector = new PostgresInspector();
const connectionInfo = await detector.getConnectionInfo(containers[0]);
await inspector.connect(connectionInfo);

const tables = await inspector.listTables();
const schema = await inspector.getTableSchema("users");
const preview = await inspector.previewRows("users", 5);

await inspector.disconnect();
```

## Contributing

Contributions are welcome! This is an open-source project.

### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/dbpeek.git
   cd dbpeek
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start development:
   ```bash
   npm run dev
   ```
5. Build:
   ```bash
   npm run build
   ```

### Development Setup

To test locally:

```bash
# Link the package globally
npm link

# Start a test database
docker run -d --name test-postgres \
  -e POSTGRES_PASSWORD=testpass \
  -e POSTGRES_DB=testdb \
  -p 5432:5432 postgres:latest

# Test the CLI
dbpeek inspect
```

### Contributing Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Create detailed pull requests

## Roadmap

- [x] PostgreSQL support
- [ ] MySQL/MariaDB support
- [ ] MongoDB support
- [ ] Redis support
- [ ] Export schema to JSON/SQL
- [ ] Compare schemas across containers
- [ ] Custom Docker network support
- [ ] SSH tunnel support for remote databases

## License

MIT License - feel free to use this in your projects!

## Acknowledgments

Built with:

- dockerode - Docker API client
- node-postgres - PostgreSQL client
- commander - CLI framework
- cli-table3 - Terminal tables

## Why dbpeek?

As developers, we often need to quickly check our database structure during development. Opening a database client, connecting manually, and navigating through schemas is tedious. dbpeek solves this by:

- Automatically finding your Docker databases
- Showing you exactly what you need
- Getting out of your way

Perfect for:

- Quick schema checks during development
- Documenting database structure
- Debugging data issues
- Onboarding new team members

---

**Made for developers who love the terminal**

Star this repo if you find it useful!
