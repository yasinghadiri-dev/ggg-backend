const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function runMigrations() {
  const tmpDir = path.resolve(__dirname, '../tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  const dbFile = path.join(tmpDir, 'test.sqlite');

  // remove existing to ensure clean slate
  try { if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile); } catch (e) { /* ignore */ }

  const configPath = path.resolve(__dirname, '../src/config/sequelize-cli.js');

  const env = Object.assign({}, process.env, {
    DB_DIALECT: 'sqlite',
    DB_STORAGE: dbFile
  });

  // Try several cross-platform ways to resolve the local sequelize CLI script,
  // then invoke it with the current Node executable to avoid .cmd wrappers and npx.
  let tried = [];
  try {
    // 1) Prefer the package's lib/sequelize based on package.json location
    try {
      const pkgPath = require.resolve('sequelize-cli/package.json');
      const pkgDir = path.dirname(pkgPath);
      const candidate = path.join(pkgDir, 'lib', 'sequelize');
      tried.push(candidate);
      if (fs.existsSync(candidate)) {
        execFileSync(process.execPath, [candidate, 'db:migrate', '--config', configPath, '--env', 'test'], { stdio: 'inherit', env });
        return dbFile;
      }
    } catch (e) {
      // ignore resolution failure, try other fallbacks
    }

    // 2) Try the bin path commonly referenced by some versions
    try {
      const candidate2 = require.resolve('sequelize-cli/bin/sequelize');
      tried.push(candidate2);
      if (fs.existsSync(candidate2)) {
        execFileSync(process.execPath, [candidate2, 'db:migrate', '--config', configPath, '--env', 'test'], { stdio: 'inherit', env });
        return dbFile;
      }
    } catch (e) {
      // ignore
    }

    // 3) Try the package 'sequelize' provided bin (older layouts)
    try {
      const candidate3 = require.resolve('sequelize/bin/sequelize');
      tried.push(candidate3);
      if (fs.existsSync(candidate3)) {
        execFileSync(process.execPath, [candidate3, 'db:migrate', '--config', configPath, '--env', 'test'], { stdio: 'inherit', env });
        return dbFile;
      }
    } catch (e) {
      // ignore
    }

    // 4) Last-ditch: try node_modules/.bin (POSIX wrapper) but avoid .cmd on Windows
    try {
      const nmBin = path.resolve(process.cwd(), 'node_modules', '.bin', 'sequelize');
      tried.push(nmBin);
      if (fs.existsSync(nmBin)) {
        // On POSIX this is an executable shell script; on Windows it's a .cmd/.ps1
        // Exec with Node if it's a JS file, otherwise exec directly
        if (nmBin.endsWith('.js') || nmBin.endsWith('.mjs') || nmBin.endsWith('.cjs')) {
          execFileSync(process.execPath, [nmBin, 'db:migrate', '--config', configPath, '--env', 'test'], { stdio: 'inherit', env });
        } else {
          // Execute as a program (this will work on Linux; on Windows .cmd may still appear,
          // but this path is only attempted last)
          execFileSync(nmBin, ['db:migrate', '--config', configPath, '--env', 'test'], { stdio: 'inherit', env });
        }
        return dbFile;
      }
    } catch (e) {
      // ignore
    }

    // If we get here, nothing resolved
    const triedMsg = tried.length ? `Tried paths:\n- ${tried.join('\n- ')}` : 'No candidate paths tried.';
    console.error('Could not resolve local sequelize-cli executable. Ensure `sequelize-cli` is installed locally (devDependency).');
    console.error(triedMsg);
    throw new Error('Failed to resolve local sequelize-cli');
  } catch (err) {
    // rethrow after logging for caller visibility
    console.error('Migration runner failed:', err && err.message ? err.message : err);
    throw err;
  }
}

module.exports = { runMigrations };

