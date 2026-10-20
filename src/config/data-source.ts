import 'reflect-metadata';
import 'dotenv/config'
import { DataSource } from 'typeorm';
import { User } from '../entities/User.js';

const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,


    entities: [User],
    migrations: [process.cwd() + '/dist/migrations/*.js'],

    synchronize: false,
    logging: false
})

export default AppDataSource;