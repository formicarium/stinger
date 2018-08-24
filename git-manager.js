const del = require('del');
const fs = require('fs-extra')
const simpleGit = require('simple-git/promise')
const { log } = require('./common')

class GitManager {
  constructor(baseFolder, remoteUrl, branch) {
    this.baseFolder = baseFolder
    this.remoteUrl = remoteUrl
    this.branch = branch
  }

  async clone() {
    log('Trying to clone repo')
    const repo = await simpleGit();
    const clone = await repo.clone(this.remoteUrl, this.baseFolder, ['-b', this.branch]);
    log('Repo was cloned')
    return clone
  }

  async pull() {
    log('Pulling repo...')
    const repo = await simpleGit(this.baseFolder);
    const pull = await repo.pull('origin', this.branch)
    log('Pull success')  
    return pull
  }

  async fetch() {
    log('Fetching')
    const repo = await simpleGit(this.baseFolder)
    const fetch = await repo.fetch('origin', this.branch)
    log('Fetch success')
    return fetch
  }

  async resetHard() {
    log('Resetting')
    const repo = await simpleGit(this.baseFolder)
    const reset = await repo.reset(['--hard', `origin/${this.branch}`])
    log('Reset hard success')
  }

  async delete() {
    log('Delete existing')
    const delResponse = await del(this.baseFolder, { force: true })
    log('Deleted')
    return delResponse
  }

  async repoExists() {
    return fs.pathExists(`${this.baseFolder}/.git`)
  }
}



module.exports = {
  GitManager
}