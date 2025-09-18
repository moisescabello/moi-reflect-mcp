# Reflect MCP Server

An unofficial MCP (Model Context Protocol) server to interact with [Reflect](https://reflect.app) from Claude Desktop.

> **Note**: This is an independent project and is not affiliated with or endorsed by Reflect.

## 🚀 Features

- ✅ Add content to daily notes (today, tomorrow, or any date)
- 📝 Create new notes
- 🔗 Save links
- 🔔 Schedule reminders for future dates
- 📋 Organize content in specific lists

## 📦 Version

- Current release: `0.5.0` — see `CHANGELOG.md` for details.

## 📋 Prerequisites

1. **Reflect account** with API access
2. **Node.js** version 18 or higher
3. **Claude Desktop** installed

## 🛠️ Installation

### 1. Clone or download this project

```bash
# If you have git
git clone https://github.com/moisescabello/moi-reflect-mcp
cd moi-reflect-mcp

# Or simply copy the files to a folder
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure credentials

#### Get your Reflect token:

1. Go to [https://reflect.app/developer/oauth](https://reflect.app/developer/oauth)
2. Create new OAuth credentials
3. Generate an Access Token (it's like an API key)

#### Get your Graph ID:

After creating your token, run this helper script included in the project:
```bash
npm run setup
```

This will show you all your graphs and their IDs. Copy the ID of the graph you want to use.

Alternatively, you can use curl:
```bash
curl 'https://reflect.app/api/graphs' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE'
```

#### Create .env file:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
```
REFLECT_TOKEN=your_actual_token_here
GRAPH_ID=your_actual_graph_id_here
# Optional: override the timezone used for daily note helpers (IANA format)
# REFLECT_TIMEZONE=Europe/Madrid
```

### 4. Configure Claude Desktop

Find the Claude Desktop configuration file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/claude/claude_desktop_config.json`

Add this configuration (adjust the path):

```json
{
  "mcpServers": {
    "reflect": {
      "command": "node",
      "args": ["/full/path/to/reflect-mcp/server.js"],
      "env": {
        "REFLECT_TOKEN": "your_token_here",
        "GRAPH_ID": "your_graph_id_here"
      }
    }
  }
}
```

**Note**: You can put credentials directly in `claude_desktop_config.json` (as above) or let them be read from the `.env` file (don't put the `env` in the JSON).

### 5. Restart Claude Desktop

Completely close Claude Desktop and reopen it.

## 🎯 Usage

Once configured, you can use commands like these in Claude:

### Usage examples:

```
"Add to my today's note: Review the sales report"

"Create a reminder for Friday: Team meeting at 10am"

"Save this link: https://example.com with the title 'Interesting article'"

"Create a new note called 'Project ideas' with the content..."

"Show me all my saved links"

"Add to tomorrow's note in the [[Tasks]] list: Prepare presentation"
```

## 🛠️ Available tools

| Tool | Description |
|------|-------------|
| `add_to_daily_note` | Add to any daily note |
| `add_to_today` | Quick add to today's note |
| `add_to_tomorrow` | Add to tomorrow's note |
| `create_note` | Create a new note |
| `save_link` | Save a link |
| `get_links` | View all links |
| `get_books` | View all books |
| `schedule_reminder` | Schedule reminder |

## 🐛 Troubleshooting

### Server won't connect

1. Verify that paths in `claude_desktop_config.json` are absolute
2. Check that Node.js is installed: `node --version`
3. Review Claude Desktop logs

### Authentication error

1. Verify that your token is valid
2. Ensure the Graph ID is correct
3. Check for extra spaces in .env

### Tools don't appear in Claude

1. Completely restart Claude Desktop
2. Verify the server is in the configuration
3. Check for syntax errors in the JSON

## 📝 Important Limitations

Due to end-to-end encryption in Reflect:
- **Cannot read** existing note content
- **Cannot modify** existing content
- **Can only**:
  - Create new notes
  - Append content to daily notes
  - Add links and reminders
- Backlinks are created with `[[Name]]`
- Dates must be in `YYYY-MM-DD` format
- Daily-note tools use your system timezone (or `REFLECT_TIMEZONE` when set). Configure the variable if the server runs in another region.

## 📄 License

MIT

## 🙋‍♀️ Support

If you encounter issues:
1. Review the Reflect documentation: https://reflect.academy/api
2. Open an issue in this repository
3. Contact Reflect support for API issues

## 👨‍💻 Author

Created by [Moisés Cabello]() - [contacto@moisescabello.com](mailto:contacto@moisescabello.com)
