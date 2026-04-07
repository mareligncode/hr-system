import sequelize from './config/database.js';
import { DataTypes } from 'sequelize';

async function fixSchema() {
    try {
        const queryInterface = sequelize.getQueryInterface();
        const tableDefinition = await queryInterface.describeTable('job_postings');

        if (!tableDefinition.deleted_at) {
            console.log('Adding deleted_at column to job_postings table...');
            await queryInterface.addColumn('job_postings', 'deleted_at', {
                type: DataTypes.DATE,
                allowNull: true
            });
            console.log('Successfully added deleted_at to job_postings.');
        } else {
            console.log('deleted_at column already exists in job_postings.');
        }

        // Also ensure applicants and job_applications have it if we decide to enable paranoid later
        const applicantsTable = await queryInterface.describeTable('applicants');
        if (!applicantsTable.deleted_at) {
            console.log('Adding deleted_at column to applicants table...');
            await queryInterface.addColumn('applicants', 'deleted_at', {
                type: DataTypes.DATE,
                allowNull: true
            });
        }

        const applicationsTable = await queryInterface.describeTable('job_applications');
        if (!applicationsTable.deleted_at) {
            console.log('Adding deleted_at column to job_applications table...');
            await queryInterface.addColumn('job_applications', 'deleted_at', {
                type: DataTypes.DATE,
                allowNull: true
            });
        }

        console.log('Schema fix completed.');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing schema:', error);
        process.exit(1);
    }
}

fixSchema();
