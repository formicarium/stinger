#!/usr/bin/env node

const express = require('express');
const fs = require('fs');
const del = require('del');
const simpleGit = require('simple-git/promise');
const path = require("path");
const { promisify } = require('util');
const { processManager } = require('./process-manager')
const bodyParser = require('body-parser')

const app = express();
const STINGER_PORT = process.env['STINGER_PORT'] || 3000;
const APP_PATH = path.resolve(process.env['APP_PATH'] || '/app');
const STINGER_SCRIPTS = process.env['STINGER_SCRIPTS'] || '/scripts';
const GIT_URI = process.env['GIT_URI'] || `http://git.${process.env['DEVSPACE']}/${process.env['SERVICE']}`

const startScript = path.resolve(STINGER_SCRIPTS, 'start.sh')

app.use(bodyParser.json())

const cloneRepo = async (deleteExisting = false, startAfterClone = false) => {
  try {
    console.log('Trying to clone repo')
    if (deleteExisting && await promisify(fs.exists)(`${APP_PATH}/.git`)) {
      await processManager.killProcess()
      console.log('Delete existing')
      await del(APP_PATH, { force: true })
      console.log('Deleted')
    }
    const repo = await simpleGit();
    await repo.clone(GIT_URI, APP_PATH);
    console.log('Repo was cloned')

    if (startAfterClone) {
      processManager.startProcess(startScript, [])
    }
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

const pullRepo = async (restartAfterPull = false) => {
  try {
    console.log('Pulling repo...')
    const repo = await simpleGit(APP_PATH);
    await repo.pull()
    console.log('Pull success')

    if (restartAfterPull) {
      await startProcess()
    }
    
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

const stopProcess = () => {
  return processManager.killProcess() 
}

const startProcess = async () => {
  await stopProcess()
  return processManager.startProcess(startScript, [])
}

// deprecate this?
const restartProcess = () => {
  return startProcess()
}

app.post('/pull', async (req, res) => {
  const {
    restartAfterPull = false,
  } = req.body

  if (await pullRepo(restartAfterPull)) {
    res.json({ ok: true }).status(202);
  } else {
    res.json({ ok: false }).status(500);
  }
});

app.post('/clone', async (req, res) => {
  const {
    deleteExisting = false,
    startAfterClone =  false,
  } = req.body
  
  if (await cloneRepo(deleteExisting, startAfterClone)) {
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
    await cloneRepo(true);
  }
  console.log('READY')
});
