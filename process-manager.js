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
    console.log('Starting process...')
    try {
      const childProcess = spawn(path, args, {
        stdio: [process.stdin, process.stdout, process.stderr]
      })
      this.registerProcess(childProcess)
      console.log('Process started!')
      return true
    } catch (err) {
      console.log('No process was started')

      return false
    }
    
  }

  async killProcess() {
    console.log('Trying to kill process...')
    const process = this.getProcess()
    if (process) {
      await kill(process.pid)
      this.process = null
      console.log('Process was killed')
      return true
    }
    console.log('No process was killed')
    return false
  }
}

const processManager = new ProcessManager()
module.exports = {
  processManager
}