const del = require('del');
const fs = require('fs-extra')
const simpleGit = require('simple-git/promise')
const { log } = require('./common')

class GitManager {
  constructor(baseFolder, remoteUrl) {
    this.baseFolder = baseFolder
    this.remoteUrl = remoteUrl
  }

  async clone() {
    log('Trying to clone repo')
    const repo = await simpleGit();
    const clone = await repo.clone(this.remoteUrl, this.baseFolder, ['-b', 'tanajura']);
    log('Repo was cloned')
    return clone
  }

  async pull() {
    log('Pulling repo...')
    const repo = await simpleGit(this.baseFolder);
    const pull = await repo.pull('origin', 'tanajura')
    log('Pull success')  
    return pull
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