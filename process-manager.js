const { spawn } = require('child_process');
var treeKill = require('tree-kill');
const { exec } = require('node-exec-promise');

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
    console.log(`Starting process: ${this.path} ${(this.pArgs || []).join(' ')}`)
    try {
      const childProcess = spawn(this.path, this.pArgs || [], {
        stdio: [process.stdin, process.stdout, process.stderr],
        cwd: this.cwd
      })
      this.registerProcess(childProcess)
      console.log('Process started!')
      return true
    } catch (err) {
      console.log('No process was started')
      console.log(err)
      return false
    }
    
  }

  async killProcess() {
    console.log('Trying to kill process...')
    const process = this.getProcess()
    if (process) {
      console.log(`PID: ${process.pid}`)
      await kill(process.pid)
      .catch((err) => {
        console.log('Error killing process tree')
        console.log(err)
      })
      .then(() => {
        console.log('Process tree was killed')
      })
      await exec(cleanupScript)
      .catch((err) => {
        console.log('Error running cleanup script')
        console.log(err)
      })
      .then(() => {
        console.log('Cleanup script was run')
      })
      
      this.process = null
      return true
    }
    console.log('No process was killed')
    return false
  }
}

module.exports = {
  ProcessManager,
}