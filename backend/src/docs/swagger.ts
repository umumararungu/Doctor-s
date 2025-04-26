import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Doctor Appointment API',
    version: '1.0.0',
    description: 'API documentation for doctor and patient system',
  },
  servers: [
    {
      url: 'http://localhost:5000',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // files containing annotations
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
