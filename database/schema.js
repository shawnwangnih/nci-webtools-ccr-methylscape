require('dotenv').config()

const fs = require('fs');
const { DATABASE_PATH } = process.env;

(async function main() {

    if (fs.existsSync(DATABASE_PATH)) {
        fs.unlinkSync(DATABASE_PATH);
    }

    const knex = require('knex')({
        client: 'better-sqlite3',
        connection: {
            filename: DATABASE_PATH
        },
        useNullAsDefault: true
    });

    /**
     * Create the annotation table.
     */
     await knex.schema.createTable('annotation', function(table) {
        table.increments('id');
        table.string('organSystem');
        table.string('embedding');
        table.string('class');
        table.string('label');
        table.double('x');
        table.double('y');
        table.string('study');
        table.string('institution');
        table.string('category');
        table.string('matched');
        table.double('os_months');
        table.integer('os_status');
    });

    /**
     * Create the user table.
     * Each user must have a unique name
     */
    await knex.schema.createTable('user', function(table) {
        table.increments('id');
        table.string('name').notNullable().unique();
        table.string('firstName');
        table.string('lastName');
        table.string('email');
        table.boolean('active').defaultTo(false);
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });


    /**
     * Create the role table.
     * Each role must have a unique name
     * Each role can have a description
     * Roles can be associated with any number of users through the userRole table
     */
    await knex.schema.createTable('role', function(table) {
        table.increments();
        table.string('name').notNullable().unique();
        table.string('description');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
    
    /**
     * Creates the userRole table.
     * Maps a user to a role (many-to-many relationship)
     */
    await knex.schema.createTable('userRole', function(table) {
        table.increments();
        table.integer('userId').notNullable().references('user.id');
        table.integer('roleId').notNullable().references('role.id');;
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
    
    /**
     * Creates the rolePolicy table.
     * Maps a role to policies (each role can have many policies)
     * Each policy defines an action and a resource
     * Example actions: CreateUser, ReadUser, UpdateUser, DeleteUser
     * Example resources: *, 'user:1', etc
     * Application logic determines how to to enforce policies 
     * and how to map resources to entities
     */
    await knex.schema.createTable('rolePolicy', function(table) {
        table.increments();
        table.integer('roleId').notNullable().references('role.id');
        table.string('action');
        table.string('resource');
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
    
    process.exit(0);
})()
