import swaggerAutogen from 'swagger-autogen';
const domain = process.env.DOMAIN || 'localhost:3001';

const doc = {
  info: { title: 'Boothbnb API', description: '' },
  host: domain,
  schemes: ['https'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./index.ts']; 

swaggerAutogen(outputFile, endpointsFiles, doc);