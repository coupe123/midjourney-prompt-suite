module.exports = {
  run: [
    {
      method: "fs.write",
      params: {
        path: "package.json",
        text: JSON.stringify({
          "name": "midjourney-prompt-suite",
          "version": "1.0.0",
          "main": "server.js",
          "dependencies": {
            "express": "^4.18.2"
          }
        }, null, 2)
      }
    },
    {
      method: "shell.run",
      params: {
        message: "npm install"
      }
    }
  ]
}