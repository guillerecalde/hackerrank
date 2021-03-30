const pathHelper = require('path');

process.stdin.resume();
process.stdin.setEncoding("ascii");
var input = "";

const FileNameMaxLength = 100;

const FileTypes = {
    Directory: 'directory',
    RegularFile: 'regular',
};

const FileSystemAliases = {
    Separator: '/',
    Root: '/root',
    ParentDirectory: '..',
    CurrentDirectory: '.',
};

class File {
    constructor(type, name) {
        this.type = type;
        this.name = name;
        this.parent = null;
        this.children = {};
    }
}

class FileSystem {
    constructor() {
        this.root = new File(FileTypes.Directory, FileSystemAliases.Root);
    }

    getFileFullPath(file) {
        let fullPath = file.name;
        let fileParent = file.parent;

        // If the given file references to the Root, return the Root path.
        if (fileParent === null) return FileSystemAliases.Root;

        while (fileParent !== null) {
            fullPath = fileParent.name + FileSystemAliases.Separator + fullPath;
            fileParent = fileParent.parent;
        }
        return fullPath;
    }

    readDir(path, root, options = {}) {
        const exploreDir = (directory, result) => {
            const path = this.getFileFullPath(directory);
            result[path] = Object.keys(directory.children);

            // If the "recursive" option is true, we have to
            // explore the current directory's children.
            if (options.recursive) {
                Object.values(directory.children)
                    .filter(child => child.type === FileTypes.Directory)
                    .forEach(subDirectory => exploreDir(subDirectory, result));
            }

            return result;
        };

        const dir = this.getFile(path, root);
        return exploreDir(dir, {});
    }

    /**
     * @TODO: handle mkdir foo/bar
     */
    createDir(path, root) {
        if (!root.children[path]) {
            root.children[path] = new File(FileTypes.Directory, path);
            root.children[path].parent = root;
        } else {
            console.log('Directory already exists');
        }
    }

    /**
     * @TODO: handle touch foo/bar.txt
     */
    createFile(path, root) {
        if (!root.children[path]) {
            root.children[path] = new File(FileTypes.RegularFile, path);
            root.children[path].parent = root;
        } else {
            console.log('File already exists');
        }
    }

    getFile(path, root) {
        // Auxiliar function to walk through the file system tree.
        const findFile = (directories, currentFile) => {
            if (directories.length === 0 || !currentFile) {
                // If the directories list is empty, that means that we
                // finally found the file, so we can return the currentFile.
                // If currentFile is empty we return the root directory
                // because that is the way Unix behaves.
                return currentFile || this.root;
            } else {
                // The current directory is the first element of the list.
                const [currentDir, ...pendingDirs] = directories;

                // We handle the ".." and "." aliases, so check if the
                // currentDir is an alias.
                if (currentDir === FileSystemAliases.CurrentDirectory) {
                    return findFile(pendingDirs, currentFile);
                } else if (currentDir === FileSystemAliases.ParentDirectory) {
                    return findFile(pendingDirs, currentFile.parent);
                }

                // Check if the current directory exists.
                if (currentFile.children[currentDir]) {
                    return findFile(pendingDirs, currentFile.children[currentDir]);
                } else {
                    throw new Error('File or directory does not exist');
                }
            }
        }

        const dirList = path.split(FileSystemAliases.Separator).filter(Boolean);
        return findFile(dirList, root || this.root);
    }
}

class Terminal {
    constructor(fileSystem) {
        this.fileSystem = fileSystem;
        this.currentDirectory = fileSystem.root;
    }

    pwd() {
        const currrentPath = this.fileSystem.getFileFullPath(this.currentDirectory);
        console.log(currrentPath);
    }

    ls(param = FileSystemAliases.CurrentDirectory) {
        const options = { recursive: param === '-r' };
        const path = options.recursive ? FileSystemAliases.CurrentDirectory : param;
        const root = this._getRootByPath(path);

        let list = {};
        try {
            list = this.fileSystem.readDir(path, root, options);
        } catch(error) {
            console.log(error.message);
        }

        Object.keys(list)
            .forEach(filePath => {
                if (options.recursive) console.log(filePath);
                list[filePath].forEach(file => console.log(file));
            });
    }

    mkdir(dirName) {
        if (dirName.length > FileNameMaxLength) {
            return console.log('Invalid File or Folder Name');
        }

        const root = this._getRootByPath(dirName);

        try {
            this.fileSystem.createDir(dirName, root);
        } catch(error) {
            console.log(error.message);
        }
    }

    cd(dirName) {
        if (!dirName) return;

        const root = this._getRootByPath(dirName);

        try {
            this.currentDirectory = this.fileSystem.getFile(dirName, root);
        } catch(error) {
            console.log(error.message);
        }
    }

    touch(dirName) {
        if (dirName.length > FileNameMaxLength) {
            return console.log('Invalid File or Folder Name');
        }

        const root = this._getRootByPath(dirName);
        try {
            this.fileSystem.createFile(dirName, root);
        } catch(error) {
            console.log(error.message);
        }
    }

    execute(commandInput) {
        const [commandName, parameter] = commandInput.split(' ');

        switch(commandName) {
            case 'pwd':
                return this.pwd();
            case 'ls':
                return this.ls(parameter);
            case 'mkdir':
                return this.mkdir(parameter);
            case 'cd':
                return this.cd(parameter);
            case 'touch':
                return this.touch(parameter);
            case 'quit':
                process.exit(0);
            default:
                console.log('Unrecognized command');
        }
    }

    _getRootByPath(path) {
        return pathHelper.isAbsolute(path) ? this.fileSystem.root : this.currentDirectory;
    }
}

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
