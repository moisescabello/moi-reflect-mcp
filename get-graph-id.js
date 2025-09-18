#!/usr/bin/env node
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const REFLECT_TOKEN = process.env.REFLECT_TOKEN;

if (!REFLECT_TOKEN) {
  console.error('❌ Error: REFLECT_TOKEN no encontrado en .env');
  console.log('\nPor favor:');
  console.log('1. Copia .env.example a .env');
  console.log('2. Añade tu token de Reflect en el archivo .env');
  console.log('3. Vuelve a ejecutar este script\n');
  process.exit(1);
}

console.log('🔍 Obteniendo información de tu cuenta Reflect...\n');

async function getAccountInfo() {
  try {
    // Obtener información del usuario
    const userResponse = await axios.get('https://reflect.app/api/users/me', {
      headers: { 'Authorization': `Bearer ${REFLECT_TOKEN}` }
    });
    
    console.log('👤 Usuario:');
    console.log(`   Email: ${userResponse.data.email}`);
    console.log(`   Nombre: ${userResponse.data.name || 'No especificado'}`);
    console.log(`   UID: ${userResponse.data.uid}`);
    console.log();

    // Obtener graphs
    const graphsResponse = await axios.get('https://reflect.app/api/graphs', {
      headers: { 'Authorization': `Bearer ${REFLECT_TOKEN}` }
    });

    const graphs = graphsResponse.data;
    
    if (graphs.length === 0) {
      console.log('⚠️  No se encontraron graphs en tu cuenta');
      return;
    }

    console.log('📊 Graphs disponibles:');
    graphs.forEach((graph, index) => {
      console.log(`\n   ${index + 1}. ${graph.name || 'Graph sin nombre'}`);
      console.log(`      ID: ${graph.id}`);
      console.log(`      👆 Copia este ID y pégalo en tu archivo .env como GRAPH_ID`);
    });

    if (graphs.length === 1) {
      console.log('\n✅ Solo tienes un graph. Copia el ID de arriba en tu .env:');
      console.log(`   GRAPH_ID=${graphs[0].id}`);
    } else {
      console.log('\n📝 Tienes múltiples graphs. Elige el que quieras usar y copia su ID en tu .env');
    }

    // Verificar que todo funcione
    if (process.env.GRAPH_ID && graphs.some(g => g.id === process.env.GRAPH_ID)) {
      console.log('\n✅ Tu GRAPH_ID actual en .env es válido');
    } else if (process.env.GRAPH_ID) {
      console.log('\n⚠️  El GRAPH_ID en tu .env no coincide con ningún graph disponible');
    }

  } catch (error) {
    console.error('❌ Error al conectar con Reflect:');
    
    if (error.response) {
      if (error.response.status === 401) {
        console.error('   Token inválido o expirado. Verifica tu REFLECT_TOKEN');
      } else {
        console.error(`   ${error.response.status}: ${error.response.statusText}`);
      }
    } else if (error.request) {
      console.error('   No se pudo conectar con el servidor de Reflect');
    } else {
      console.error('   ', error.message);
    }
    
    console.log('\n💡 Sugerencias:');
    console.log('   1. Verifica que tu token sea correcto');
    console.log('   2. Asegúrate de tener conexión a internet');
    console.log('   3. Revisa que el token no haya expirado');
    console.log('   4. Genera un nuevo token en https://reflect.app/developer si es necesario');
  }
}

getAccountInfo();
