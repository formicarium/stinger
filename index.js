const express = require('express');
const simpleGit = require('simple-git');
const path = require("path");
const app = express();

const PORT = process.env['STINGER_PORT'] || 3000;
const REMOTE = process.env['GIT_REMOTE'] || 'tanajura';
const APP_PATH = process.env['APP_PATH'] || '/app';

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

app.get('/pull', async (req, res) => {
  res.json({ ok: pullRepo() });
});

app.listen(PORT, function () {
  console.log(`Stinger is listening on port: ${PORT}`);
  console.log(`APP_PATH: ${APP_PATH} - REMOTE: ${REMOTE}`)
});
