const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

/**
 * Forks the current process
 * @param {*} numProcesses
 * @param {*} restartOnExit
 * @returns false if within master process, true if within forked process
 */
function forkCluster(numProcesses = numCPUs, restartOnExit = true) {
  if (!cluster.isMaster) return false;

  for (let i = 0; i < numProcesses; i++) cluster.fork();

  // unhandled exceptions will cause the current process to exit
  if (restartOnExit)
    cluster.on('exit', (worker, code, signal) => {
      cluster.fork();
    });

  return true;
}

module.exports = { forkCluster };
