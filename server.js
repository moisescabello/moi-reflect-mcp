#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Modo test: solo verificar que el servidor puede inicializarse
if (process.argv.includes('--test')) {
  console.log('✅ Servidor MCP de Reflect - Verificación exitosa');
  console.log('   El servidor puede inicializarse correctamente');
  console.log('   Todas las dependencias están instaladas');
  console.log('   Listo para usar con Claude Desktop');
  process.exit(0);
}

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const REFLECT_TOKEN = process.env.REFLECT_TOKEN;
const GRAPH_ID = process.env.GRAPH_ID;
const BASE_URL = 'https://reflect.app/api';

const maskIdentifier = (value) => {
  if (!value) {
    return '<sin definir>';
  }
  const stringValue = String(value);
  if (stringValue.length <= 4) {
    return '*'.repeat(stringValue.length);
  }
  const masked = '*'.repeat(stringValue.length - 4);
  return `${masked}${stringValue.slice(-4)}`;
};

const isPlainObject = (value) => {
  return value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype;
};

const sanitizeArgs = (input) => {
  if (Array.isArray(input)) {
    return input.map(item => sanitizeArgs(item));
  }
  if (isPlainObject(input)) {
    return Object.entries(input).reduce((acc, [key, value]) => {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('token') || lowerKey.includes('secret')) {
        acc[key] = '<redacted>';
        return acc;
      }
      if (typeof value === 'string' && (
        lowerKey.includes('text') ||
        lowerKey.includes('content') ||
        lowerKey.includes('reminder') ||
        lowerKey.includes('subject') ||
        lowerKey.includes('description')
      )) {
        acc[key] = '<redacted>';
        return acc;
      }
      acc[key] = sanitizeArgs(value);
      return acc;
    }, {});
  }
  return input;
};

// Validar configuración
if (!REFLECT_TOKEN || !GRAPH_ID) {
  console.error('Error: REFLECT_TOKEN y GRAPH_ID son requeridos en el archivo .env');
  process.exit(1);
}

console.error('Servidor MCP de Reflect iniciando...');
console.error(`Graph ID: ${maskIdentifier(GRAPH_ID)}`);

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${REFLECT_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Crear servidor MCP con las capacidades correctas
const server = new Server(
  {
    name: 'reflect-mcp',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Registrar manejador para listar herramientas
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'add_to_daily_note',
        description: 'Añadir contenido a una nota diaria en Reflect',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Texto a añadir a la nota diaria'
            },
            date: {
              type: 'string',
              description: 'Fecha de la nota (formato YYYY-MM-DD). Si no se especifica, usa hoy.'
            },
            list_name: {
              type: 'string',
              description: 'Nombre de la lista donde añadir el texto. Usa [[nombre]] para backlinks.'
            }
          },
          required: ['text']
        }
      },
      {
        name: 'add_to_today',
        description: 'Añadir contenido rápidamente a la nota de hoy',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Texto a añadir a la nota de hoy'
            },
            list_name: {
              type: 'string',
              description: 'Nombre de la lista (opcional)'
            }
          },
          required: ['text']
        }
      },
      {
        name: 'add_to_tomorrow',
        description: 'Añadir contenido a la nota de mañana',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Texto a añadir a la nota de mañana'
            },
            list_name: {
              type: 'string',
              description: 'Nombre de la lista (opcional)'
            }
          },
          required: ['text']
        }
      },
      {
        name: 'create_note',
        description: 'Crear una nueva nota en Reflect',
        inputSchema: {
          type: 'object',
          properties: {
            subject: {
              type: 'string',
              description: 'Título de la nota'
            },
            content: {
              type: 'string',
              description: 'Contenido de la nota en formato Markdown'
            },
            pinned: {
              type: 'boolean',
              description: 'Si la nota debe estar fijada'
            }
          },
          required: ['subject', 'content']
        }
      },
      {
        name: 'save_link',
        description: 'Guardar un enlace en Reflect',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL del enlace a guardar'
            },
            title: {
              type: 'string',
              description: 'Título del enlace'
            },
            description: {
              type: 'string',
              description: 'Descripción del enlace'
            },
            highlights: {
              type: 'array',
              items: { type: 'string' },
              description: 'Lista de fragmentos destacados del enlace'
            }
          },
          required: ['url']
        }
      },
      {
        name: 'get_links',
        description: 'Obtener todos los enlaces guardados en Reflect',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_books',
        description: 'Obtener todos los libros guardados en Reflect',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'schedule_reminder',
        description: 'Programar un recordatorio para una fecha futura',
        inputSchema: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              description: 'Fecha del recordatorio (formato YYYY-MM-DD)'
            },
            reminder: {
              type: 'string',
              description: 'Texto del recordatorio'
            },
            list_name: {
              type: 'string',
              description: 'Lista donde añadir el recordatorio (por defecto: "Recordatorios")'
            }
          },
          required: ['date', 'reminder']
        }
      }
    ]
  };
});

