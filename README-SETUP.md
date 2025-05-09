# n8n-workflow-builder MCP Setup

This document provides instructions for setting up and using the n8n-workflow-builder MCP server.

## Installation

The n8n-workflow-builder MCP has been installed with the following steps:

1. Created a directory for the MCP server
2. Cloned the repository from https://github.com/makafeli/n8n-workflow-builder.git
3. Installed dependencies with `npm install`
4. Built the project with `npm run build`
5. Created configuration file (`cline_mcp_settings.json`)

## Configuration

Before using the MCP server, you need to update the `cline_mcp_settings.json` file with your actual n8n instance information:

```json
{
  "n8n-workflow-builder": {
    "command": "node",
    "args": ["./build/index.js"],
    "env": {
      "N8N_HOST": "https://your-actual-n8n-instance.com/api/v1/",
      "N8N_API_KEY": "YOUR_ACTUAL_N8N_API_KEY"
    },
    ...
  }
}
```

Replace:
- `https://your-actual-n8n-instance.com/api/v1/` with your actual n8n API endpoint
- `YOUR_ACTUAL_N8N_API_KEY` with your actual n8n API key

## Running the MCP Server

To start the MCP server:

```
npm start
```

## Available MCP Tools

The following tools are available through this MCP:

- **list_workflows**: Lists all workflows from n8n
- **create_workflow**: Creates a new workflow in n8n
- **create_workflow_and_activate**: Creates and activates a workflow
- **get_workflow**: Retrieves a workflow by its ID
- **update_workflow**: Updates an existing workflow
- **delete_workflow**: Deletes a workflow by its ID
- **activate_workflow**: Activates a workflow by its ID
- **deactivate_workflow**: Deactivates a workflow by its ID
- **list_executions**: Lists all workflow executions with optional filters
- **get_execution**: Retrieves details of a specific execution by its ID
- **delete_execution**: Deletes an execution by its ID

## Troubleshooting

If you encounter issues:

1. Ensure your n8n instance is running and accessible
2. Verify that your API key has the necessary permissions
3. Check that the n8n API endpoint URL is correct
4. Try rebuilding the project: `npm run clean && npm run build` 