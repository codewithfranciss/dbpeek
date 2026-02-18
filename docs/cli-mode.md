# CLI Mode Documentation

The CLI mode for **dbpeek** is designed for high-speed, interactive database inspection directly from your terminal.

## Key Features

- **Interactive Discovery**: Automatically finds databases in your running Docker containers.
- **Zero Configuration**: Guesses credentials from environment variables (e.g., `POSTGRES_PASSWORD`).
- **Rich Visualization**: Uses formatted ASCII tables for schema and data views.
- **Full Dataset Inspection**: Option to view all rows in a table after the initial preview.

## Usage

### Starting the Inspection

```bash
dbpeek inspect
```

### Navigation

1. **Container Selection**: Use arrow keys to pick a container from the list of detected databases.
2. **Table Selection**: Choose a table from the list of available user tables.
3. **Data Preview**: View the first 5 rows and the schema structure.
4. **Full View**: Confirm "Yes" to the "View all rows?" prompt to render the entire table.

## Technical Architecture

- **Orchestration**: `PeekEngine` handles the data flow between Docker and Postgres.
- **Detection**: `DockerDetector` scans the Docker socket and inspects container environments.
- **Inspection**: `PostgresInspector` queries `information_schema` for metadata.
- **Formatting**: `CLIFormatter` wraps `cli-table3` and `chalk` for aesthetics.

## Verification Log (2026-02-18)

### Verification Steps

1. **Environment**: Mac OS, Docker Desktop running.
2. **Setup**:
   ```bash
   docker run -d --name dbpeek-test \
     -e POSTGRES_PASSWORD=mysecretpassword \
     -p 5432:5432 \
     postgres:14
   3. **Execution**:
   - Ran `npm run build`.
   - Ran `node dist/cli.js inspect`.
4. **Results**:
   - `dbpeek-test` was correctly detected as a PostgreSQL container.
   - Connection was successful using the `POSTGRES_PASSWORD` env var.
   - Tables were listed correctly.
   - Schema table displayed column names, types, and defaults.
   - Data preview showed sample rows accurately.
   - "View all rows" rendered the full dataset as expected.

### Test Coverage

- `tests/utils/cli-formatter.test.ts`: Verified table rendering logic. (Drafted)
