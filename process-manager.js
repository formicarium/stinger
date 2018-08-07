const { spawn } = require('child_process');
const { promisify } = require('util');
const terminate = require('terminate')
const kill = promisify(terminate)

class ProcessManager {
  constructor() {
    this.process = null
  }
  registerProcess(process) {
    this.process = process
  }

  getProcess() {
    return this.process
  }

  async startProcess(path, args) {
    const childProcess = spawn(path, args, {
      stdio: [process.stdin, process.stdout, process.stderr]
    })
    this.registerProcess(childProcess)
    return childProcess
  }

  async killProcess() {
    const process = this.getProcess()
    if (process) {
      await kill(process.pid)
      this.process = null
      return true
    }
    return false
  }
}

const processManager = new ProcessManager()
module.exports = {
  processManager
}