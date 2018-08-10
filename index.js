#!/usr/bin/env node

const express = require('express');
const path = require("path");
const { ProcessManager } = require('./process-manager')
const { GitManager } = require('./git-manager')
const bodyParser = require('body-parser')
const { asyncHandler } = require('./common')

/**
 * Consts
 */
const STINGER_PORT = process.env['STINGER_PORT'] || 3000;
const APP_PATH = path.resolve(process.env['APP_PATH'] || '/app');
const STINGER_SCRIPTS = process.env['STINGER_SCRIPTS'] || '/scripts';
const GIT_URI = process.env['GIT_URI'] || `http://git.${process.env['DEVSPACE']}/${process.env['SERVICE']}`
const START_AFTER_PULL = process.env['START_AFTER_PULL'] || true
const startScript = path.resolve(STINGER_SCRIPTS, 'start.sh')
const cleanupScript = path.resolve(STINGER_SCRIPTS, 'cleanup.sh')

/**
 * Express
 */
const app = express();
app.use(bodyParser.json())


/**
 * Managers
 */
const gitManager = new GitManager(APP_PATH, GIT_URI)
const processManager = new ProcessManager(startScript, [], APP_PATH, cleanupScript)

/**
 * Controllers
 */

/**
 * stopProcess
 */
const stopProcess = () => {
  return processManager.killProcess() 
}

/**
 * startProcess
 */
const startProcess = async () => {
  return processManager.startProcess()
}

/**
 * cloneRepo
 * @param {boolean} deleteExisting 
 * @param {boolean} startAfterClone 
 */
const cloneRepo = async (deleteExisting = false, startAfterClone = false) => {
  if (deleteExisting && await gitManager.repoExists()) {
    await gitManager.delete()
  }

  await gitManager.clone()

  if (startAfterClone) {
    await processManager.startProcess()
  }
  return true;
}

/**
 * pullRepo
 * @param {boolean} restartAfterPull 
 */
const pullRepo = async (restartAfterPull) => {
  await gitManager.pull()
  if (restartAfterPull) {
    await processManager.startProcess()
  }
  
  return true;
}

/**
 * HTTP Handlers
 */
app.post('/pull', asyncHandler(async (req, res) => {
  const {
    restartAfterPull = false,
  } = req.body

  await pullRepo(START_AFTER_PULL || restartAfterPull)
  res.json({ ok: true }).status(202);
}))

app.post('/clone', asyncHandler(async (req, res) => {
  const {
    deleteExisting = false,
    startAfterClone =  false,
  } = req.body
  await cloneRepo(deleteExisting, startAfterClone)
  res.json({ ok: true }).status(201)
}))

app.post('/stop', asyncHandler(async (req, res) => {
  await stopProcess()
  res.json({ ok: true }).status(202);
}))

app.post('/start', asyncHandler(async (req, res) => {
  await startProcess()
  res.json({ ok: true }).status(202);
}))


app.get('/health', asyncHandler(async (req, res) => {
  console.log('olá')
  res.json({
    health: 'ok'
  })
}))
/**
 * Express error handling
 */
app.use((err, req, res, next) => {
  const status = 500
  const payload = {
    statusCode: 500,
    error: 'Internal Server Error',
    message: err.toString(),
  }
  res.status(status).json(payload)
})

app.listen(STINGER_PORT, async () => {
  console.log(`Stinger is listening on port: ${STINGER_PORT}`);
  console.log(`APP_PATH: ${APP_PATH}`)
  console.log(`STINGER_SCRIPTS: ${STINGER_SCRIPTS}`)
  console.log(`GIT_URI: ${GIT_URI}`)
  console.log(`START_AFTER_PULL: ${START_AFTER_PULL}`)

  if (process.env['STARTUP_CLONE'] === 'true') {
    if (await gitManager.repoExists()) {
      console.log('Repo already presented. Skipping initial clone')
    } else {
      console.log(`Cloning Initial Version...`)
      await gitManager.clone()
    }
  }
  await processManager.startProcess()
});

