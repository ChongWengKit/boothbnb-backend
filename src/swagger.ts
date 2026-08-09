import fs from 'fs';
import { createSwaggerDocument } from './swagger-generator.js';

const outputFile = new URL('./swagger-output.json', import.meta.url);
const swaggerDoc = createSwaggerDocument();

await fs.promises.writeFile(outputFile, JSON.stringify(swaggerDoc, null, 2));
console.log(`Swagger document generated at ${outputFile.pathname}`);