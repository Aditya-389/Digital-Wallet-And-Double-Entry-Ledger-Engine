import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client.ts'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!
})

export const prisma = new PrismaClient({ adapter })


export async function connectDB() {
    try {
        await prisma.$connect();
        console.log("Database Connected Successfully");
        
    }catch(error) {
        console.error("Database Connection Failed ", error);
        process.exit(1);
    }
}
    