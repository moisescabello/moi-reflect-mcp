#!/usr/bin/env node
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Configurar variables de entorno de prueba
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const hasReflectToken = Boolean(process.env.REFLECT_TOKEN);
const hasGraphId = Boolean(process.env.GRAPH_ID);
const configuredTimeZone = process.env.REFLECT_TIMEZONE;

console.log('🔍 Verificando configuración del servidor MCP de Reflect...\n');

// Verificar estructura de herramientas
const TOOLS = [
  {
    name: 'add_to_daily_note',
    requiredFields: ['text']
  },
  {
    name: 'add_to_today',
    requiredFields: ['text']
  },
  {
    name: 'add_to_tomorrow',
    requiredFields: ['text']
  },
  {
    name: 'create_note',
    requiredFields: ['subject', 'content']
  },
  {
    name: 'save_link',
    requiredFields: ['url']
  },
  {
    name: 'get_links',
    requiredFields: []
  },
  {
    name: 'get_books',
    requiredFields: []
  },
  {
    name: 'schedule_reminder',
    requiredFields: ['date', 'reminder']
  }
];

let errorsFound = false;

// Verificar cada herramienta
console.log('📋 Verificando herramientas:');
TOOLS.forEach(tool => {
  const hasRequiredFields = Array.isArray(tool.requiredFields);
  const invalidFields = hasRequiredFields
    ? tool.requiredFields.filter(field => typeof field !== 'string' || field.trim() === '')
    : [];

  if (!hasRequiredFields || invalidFields.length > 0) {
    const issue = !hasRequiredFields ? 'no definidos' : invalidFields.join(', ');
    console.log(`   ❌ ${tool.name} - Campos requeridos inválidos: ${issue}`);
    errorsFound = true;
  } else {
    console.log(`   ✅ ${tool.name} - Configuración correcta`);
  }
});

// Verificar imports
console.log('\n📦 Verificando dependencias:');
try {
  await import('@modelcontextprotocol/sdk/server/index.js');
  console.log('   ✅ @modelcontextprotocol/sdk');
} catch (e) {
  console.log('   ❌ @modelcontextprotocol/sdk - No se pudo importar');
  errorsFound = true;
}

try {
  await import('axios');
  console.log('   ✅ axios');
} catch (e) {
  console.log('   ❌ axios - No se pudo importar');
  errorsFound = true;
}

try {
  await import('dotenv');
  console.log('   ✅ dotenv');
} catch (e) {
  console.log('   ❌ dotenv - No se pudo importar');
  errorsFound = true;
}

// Verificar configuración
console.log('\n⚙️  Verificando configuración:');
if (hasReflectToken) {
  console.log('   ✅ REFLECT_TOKEN configurado');
} else {
  console.log('   ❌ REFLECT_TOKEN no encontrado');
  errorsFound = true;
}

if (hasGraphId) {
  console.log('   ✅ GRAPH_ID configurado');
} else {
  console.log('   ❌ GRAPH_ID no encontrado');
  errorsFound = true;
}

if (configuredTimeZone) {
  try {
    new Intl.DateTimeFormat('en-CA', {
      timeZone: configuredTimeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());
    console.log(`   ✅ REFLECT_TIMEZONE válido (${configuredTimeZone})`);
  } catch (error) {
    console.log(`   ❌ REFLECT_TIMEZONE inválido: ${configuredTimeZone}`);
    errorsFound = true;
  }
} else {
  console.log('   ℹ️  REFLECT_TIMEZONE no configurado (se usará la zona horaria del sistema)');
}

// Verificar archivos necesarios
console.log('\n📄 Verificando archivos:');
const fs = await import('fs');
const files = [
  'server.js',
  'package.json',
  'README.md',
  '.env.example',
  'get-graph-id.js'
];

for (const file of files) {
  if (fs.existsSync(join(__dirname, file))) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - No encontrado`);
    errorsFound = true;
  }
}

// Resumen
console.log('\n' + '='.repeat(50));
if (errorsFound) {
  console.log('❌ Se encontraron errores en la verificación');
  console.log('   Por favor, revisa los problemas indicados arriba');
  process.exit(1);
} else {
  console.log('✅ ¡Todo está configurado correctamente!');
  console.log('\n📝 Próximos pasos:');
  console.log('   1. Edita .env con tu token real de Reflect');
  console.log('   2. Ejecuta: npm run setup');
  console.log('   3. Configura Claude Desktop con tu configuración');
  console.log('   4. ¡Listo para usar!');
  process.exit(0);
}
