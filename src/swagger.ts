import swaggerAutogen from 'swagger-autogen';
const domain = process.env.BACKEND_DOMAIN || 'localhost:3001';

const doc = {
  info: { title: 'Boothbnb API', description: '' },
  host: domain,
  schemes: ['https'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      scheme: 'bearer',
      in: 'header',
    },
  },
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./index.js']; 

swaggerAutogen(outputFile, endpointsFiles, doc);