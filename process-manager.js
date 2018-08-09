const { spawn } = require('child_process');
var treeKill = require('tree-kill');
const { exec } = require('child_process_promise');

const kill = (pid) => new Promise((resolve, reject) => {
  treeKill(pid, (err) => {
    if (err) {
      return reject(err)
    }
    resolve()
  })
})

class ProcessManager {
  constructor(path, pArgs) {
    this.process = null
    this.path = path
    this.pArgs = pArgs
  }
  registerProcess(process) {
    this.process = process
  }

  getProcess() {
    return this.process
  }

  async startProcess() {
    await this.killProcess()
    console.log('Starting process!')
    console.log(`${this.path} ${(this.pArgs || []).join(' ')}`)
    try {
      const childProcess = spawn(this.path, this.pArgs || [], {
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
      console.log(`${process.pid}`)
      try {
        await kill(process.pid)
        await exec('killall java')
      } catch (err) {
        console.log(err)
      }
      
      this.process = null
      console.log('Process was killed')
      return true
    }
    console.log('No process was killed')
    return false
  }
}

module.exports = {
  ProcessManager,
}