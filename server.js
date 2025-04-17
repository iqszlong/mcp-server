import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "demo-server",
  version: "1.0.0",
});

server.tool(
  "add",
  "Add two numbers",
  { a: z.number(), b: z.number() },
  async ({ a, b }) => ({
    content: [{ type: "text", text: String(a + b) }],
  })
);

server.tool(
  "fetch-data",
  "fetch data from api by pageSize",
  { pageSize: z.number().min(1).max(100) },
  async ({ pageSize }) => {
    try {
      const url = `http://api.master.lazymeta.cn/front/article/list?current=1&pageSize=${pageSize}`;
      const response = await fetch(url, {
        headers: {
          "Content-Type": "text/json; charset=utf-8",
        },
      });
      if (!response.ok) {
        throw new Error(
          `网络请求错误:${response.status} ${response.statusText}`
        );
      }
      const rdata = await response.json();
      const { code, data, msg } = rdata;
      // console.log(rdata.data.list.length);

      if (code == 200) {
        // console.log(data);
        return {
          content: data.list.map((item) => {
            return {
              type: "text",
              text: item.title,
            };
          }),
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `请求错误: ${msg}`,
            },
          ],
        };
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `错误: ${error.message}`,
          },
        ],
      };
    }
  }
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
transport.onerror = (error) => console.error(error);
await server.connect(transport);
console.log("Server started");
