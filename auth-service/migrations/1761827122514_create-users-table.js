/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
// export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
// auth-service/migrations/timestamp_create_users_table.js

exports.up = (pgm) => {
    pgm.createTable('users', {
        id: 'id', // Auto-incrementing primary key
        mobile: { type: 'varchar(15)', notNull: true, unique: true },
        password_hash: { type: 'varchar(255)', notNull: true },
        name: { type: 'varchar(100)', notNull: true },
        role: { type: 'varchar(50)', notNull: true, default: 'farmer' }, // All 4 roles stored here
        state: { type: 'varchar(50)' },
        district: { type: 'varchar(50)' },
        village: { type: 'varchar(100)' },
        referral_code: { type: 'varchar(50)' },
        registered_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('users');
};
