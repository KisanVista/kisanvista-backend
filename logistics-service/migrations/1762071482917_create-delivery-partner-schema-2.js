// logistics-service/migrations/timestamp_create_delivery_partner_schema.js

exports.up = (pgm) => {
    // 1. Enable the PostGIS extension
    pgm.sql('CREATE EXTENSION IF NOT EXISTS postgis;');

    // 2. Create the delivery_partners table
    pgm.createTable('delivery_partners', {
        id: 'id', // Auto-incrementing primary key
        user_id: { type: 'integer', notNull: true, unique: true }, // References the user ID from the Auth Service
        name: { type: 'varchar(100)' },
        is_available: { type: 'boolean', default: true },
        // Use pgm.type('geometry(Point, 4326)') for the PostGIS column type
        last_known_location: { type: 'geometry(Point, 4326)' }, 
        updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
    });

    // 3. Create a spatial index for fast nearest-neighbor lookups
    pgm.sql('CREATE INDEX dp_location_gix ON delivery_partners USING GIST (last_known_location);');
};

exports.down = (pgm) => {
    pgm.dropTable('delivery_partners');
    pgm.sql('DROP EXTENSION IF EXISTS postgis;');
};