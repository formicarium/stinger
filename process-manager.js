const { spawn } = require('child_process');
var treeKill = require('tree-kill');
const { exec } = require('node-exec-promise');
const { log } = require('./common')
const fs = require('fs-extra')

const kill = (pid) => new Promise((resolve, reject) => {
  treeKill(pid, (err) => {
    if (err) {
      return reject(err)
    }
    resolve()
  })
})

class ProcessManager {
  constructor(path, pArgs = [], cwd, cleanupScript) {
    this.process = null
    this.path = path
    this.pArgs = pArgs
    this.cwd = cwd
    this.cleanupScript = cleanupScript
  }
  registerProcess(process) {
    this.process = process
  }

  getProcess() {
    return this.process
  }

  async startProcess() {
    await this.killProcess()
    log(`Starting process: ${this.path} ${(this.pArgs || []).join(' ')}`)
    try {
      const childProcess = spawn(this.path, this.pArgs || [], {
        stdio: [process.stdin, process.stdout, process.stderr],
        cwd: this.cwd
      })
      this.registerProcess(childProcess)
      log('Process started!')
      return true
    } catch (err) {
      log('No process was started')
      log(err)
      return false
    }
    
  }

  async killProcess() {
    log('Trying to kill process...')
    const process = this.getProcess()
    if (process) {
      log(`PID: ${process.pid}`)
      await kill(process.pid)
      .catch((err) => {
        log('Error killing process tree')
        log(err)
      })
      .then(() => {
        log('Process tree was killed')
      })
      if (await fs.pathExistsSync(this.cleanupScript)) {
        log(`Running cleanup script: ${this.cleanupScript}`)
        await exec(this.cleanupScript, {
          cwd: this.cwd,
        })
        .catch((err) => {
          log('Error running cleanup script')
          log(err)
        })
        .then((program) => {
          log('Cleanup script was run')
          log(program.stdout)
        })
      } else {
        log(`No cleanup script found at ${this.cleanupScript}`)
      }
      this.process = null
      return true
    }
    log('No process was killed')
    return false
  }
}

module.exports = {
  ProcessManager,
}