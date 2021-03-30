require('mocha-sinon');
const expect = require('chai').expect;

const { FileSystem, Terminal } = require('../terminal');

describe('Terminal tests', function() {
  beforeEach(function() {
    this.sinon.stub(console, 'log');
  });

  describe('Terminal pwd: current directory', function() {
    it('Should return the root directory when a new terminal is created', function() {
      const fileSystem = new FileSystem();
      const terminal = new Terminal(fileSystem);

      terminal.pwd();

      expect(console.log.calledWith('/root')).to.be.true;
    });
  });

  describe('Terminal ls: list directories', function() {
    it('Should return "home" as one of the directories in the root when no parameter is given', function() {
      const fileSystem = new FileSystem();
      const terminal = new Terminal(fileSystem);

      terminal.mkdir('home');
      terminal.ls();

      expect(console.log.calledWith('home')).to.be.true;
    });

    it('Should return "home" as one of the directories in the root when "." parameter is given', function() {
      const fileSystem = new FileSystem();
      const terminal = new Terminal(fileSystem);

      terminal.mkdir('home');
      terminal.ls('.');

      expect(console.log.calledWith('home')).to.be.true;
    });

    it('Should return "home" as one of the directories in the root when "/" parameter is given', function() {
      const fileSystem = new FileSystem();
      const terminal = new Terminal(fileSystem);

      terminal.mkdir('home');
      terminal.ls('/');

      expect(console.log.calledWith('home')).to.be.true;
    });

    it('Should return "File or directory does not exist" when trying to list directories of an unexistent foo directory', function() {
      const fileSystem = new FileSystem();
      const terminal = new Terminal(fileSystem);

      terminal.ls('foo');

      expect(console.log.calledWith('File or directory does not exist')).to.be.true;
    });

    it('Should return all the directories and files when calling ls with the -r flag', function() {
      const fileSystem = new FileSystem();
      const terminal = new Terminal(fileSystem);

      terminal.mkdir('foo');
      terminal.mkdir('bar');
      terminal.touch('root-1.txt');
      terminal.touch('foo/foo-1.txt');
      terminal.touch('foo/foo-2.txt');
      terminal.touch('bar/bar-1.txt');
      terminal.ls('-r');

      expect(console.log.calledWith('/root')).to.be.true;
      expect(console.log.calledWith('root-1.txt')).to.be.true;
      expect(console.log.calledWith('foo')).to.be.true;
      expect(console.log.calledWith('bar')).to.be.true;
      expect(console.log.calledWith('/root/foo')).to.be.true;
      expect(console.log.calledWith('foo/foo-1.txt'));
      expect(console.log.calledWith('foo/foo-2.txt'));
      expect(console.log.calledWith('/root/bar')).to.be.true;
      expect(console.log.calledWith('bar/bar-1.txt'));
    });

  });

  describe('Terminal cd: go to directory', function() {
    it('Should return "/root/home" as the new current directory after going to "home" directory', function() {
      const fileSystem = new FileSystem();
      const terminal = new Terminal(fileSystem);

      terminal.mkdir('home');
      terminal.cd('home');
      terminal.pwd();

      expect(console.log.calledWith('/root/home')).to.be.true;
    });

    it('Should return "/root" as the current directory when calling cd with "." parameter', function() {
      const fileSystem = new FileSystem();
      const terminal = new Terminal(fileSystem);

      terminal.cd('.');
      terminal.pwd();

      expect(console.log.calledWith('/root')).to.be.true;
    });

    it('Should return "guille" as one of the directories when go to "home" directory', function() {
      const fileSystem = new FileSystem();
      const terminal = new Terminal(fileSystem);

      terminal.mkdir('home');
      terminal.mkdir('home/guille');
      terminal.cd('home');
      terminal.ls();

      expect(console.log.calledWith('guille')).to.be.true;
    });

    it('Should return "/root" as the current directory after going to home and going back to root using "../"', function() {
      const fileSystem = new FileSystem();
      const terminal = new Terminal(fileSystem);

      terminal.mkdir('home');
      terminal.cd('home');
      terminal.cd('../');
      terminal.pwd();

      expect(console.log.calledWith('/root')).to.be.true;
    });

    it('Should return "/root" as the current directory after going to home and going back to root using "home/.." in one step', function() {
      const fileSystem = new FileSystem();
      const terminal = new Terminal(fileSystem);

      terminal.mkdir('home');
      terminal.cd('home/..');
      terminal.pwd();

      expect(console.log.calledWith('/root')).to.be.true;
    });

    it('Should return "/root" as the current directory after going to guille and going back to root using "../.." in one step', function() {
      const fileSystem = new FileSystem();
      const terminal = new Terminal(fileSystem);

      terminal.mkdir('home/guille');
      terminal.cd('home/guille');
      terminal.cd('../../');
      terminal.pwd();

      expect(console.log.calledWith('/root')).to.be.true;
    });

    it('Should return "File or directory does not exist" when trying to go to an unexistent foo directory', function() {
      const fileSystem = new FileSystem();
      const terminal = new Terminal(fileSystem);

      terminal.cd('foo');

      expect(console.log.calledWith('File or directory does not exist')).to.be.true;
    });
  });

  describe('Terminal mkdir: create directory', function() {
    it('Should create a new "foo" directory in the root', function() {
      const fileSystem = new FileSystem();
      const terminal = new Terminal(fileSystem);

      terminal.mkdir('foo');
      terminal.ls();

      expect(console.log.calledWith('foo')).to.be.true;
    });

    it('Should print "File or directory does not exist" when trying to create a new directory in an unexistent directory', function() {
      const fileSystem = new FileSystem();
      const terminal = new Terminal(fileSystem);

      terminal.mkdir('unexistent/bar');

      expect(console.log.calledWith('File or directory does not exist')).to.be.true;
    });

    it('Should print "File already exists" when trying to create a directory that already exists', function() {
      const fileSystem = new FileSystem();
      const terminal = new Terminal(fileSystem);

      terminal.mkdir('foo');
      terminal.mkdir('foo');

      expect(console.log.calledWith('File already exists')).to.be.true;
    });
  });

  describe('Terminal touch: create regular file', function() {
    it('Should create a new "foo.txt" file in the root', function() {
      const fileSystem = new FileSystem();
      const terminal = new Terminal(fileSystem);

      terminal.touch('foo.txt');
      terminal.ls();

      expect(console.log.calledWith('foo.txt')).to.be.true;
    });

    it('Should print "File already exists" when trying to create a file that already exists', function() {
      const fileSystem = new FileSystem();
      const terminal = new Terminal(fileSystem);

      terminal.mkdir('foo.txt');
      terminal.mkdir('foo.txt');

      expect(console.log.calledWith('File already exists')).to.be.true;
    });
  });
})
