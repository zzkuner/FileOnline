const { Client } = require('pg');

async function grantPermissions() {
    const adminClient = new Client({
        host: '47.79.88.14',
        port: 5432,
        database: 'test',
        user: 'test',
        password: 'dt3AB42K3CpNmyPN'  // 尝试用管理员密码
    });

    try {
        await adminClient.connect();
        console.log('✓ Connected to PostgreSQL as admin');

        // 授予权限
        const queries = [
            'GRANT ALL PRIVILEGES ON SCHEMA public TO test;',
            'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO test;',
            'GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO test;',
            'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO test;',
            'ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO test;'
        ];

        for (const query of queries) {
            await adminClient.query(query);
            console.log('✓ Executed:', query);
        }

        console.log('\n✓ All permissions granted successfully!');
    } catch (error) {
        console.error('✗ Error:', error.message);
        process.exit(1);
    } finally {
        await adminClient.end();
    }
}

grantPermissions();
