const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function runMigrations() {
  const tmpDir = path.resolve(__dirname, '../tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const dbFile = path.join(tmpDir, 'test.sqlite');
  // remove existing to ensure clean slate
  try { if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile); } catch (e) { /* ignore */ }

  // Resolve sequelize-cli binary inside backend/node_modules/.bin
  // Use the .cmd wrapper on Windows, otherwise use the unix executable name
  const binName = process.platform === 'win32' ? 'sequelize-cli.cmd' : 'sequelize-cli';
  const sequelizeCli = path.resolve(__dirname, '../node_modules/.bin', binName);
  const configPath = path.resolve(__dirname, '../src/config/sequelize-cli.js');

  // Run migrations with DB_STORAGE pointing to our sqlite file
  const env = Object.assign({}, process.env, {
    DB_DIALECT: 'sqlite',
    DB_STORAGE: dbFile
  });

  if (process.platform === 'win32') {
    // On Windows, execute the .cmd wrapper via cmd.exe /c
    execFileSync('cmd.exe', ['/c', sequelizeCli, 'db:migrate', '--config', configPath, '--env', 'test'], { stdio: 'inherit', env });
  } else {
    execFileSync(sequelizeCli, ['db:migrate', '--config', configPath, '--env', 'test'], { stdio: 'inherit', env });
  }
  // return path so tests can use same storage
  return dbFile;
}

module.exports = { runMigrations };
