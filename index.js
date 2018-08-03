const express = require('express');
const simpleGit = require('simple-git/promise');
const path = require("path");
const { promisify } = require('util');
const { execFile } = require('child_process');
const app = express();
const execFileP = promisify(execFile);

const STINGER_PORT = process.env['STINGER_PORT'] || 3000;
const GIT_REMOTE = process.env['GIT_REMOTE'] || 'tanajura';
const APP_PATH = process.env['APP_PATH'] || '/app';
const STINGER_SCRIPTS = process.env['STINGER_SCRIPTS'] || '/scripts';

const pullRepo = async () => {
  try {
    const repo = await simpleGit(path.resolve(APP_PATH));
    await repo.pull()
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

const restartProcess = async () => {
  try {
    await execFileP(path.resolve(STINGER_SCRIPTS, 'restart.sh'));
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

const stopProcess = async () => {
  try {
    await execFileP(path.resolve(STINGER_SCRIPTS, 'stop.sh'));
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

const startProcess = async () => {
  try {
    await execFileP(path.resolve(STINGER_SCRIPTS, 'start.sh'));
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

app.post('/pull', async (req, res) => {
  res.json({ ok: await pullRepo() });
});

app.post('/restart', async (req, res) => {
  res.json({ ok: await restartProcess() });
});

app.post('/stop', async (req, res) => {
  res.json({ ok: await stopProcess() });
});

app.post('/start', async (req, res) => {
  res.json({ ok: await startProcess() });
});

app.listen(STINGER_PORT, function () {
  console.log(`Stinger is listening on port: ${STINGER_PORT}`);
  console.log(`APP_PATH: ${APP_PATH}\nREMOTE: ${GIT_REMOTE}\nSCRIPTS: ${STINGER_SCRIPTS}`)
});
