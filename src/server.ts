
import 'reflect-metadata';
import 'dotenv/config';

import app from './app.js';
import AppDataSource from './config/data-source.js';

const PORT = Number(process.env.PORT) || 3000;

async function startServer(): Promise<void> {
  try{
    await AppDataSource.initialize();

    console.log('MySQL connected successfully through TypeORM.');

    app.listen(PORT, () => {
      console.log(`JobPilot API running at http://localhost:${PORT}`)
    });
  } catch(error){
    console.error('Application startup failed:', error);
    process.exitCode = 1;
  }
}

startServer();
