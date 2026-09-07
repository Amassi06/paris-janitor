import swaggerAutogen from 'swagger-autogen';
import { ENV } from '../config/env.js';

const doc = {
  info: {
    title: 'API Services',
    description: 'Documentation générée automatiquement',
    version: '1.0.0',
  },
  host: ENV.API_URL, 
  schemes: ['http'],
};

const outputFile = 'src/swagger/swagger-output.json';
const endpointsFiles = ['src/server.ts'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc);