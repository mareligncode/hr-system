import sequelize from './config/database.js';
import { ShiftAssignment, ShiftRotation, ShiftType } from './models/index.js';

async function syncDb() {
    try {
        console.log("Syncing ShiftRotation model...");
        await ShiftRotation.sync({ alter: true });

        console.log("Syncing ShiftType model...");
        await ShiftType.sync({ alter: true });

        console.log("Syncing ShiftAssignment model...");
        await ShiftAssignment.sync({ alter: true });

        console.log("Database synced successfully");
    } catch (err) {
        console.error("Error syncing DB:", err);
    } finally {
        process.exit(0);
    }
}

syncDb();
