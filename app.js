const { FileSystem, Terminal } = require('./terminal');

process.stdin.resume();
process.stdin.setEncoding("ascii");
var input = "";

process.stdin.on("data", function (chunk) {
  input += chunk;
});

process.stdin.on("end", function () {
  const fileSystem = new FileSystem();
  const terminal = new Terminal(fileSystem);

  const commands = input.split('\n');
  commands.forEach(command => {
      terminal.execute(command);
  });
});
