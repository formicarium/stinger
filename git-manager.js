const del = require('del');
const fs = require('fs-extra')
const simpleGit = require('simple-git/promise')

class GitManager {
  constructor(baseFolder, remoteUrl) {
    this.baseFolder = baseFolder
    this.remoteUrl = remoteUrl
  }

  async clone() {
    console.log('Trying to clone repo')
    const repo = await simpleGit();
    const clone = await repo.clone(this.remoteUrl, this.baseFolder);
    console.log('Repo was cloned')
    return clone
  }

  async pull() {
    console.log('Pulling repo...')
    const repo = await simpleGit(this.baseFolder);
    const pull = await repo.pull()
    console.log('Pull success')  
    return pull
  }

  async delete() {
    console.log('Delete existing')
    const delResponse = await del(this.baseFolder, { force: true })
    console.log('Deleted')
    return delResponse
  }

  async repoExists() {
    return fs.pathExists(`${this.baseFolder}/.git`)
  }
}



module.exports = {
  GitManager
}