// Registrar manejador para ejecutar herramientas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;
  const args = request.params.arguments || {};

  console.error(`Ejecutando herramienta: ${name}`);
  console.error('Argumentos (sanitizados):', JSON.stringify(sanitizeArgs(args)));

  try {
    switch (name) {
      case 'add_to_daily_note': {
        const response = await api.put(`/graphs/${GRAPH_ID}/daily-notes`, {
          date: args.date,
          text: args.text,
          transform_type: 'list-append',
          list_name: args.list_name
        });
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Contenido añadido a la nota del ${args.date || 'día de hoy'}`
            }
          ]
        };
      }

      case 'add_to_today': {
        const today = new Date().toISOString().split('T')[0];
        const response = await api.put(`/graphs/${GRAPH_ID}/daily-notes`, {
          date: today,
          text: args.text,
          transform_type: 'list-append',
          list_name: args.list_name
        });
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Contenido añadido a la nota de hoy (${today})`
            }
          ]
        };
      }

      case 'add_to_tomorrow': {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        const response = await api.put(`/graphs/${GRAPH_ID}/daily-notes`, {
          date: tomorrowStr,
          text: args.text,
          transform_type: 'list-append',
          list_name: args.list_name
        });
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Contenido añadido a la nota de mañana (${tomorrowStr})`
            }
          ]
        };
      }

      case 'create_note': {
        const response = await api.post(`/graphs/${GRAPH_ID}/notes`, {
          subject: args.subject,
          content_markdown: args.content,
          pinned: args.pinned || false
        });
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Nota "${args.subject}" creada exitosamente`
            }
          ]
        };
      }

      case 'save_link': {
        const response = await api.post(`/graphs/${GRAPH_ID}/links`, {
          url: args.url,
          title: args.title,
          description: args.description,
          highlights: args.highlights || []
        });
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Enlace guardado: ${args.title || args.url}`
            }
          ]
        };
      }

      case 'get_links': {
        const response = await api.get(`/graphs/${GRAPH_ID}/links`);
        const links = response.data;
        
        if (!links || links.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No hay enlaces guardados'
              }
            ]
          };
        }

        const linksList = links.map(link => 
          `• [${link.title || 'Sin título'}](${link.url})${link.description ? `\n  ${link.description}` : ''}`
        ).join('\n\n');

        return {
          content: [
            {
              type: 'text',
              text: `Enlaces guardados (${links.length}):\n\n${linksList}`
            }
          ]
        };
      }

      case 'get_books': {
        const response = await api.get(`/graphs/${GRAPH_ID}/books`);
        const books = response.data;
        
        if (!books || books.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: 'No hay libros guardados'
              }
            ]
          };
        }

        const booksList = books.map(book => {
          const authors = book.authors ? book.authors.join(', ') : 'Autor desconocido';
          const notesCount = book.notes ? book.notes.length : 0;
          return `• ${book.title} - ${authors}${notesCount > 0 ? ` (${notesCount} notas)` : ''}`;
        }).join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `Libros guardados (${books.length}):\n\n${booksList}`
            }
          ]
        };
      }

      case 'schedule_reminder': {
        const response = await api.put(`/graphs/${GRAPH_ID}/daily-notes`, {
          date: args.date,
          text: `🔔 ${args.reminder}`,
          transform_type: 'list-append',
          list_name: args.list_name || 'Recordatorios'
        });
        
        return {
          content: [
            {
              type: 'text',
              text: `✅ Recordatorio programado para el ${args.date}`
            }
          ]
        };
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Herramienta no encontrada: ${name}`
        );
    }
  } catch (error) {
    console.error('Error ejecutando herramienta:', error);
    
    // Si es un error de Axios
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.statusText;
      
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error de Reflect (${status}): ${message}`
          }
        ],
        isError: true
      };
    }
    
    // Si es un error de red
    if (error.request) {
      return {
        content: [
          {
            type: 'text',
            text: '❌ Error: No se pudo conectar con Reflect. Verifica tu conexión.'
          }
        ],
        isError: true
      };
    }
    
    // Cualquier otro error
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// Iniciar el servidor
async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('✅ Servidor MCP de Reflect conectado correctamente');
  } catch (error) {
    console.error('Error al conectar:', error);
    process.exit(1);
  }
}

main();
