const express = require('express');
const simpleGit = require('simple-git');
const path = require("path");
const { promisify } = require('util');
const { execFile } = require('child_process');
const app = express();
const execFileP = promisify(execFile);

const PORT = process.env['STINGER_PORT'] || 3000;
const REMOTE = process.env['GIT_REMOTE'] || 'tanajura';
const APP_PATH = process.env['APP_PATH'] || '/app';
const SCRIPTS_PATH = process.env['STINGER_SCRIPTS'] || '/scripts';

const pullRepo = () => {
  try {
    const repo = simpleGit(path.resolve(APP_PATH));
    repo.pull();
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

const restartProcess = async () => {
  try {
    await execFileP(path.resolve(SCRIPTS_PATH, 'restart.sh'));
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

const stopProcess = async () => {
  try {
    await execFileP(path.resolve(SCRIPTS_PATH, 'stop.sh'));
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

const startProcess = async () => {
  try {
    await execFileP(path.resolve(SCRIPTS_PATH, 'start.sh'));
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

app.post('/pull', async (req, res) => {
  res.json({ ok: pullRepo() });
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

app.listen(PORT, function () {
  console.log(`Stinger is listening on port: ${PORT}`);
  console.log(`APP_PATH: ${APP_PATH}\nREMOTE: ${REMOTE}\nSCRIPTS: ${SCRIPTS_PATH}`)
});
