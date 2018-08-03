const express = require('express');
const simpleGit = require('simple-git');
const path = require("path");
const app = express();

const PORT = process.env['STINGER_PORT'] || 3000;
const REMOTE = process.env['GIT_REMOTE'] || 'tanajura';
const APP_PATH = process.env['APP_PATH'] || '/app';

const pullRepo = () => {
  const repo = simpleGit(path.resolve(APP_PATH));
  try {
    repo.pull();
  } catch (err) {
    console.log(err);
  }
}

app.get('/pull', async (req, res) => {
  pullRepo();
  res.json({ ok: true });
});

app.listen(PORT, function () {
  console.log(`Stinger is listening on port: ${PORT}`);
  console.log(`APP_PATH: ${APP_PATH} - REMOTE: ${REMOTE}`)
});
