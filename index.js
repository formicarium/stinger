const express = require('express');
const fs = require('fs');
const del = require('del');
const simpleGit = require('simple-git/promise');
const path = require("path");
const { promisify } = require('util');
const { execFile, spawn } = require('child_process');
const app = express();
const execFileP = promisify(execFile);

const STINGER_PORT = process.env['STINGER_PORT'] || 3000;
const APP_PATH = path.resolve(process.env['APP_PATH'] || '/app');
const STINGER_SCRIPTS = process.env['STINGER_SCRIPTS'] || '/scripts';
const GIT_URI = process.env['GIT_URI'] || `http://git.${process.env['DEVSPACE']}/${process.env['SERVICE']}`

const cloneRepo = async (deleteExisting = true) => {
  try {
    if (deleteExisting && await promisify(fs.exists)(`${APP_PATH}/.git`)) {
      await del(APP_PATH, { force: true })
    }
    const repo = await simpleGit();
    await repo.clone(GIT_URI, APP_PATH);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

const pullRepo = async () => {
  try {
    const repo = await simpleGit(APP_PATH);
    await repo.pull()
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

const runScript = async (script) => {
  try {
    const file = path.resolve(STINGER_SCRIPTS, script)
    const childProcess = spawn(file, [], {
      stdio: [process.stdin, process.stdout, process.stderr]
    })
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

const restartProcess = () => runScript('restart.sh')
const stopProcess = () => runScript('stop.sh')
const startProcess = () => runScript('start.sh')

app.post('/pull', async (req, res) => {
  if (await pullRepo()) {
    res.json({ ok: true }).status(202);
  } else {
    res.json({ ok: false }).status(500);
  }
});

app.post('/clone', async (req, res) => {
  if (await cloneRepo()) {
    res.json({ ok: true }).status(201)
  } else {
    res.json({ ok: false }).status(500)
  }
});

app.post('/restart', async (req, res) => {
  if (await restartProcess()) {
    res.json({ ok: true }).status(202);
  } else {
    res.json({ ok: false }).status(500);
  }
});

app.post('/stop', async (req, res) => {
  if (await stopProcess()) {
    res.json({ ok: true }).status(202);
  } else {
    res.json({ ok: false }).status(500);
  }
});

app.post('/start', async (req, res) => {
  if (await startProcess()) {
    res.json({ ok: true }).status(202);
  } else {
    res.json({ ok: false }).status(500);
  }
});

app.listen(STINGER_PORT, async () => {
  console.log(`Stinger is listening on port: ${STINGER_PORT}`);
  console.log(`APP_PATH: ${APP_PATH}\nGIT: ${GIT_URI}\nSCRIPTS: ${STINGER_SCRIPTS}`)
  if (process.env['STARTUP_CLONE'] === 'true') {
    console.log(`Cloning Initial Version...`)
    await cloneRepo(false);
  }
  console.log('READY')
});
