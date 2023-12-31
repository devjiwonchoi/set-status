#!/usr/bin/env node
import { exec } from 'child_process'
import arg from 'arg'
import { runServer } from '../server'

function main() {
  const args = arg({
    '--cmd': String,
  })
  const cmd = args['--cmd']
  if (cmd) {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error(err)
        return
      }
      console.log(stdout)
      console.error(stderr)
    })
  }
  runServer()
}

main()
